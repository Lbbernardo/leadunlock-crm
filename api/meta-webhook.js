// Vercel Serverless Function — Meta Lead Ads Webhook
//
// GET  /api/meta-webhook  — Verificación de webhook por Meta
// POST /api/meta-webhook  — Notificación de nuevo lead desde Meta Lead Ads
//
// Env vars requeridas:
//   META_VERIFY_TOKEN        — token que configuras en la Facebook App
//   META_PAGE_ACCESS_TOKEN   — token de acceso de la página de Facebook (long-lived)
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleVerification(req, res)
  }
  if (req.method === 'POST') {
    return handleLead(req, res)
  }
  return res.status(405).json({ error: 'Method not allowed' })
}

function handleVerification(req, res) {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return res.status(200).send(challenge)
  }
  return res.status(403).json({ error: 'Verification failed' })
}

async function handleLead(req, res) {
  const body = req.body

  if (body.object !== 'page') {
    return res.status(200).json({ received: true })
  }

  const changes = body.entry?.[0]?.changes
  if (!changes?.length) return res.status(200).json({ received: true })

  const leadChange = changes.find(c => c.field === 'leadgen')
  if (!leadChange) return res.status(200).json({ received: true })

  const { form_id, leadgen_id } = leadChange.value

  // Lookup campaign by meta_form_id → get client_id
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, client_id')
    .eq('meta_form_id', form_id)
    .eq('is_active', true)
    .single()

  if (!campaign) {
    console.error(`No campaign found for form_id: ${form_id}`)
    return res.status(200).json({ received: true, warning: 'No campaign mapped for this form_id' })
  }

  // Fetch lead data from Facebook Graph API
  const graphUrl = `https://graph.facebook.com/v19.0/${leadgen_id}?fields=field_data&access_token=${process.env.META_PAGE_ACCESS_TOKEN}`
  const graphRes = await fetch(graphUrl)
  const graphData = await graphRes.json()

  if (graphData.error) {
    console.error('Facebook Graph API error:', graphData.error)
    return res.status(200).json({ received: true, warning: 'Could not fetch lead data from Facebook' })
  }

  // Map field_data array to object
  const fields = {}
  for (const field of graphData.field_data || []) {
    fields[field.name] = field.values?.[0] || ''
  }

  const full_name = fields.full_name
    || `${fields.first_name || ''} ${fields.last_name || ''}`.trim()
    || 'Sin nombre'

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

  return res.status(200).json({ success: true })
}
