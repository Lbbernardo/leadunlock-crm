// Vercel Serverless Function — POST /api/webhook
// Receives leads from: Meta Ads, Zapier, Make, n8n, GoHighLevel
//
// Required headers:
//   x-webhook-token: <WEBHOOK_SECRET from .env>
//
// client_id resolution (in order of priority):
//   1. URL param:      /api/webhook?client=CLIENT_ID
//   2. Body field:     { client_id: "CLIENT_ID", ... }
//   3. Campaign name:  looks up campaigns table by campaign_name → client_id
//
// Body (JSON):
//   full_name, phone, email, city, state,
//   campaign_name, product_interest, source

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

async function sendSMS(to, message) {
  if (!to || !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_PHONE_NUMBER) return
  const phone = to.replace(/\D/g, '')
  if (phone.length < 10) return
  const toFormatted = `+${phone.replace(/^\+/, '').startsWith('1') ? phone.replace(/^\+/, '') : '1' + phone.replace(/^\+/, '')}`
  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ From: process.env.TWILIO_PHONE_NUMBER, To: toFormatted, Body: message }).toString(),
    }
  )
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers['x-webhook-token']
  if (token !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const {
    full_name,
    phone,
    email,
    city,
    state,
    campaign_name,
    product_interest,
    source,
    cost,
    client_id: bodyClientId,
  } = req.body

  if (!full_name) {
    return res.status(400).json({ error: 'full_name is required' })
  }

  // Resolve client_id: URL param → body → campaign name lookup
  let client_id = req.query.client || bodyClientId
  let campaign_id = null

  if (!client_id && campaign_name) {
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id, client_id')
      .eq('name', campaign_name)
      .eq('is_active', true)
      .single()

    if (campaign) {
      client_id = campaign.client_id
      campaign_id = campaign.id
    }
  }

  if (!client_id) {
    return res.status(400).json({ error: 'Could not resolve client. Provide ?client=ID, client_id in body, or register the campaign name in the admin panel.' })
  }

  // Verify client exists
  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .select('id')
    .eq('id', client_id)
    .single()

  if (clientErr || !client) {
    return res.status(404).json({ error: 'Client not found' })
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      client_id,
      full_name,
      phone: phone || null,
      email: email || null,
      city: city || null,
      state: state || null,
      campaign_name: campaign_name || null,
      campaign_id: campaign_id || null,
      product_interest: product_interest || null,
      source: source || 'webhook',
      is_locked: true,
      status: 'new',
      acquisition_cost: cost ? parseFloat(cost) : 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Lead insert error:', error)
    return res.status(500).json({ error: 'Failed to create lead' })
  }

  // Notificación al admin
  if (process.env.ADMIN_PHONE) {
    const nameParts = (full_name || '').trim().split(' ')
    const maskedName = nameParts[0]?.[0] ? nameParts[0][0] + '. ' + (nameParts[1] || '') : full_name
    const adminMsg = `LeadUnlock — Lead nuevo\nCliente: ${client_id}\nNombre: ${maskedName.trim()}\nFuente: ${source || 'webhook'}\n\nunlocklead.click/admin`
    await sendSMS(process.env.ADMIN_PHONE, adminMsg).catch(() => {})
  }

  return res.status(201).json({ success: true, lead_id: lead.id })
}
