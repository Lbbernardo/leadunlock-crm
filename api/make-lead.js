// POST /api/make-lead
// Recibe lead_id y form_id desde Make, obtiene datos de Facebook Graph API,
// mete el lead al pool (categoría de la campaña) y avisa a los clientes que coinciden.

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

  const { lead_id, form_id } = req.body

  if (!lead_id || !form_id) {
    return res.status(400).json({ error: 'lead_id and form_id are required' })
  }

  let metaLead
  try {
    metaLead = await fetchMetaLead(lead_id)
  } catch (err) {
    return res.status(400).json({ error: 'Could not fetch lead from Facebook', detail: err.message })
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

  const notified = await notifyPoolLead(supabase, lead)
  console.log(`Lead al pool: ${lead.id} (${lead.category} · ${lead.state_code}) → ${notified} clientes avisados`)

  return res.status(201).json({ success: true, lead_id: lead.id, notified })
}
