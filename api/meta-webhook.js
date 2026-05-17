// GET /api/meta-webhook — verificación del webhook por Meta
// POST /api/meta-webhook — recibe leads de cualquier formulario de Meta Ads

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
      from: 'LeadUnlock <notificaciones@unlocklead.click>',
      to: process.env.ADMIN_EMAIL,
      subject,
      html,
    }),
  }).catch(e => console.error('Email error:', e.message))
}

async function sendSMS(to, message) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_PHONE_NUMBER) return
  if (!to) return
  const phone = to.replace(/\D/g, '')
  if (phone.length < 10) return
  const toFormatted = `+${phone.startsWith('1') ? phone : '1' + phone}`
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
  ).catch(e => console.error('SMS error:', e.message))
}

async function processLead(lead_id, form_id) {
  // Obtener datos del lead desde Facebook Graph API
  const graphRes = await fetch(
    `https://graph.facebook.com/v19.0/${lead_id}?fields=field_data&access_token=${process.env.META_PAGE_ACCESS_TOKEN}`
  )
  const graphData = await graphRes.json()

  if (graphData.error) {
    console.error('Facebook Graph API error:', graphData.error)
    return
  }

  const fields = {}
  for (const field of graphData.field_data || []) {
    fields[field.name] = field.values?.[0] || ''
  }

  const full_name = fields.full_name
    || `${fields.first_name || ''} ${fields.last_name || ''}`.trim()
    || 'Sin nombre'

  // Buscar campaña por form_id
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, client_id, cost_per_lead')
    .eq('meta_form_id', String(form_id))
    .eq('is_active', true)
    .single()

  if (!campaign) {
    console.error(`No campaign found for form_id: ${form_id}`)
    return
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
    acquisition_cost: campaign.cost_per_lead || 0,
  })

  if (error) { console.error('Lead insert error:', error); return }

  const { data: client } = await supabase
    .from('clients')
    .select('phone, company_name')
    .eq('id', campaign.client_id)
    .single()

  const nameParts = full_name.trim().split(' ')
  const maskedName = nameParts[0][0] + '. ' + (nameParts[1] || '')
  const clientLabel = client?.company_name || 'Cliente desconocido'

  if (client?.phone) {
    await sendSMS(client.phone, `LeadUnlock: Tienes un nuevo lead!\nNombre: ${maskedName.trim()}\n\nEntra a unlocklead.click para ver los datos completos y desbloquearlo.`)
  }

  if (process.env.ADMIN_PHONE) {
    await sendSMS(process.env.ADMIN_PHONE, `LeadUnlock — Lead nuevo\nCliente: ${clientLabel}\nNombre: ${maskedName.trim()}\n\nunlocklead.click/admin`)
  }

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

  console.log(`Lead procesado: ${full_name} → cliente ${campaign.client_id}`)
}

export default async function handler(req, res) {
  // Verificación del webhook (Meta hace GET una sola vez)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
      console.log('Meta webhook verificado correctamente')
      return res.status(200).send(challenge)
    }
    return res.status(403).json({ error: 'Forbidden' })
  }

  // Recibir leads (Meta hace POST cada vez que llega un lead)
  if (req.method === 'POST') {
    // Responder 200 inmediatamente para que Meta no reintente
    res.status(200).json({ received: true })

    for (const entry of req.body?.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'leadgen') {
          const { leadgen_id, form_id } = change.value
          processLead(leadgen_id, form_id).catch(e => console.error('processLead error:', e))
        }
      }
    }
    return
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
