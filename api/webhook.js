// Vercel Serverless Function — POST /api/webhook
// Recibe leads de: Zapier, Make, n8n, GoHighLevel → los mete al pool
//
// Required headers:
//   x-webhook-token: <WEBHOOK_SECRET from .env>
//
// Categoría (en orden de prioridad):
//   1. Body field:     { category: "Gastos finales", ... }
//   2. Campaign name:  busca la campaña por campaign_name → su interest_category
//
// Body (JSON):
//   full_name, phone, email, city, state,
//   campaign_name, category, product_interest, source, cost

import { createClient } from '@supabase/supabase-js'
import { addPoolLead, notifyPoolLead } from './_lib/pool.js'

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
    category,
    product_interest,
    source,
    cost,
  } = req.body

  if (!full_name) {
    return res.status(400).json({ error: 'full_name is required' })
  }

  let campaign = null
  if (campaign_name) {
    const { data } = await supabase
      .from('campaigns')
      .select('id, interest_category, lead_interest, cost_per_lead')
      .eq('name', campaign_name)
      .eq('is_active', true)
      .maybeSingle()
    campaign = data
  }

  let lead
  try {
    lead = await addPoolLead(supabase, {
      full_name,
      phone,
      email,
      city,
      state,
      campaign_id: campaign?.id,
      campaign_name,
      category: category || campaign?.interest_category,
      product_interest: product_interest || campaign?.lead_interest,
      source: source || 'webhook',
      acquisition_cost: cost ? parseFloat(cost) : (campaign?.cost_per_lead || 0),
    })
  } catch (error) {
    console.error('Lead insert error:', error)
    return res.status(500).json({ error: 'Failed to create lead' })
  }

  const notified = await notifyPoolLead(supabase, lead)

  return res.status(201).json({ success: true, lead_id: lead.id, notified })
}
