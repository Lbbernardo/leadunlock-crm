// POST /api/make-lead
// Recibe lead_id y form_id desde Make, obtiene datos de Facebook Graph API,
// enruta al cliente correcto por meta_form_id en campaigns,
// y envía notificación WhatsApp al cliente via Twilio.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

async function sendEmail(subject, html) {
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'LeadUnlock <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL,
      subject,
      html,
    }),
  }).then(r => r.json()).then(d => {
    if (d.id) console.log('Email enviado:', d.id)
    else console.error('Email error:', JSON.stringify(d))
  }).catch(e => console.error('Email fetch error:', e.message))
}

async function sendSMS(to, message) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_PHONE_NUMBER) {
    console.error('SMS: faltan credenciales Twilio')
    return
  }
  if (!to) { console.error('SMS: número destino vacío'); return }
  const phone = to.replace(/\D/g, '')
  if (phone.length < 10) { console.error('SMS: número muy corto:', phone); return }
  const toFormatted = `+${phone.replace(/^\+/, '').startsWith('1') ? phone.replace(/^\+/, '') : '1' + phone.replace(/^\+/, '')}`
  console.log(`SMS: enviando de ${process.env.TWILIO_PHONE_NUMBER} a ${toFormatted}`)
  const res = await fetch(
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
  const data = await res.json()
  if (data.error_code) console.error('SMS error Twilio:', data.error_code, data.message)
  else console.log('SMS enviado, SID:', data.sid)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { lead_id, form_id } = req.body

  if (!lead_id || !form_id) {
    return res.status(400).json({ error: 'lead_id and form_id are required' })
  }

  // Fetch lead field data from Facebook Graph API
  const graphUrl = `https://graph.facebook.com/v19.0/${lead_id}?fields=field_data&access_token=${process.env.META_PAGE_ACCESS_TOKEN}`
  const graphRes = await fetch(graphUrl)
  const graphData = await graphRes.json()

  if (graphData.error) {
    console.error('Facebook Graph API error:', graphData.error)
    return res.status(400).json({ error: 'Could not fetch lead from Facebook', detail: graphData.error.message })
  }

  // Map field_data array to object
  const fields = {}
  for (const field of graphData.field_data || []) {
    fields[field.name] = field.values?.[0] || ''
  }

  const full_name = fields.full_name
    || `${fields.first_name || ''} ${fields.last_name || ''}`.trim()
    || 'Sin nombre'

  // Lookup campaign by meta_form_id
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, client_id')
    .eq('meta_form_id', String(form_id))
    .eq('is_active', true)
    .single()

  if (!campaign) {
    console.error(`No campaign found for form_id: ${form_id}`)
    return res.status(404).json({ error: `No campaign registered for form_id: ${form_id}` })
  }

  const { error } = await supabase.from('leads').insert({
    client_id: campaign.client_id,
    campaign_id: campaign.id,
    full_name,
    phone: fields.phone_number || fields.phone || null,
    email: fields.email || null,
    city: fields.city || null,
    state: fields.state || null,
    source: 'Meta Ads',
    is_locked: true,
    status: 'new',
    acquisition_cost: 0,
  })

  if (error) {
    console.error('Lead insert error:', error)
    return res.status(500).json({ error: 'Failed to create lead' })
  }

  // Fetch client phone for WhatsApp notification
  const { data: client } = await supabase
    .from('clients')
    .select('phone, company_name')
    .eq('id', campaign.client_id)
    .single()

  const nameParts = full_name.trim().split(' ')
  const maskedName = nameParts[0][0] + '. ' + (nameParts[1] || '')
  const clientLabel = client?.company_name || 'Cliente desconocido'

  // Notificación al cliente
  if (client?.phone) {
    const msg = `LeadUnlock: Tienes un nuevo lead!\nNombre: ${maskedName.trim()}\n\nEntra a unlocklead.click para ver los datos completos y desbloquearlo.`
    await sendSMS(client.phone, msg)
  }

  // Notificación al admin — SMS
  if (process.env.ADMIN_PHONE) {
    const adminMsg = `LeadUnlock — Lead nuevo\nCliente: ${clientLabel}\nNombre: ${maskedName.trim()}\n\nunlocklead.click/admin`
    await sendSMS(process.env.ADMIN_PHONE, adminMsg)
  }

  // Notificación al admin — Email
  await sendEmail(
    `Lead nuevo — ${clientLabel}`,
    `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
      <h2 style="color:#16a34a;margin:0 0 16px">🔔 Lead nuevo</h2>
      <p style="margin:0 0 8px;color:#475569"><strong>Cliente:</strong> ${clientLabel}</p>
      <p style="margin:0 0 8px;color:#475569"><strong>Nombre:</strong> ${full_name}</p>
      <p style="margin:0 0 24px;color:#475569"><strong>Fuente:</strong> Meta Ads</p>
      <a href="https://unlocklead.click/admin" style="background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Ver en el dashboard</a>
    </div>`
  )

  return res.status(201).json({ success: true })
}
