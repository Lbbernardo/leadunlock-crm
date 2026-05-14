// POST /api/unlock-lead
// Verifica el balance del cliente, descuenta el crédito y desbloquea el lead.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { leadId, clientId } = req.body
  if (!leadId || !clientId) return res.status(400).json({ error: 'Missing leadId or clientId' })

  const [{ data: client, error: clientErr }, { data: lead, error: leadErr }] = await Promise.all([
    supabase.from('clients').select('id, balance, lead_price').eq('id', clientId).single(),
    supabase.from('leads').select('id, is_locked, client_id, acquisition_cost').eq('id', leadId).single(),
  ])

  if (clientErr || !client) return res.status(404).json({ error: 'Client not found' })
  if (leadErr || !lead) return res.status(404).json({ error: 'Lead not found' })
  if (lead.client_id !== clientId) return res.status(403).json({ error: 'Forbidden' })
  if (!lead.is_locked) return res.status(200).json({ success: true, already_unlocked: true })

  const acqCost = lead.acquisition_cost || 0
  const price = acqCost > 0
    ? Math.max(Math.round(acqCost * 3), 12)
    : (client.lead_price || null)
  if (!price) return res.status(400).json({ error: 'no_price_configured' })
  const balance = client.balance || 0

  if (balance < price) {
    return res.status(402).json({ error: 'insufficient_balance', balance, required: price })
  }

  const newBalance = balance - price

  const [unlockRes, balanceRes, recordRes] = await Promise.all([
    supabase.from('leads').update({ is_locked: false }).eq('id', leadId),
    supabase.from('clients').update({ balance: newBalance }).eq('id', clientId),
    supabase.from('lead_unlocks').insert({ client_id: clientId, lead_id: leadId, amount_paid: price, payment_method: 'credit' }),
  ])

  if (unlockRes.error || balanceRes.error || recordRes.error) {
    console.error('Unlock errors:', unlockRes.error, balanceRes.error, recordRes.error)
    return res.status(500).json({ error: 'Failed to process unlock' })
  }

  return res.status(200).json({ success: true, new_balance: newBalance })
}
