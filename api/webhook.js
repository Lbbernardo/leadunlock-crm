// Vercel Serverless Function — POST /api/webhook
// Receives leads from: Meta Ads, Zapier, Make, n8n, GoHighLevel
//
// Required headers:
//   x-webhook-token: <WEBHOOK_SECRET from .env>
//
// client_id can be passed two ways:
//   1. URL param:  /api/webhook?client=CLIENT_ID   ← recommended for multi-client
//   2. Body field: { client_id: "CLIENT_ID", ... }
//
// Body (JSON):
//   full_name, phone, email, city, state,
//   campaign_name, product_interest, source

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

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
    client_id: bodyClientId,
  } = req.body

  const client_id = req.query.client || bodyClientId

  if (!full_name || !client_id) {
    return res.status(400).json({ error: 'full_name and client_id are required' })
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
      product_interest: product_interest || null,
      source: source || 'webhook',
      is_locked: true,
      status: 'new',
    })
    .select()
    .single()

  if (error) {
    console.error('Lead insert error:', error)
    return res.status(500).json({ error: 'Failed to create lead' })
  }

  return res.status(201).json({ success: true, lead_id: lead.id })
}
