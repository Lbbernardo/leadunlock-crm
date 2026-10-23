// POST /api/make-lead
// Recibe el lead desde Make, mete el lead al pool (categoría de la campaña) y avisa a los clientes que coinciden.
// Modo directo (recomendado): Make manda los datos del lead + header x-webhook-token. No usa nuestra app de Meta.
// Modo viejo: solo lead_id + form_id → busca los datos en Facebook Graph API con META_PAGE_ACCESS_TOKEN.

import { createClient } from '@supabase/supabase-js'
import { fetchMetaLead, findCampaignByForm, addPoolLead, notifyPoolLead } from './_lib/pool.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { lead_id, form_id, full_name, first_name, last_name, phone, email, city, state, zip_code } = req.body || {}

  if (!lead_id || !form_id) {
    return res.status(400).json({ error: 'lead_id and form_id are required' })
  }

  let metaLead
  if (full_name || first_name || phone || email) {
    // Datos directos desde Make: exigir token para que nadie meta leads falsos
    if (req.headers['x-webhook-token'] !== process.env.WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    metaLead = {
      full_name: full_name || `${first_name || ''} ${last_name || ''}`.trim() || 'Sin nombre',
      phone: phone || null,
      email: email || null,
      city: city || null,
      state: state || null,
      zip_code: zip_code || null,
    }
  } else {
    try {
      metaLead = await fetchMetaLead(lead_id)
    } catch (err) {
      return res.status(400).json({ error: 'Could not fetch lead from Facebook', detail: err.message })
    }
  }

  const campaign = await findCampaignByForm(supabase, form_id)
  if (!campaign) {
    console.error(`No campaign found for form_id: ${form_id}`)
    return res.status(404).json({ error: `No campaign registered for form_id: ${form_id}` })
  }

  let lead
  try {
    lead = await addPoolLead(supabase, {
      ...metaLead,
      meta_lead_id: String(lead_id),
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      category: campaign.interest_category,
      product_interest: campaign.lead_interest,
      source: 'Meta Ads',
      acquisition_cost: campaign.cost_per_lead,
      default_state: campaign.default_state,
    })
  } catch (error) {
    console.error('Lead insert error:', error)
    return res.status(500).json({ error: 'Failed to create lead' })
  }

  if (!lead) return res.status(200).json({ success: true, duplicate: true })

  const notified = await notifyPoolLead(supabase, lead)
  console.log(`Lead al pool: ${lead.id} (${lead.category} · ${lead.state_code}) → ${notified} clientes avisados`)

  return res.status(201).json({ success: true, lead_id: lead.id, notified })
}
