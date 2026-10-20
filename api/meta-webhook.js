// GET /api/meta-webhook — verificación del webhook por Meta
// POST /api/meta-webhook — recibe leads de cualquier formulario de Meta Ads y los mete al pool

import { createClient } from '@supabase/supabase-js'
import { fetchMetaLead, findCampaignByForm, addPoolLead, notifyPoolLead } from './_lib/pool.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

async function processLead(leadgenId, formId) {
  const metaLead = await fetchMetaLead(leadgenId)

  const campaign = await findCampaignByForm(supabase, formId)
  if (!campaign) {
    console.error(`No campaign found for form_id: ${formId}`)
    return
  }

  const lead = await addPoolLead(supabase, {
    ...metaLead,
    meta_lead_id: String(leadgenId),
    campaign_id: campaign.id,
    campaign_name: campaign.name,
    category: campaign.interest_category,
    product_interest: campaign.lead_interest,
    source: 'Meta Ads',
    acquisition_cost: campaign.cost_per_lead,
    default_state: campaign.default_state,
  })

  if (!lead) {
    console.log(`Lead de Meta ${leadgenId} ya existía, se ignora`)
    return
  }

  const notified = await notifyPoolLead(supabase, lead)
  console.log(`Lead al pool: ${lead.id} (${lead.category} · ${lead.state_code}) → ${notified} clientes avisados`)
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

  // Recibir leads (Meta hace POST cada vez que llega un lead).
  // Se procesa antes de responder: si se responde primero, Vercel puede congelar la función.
  if (req.method === 'POST') {
    for (const entry of req.body?.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'leadgen') {
          const { leadgen_id, form_id } = change.value
          await processLead(leadgen_id, form_id).catch(e => console.error('processLead error:', e))
        }
      }
    }
    return res.status(200).json({ received: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
