// POST /api/make-lead
// Recibe lead_id y form_id desde Make, obtiene datos de Facebook Graph API,
// enruta al cliente correcto por meta_form_id en campaigns,
// y envía notificación WhatsApp al cliente via Twilio.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

async function sendWhatsApp(to, message) {
  if (!to) return
  const phone = to.replace(/\D/g, '')
  if (phone.length < 10) return

  const from = 'whatsapp:+14155238886'
  const toFormatted = `whatsapp:+${phone.startsWith('1') ? phone : '1' + phone}`

  const body = new URLSearchParams({
    From: from,
    To: toFormatted,
    Body: message,
  })

  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    }
  )
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

  if (client?.phone) {
    const msg = `LeadUnlock: Nuevo lead recibido!\nNombre: ${full_name}\nTel: ${fields.phone_number || fields.phone || 'N/A'}\nEmail: ${fields.email || 'N/A'}\nVe a unlocklead.click para verlo.`
    await sendWhatsApp(client.phone, msg)
  }

  return res.status(201).json({ success: true })
}
