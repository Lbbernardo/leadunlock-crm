// POST /api/admin/add-credit
// Agrega crédito al balance de un cliente (solo admin).

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { clientId, amount } = req.body
  const amountNum = Number(amount)

  if (!clientId || !amountNum || amountNum <= 0) {
    return res.status(400).json({ error: 'Invalid parameters' })
  }

  const { data: client, error: fetchErr } = await supabase
    .from('clients')
    .select('balance')
    .eq('id', clientId)
    .single()

  if (fetchErr || !client) return res.status(404).json({ error: 'Client not found' })

  const newBalance = (client.balance || 0) + amountNum

  const { error: updateErr } = await supabase
    .from('clients')
    .update({ balance: newBalance })
    .eq('id', clientId)

  if (updateErr) return res.status(500).json({ error: 'Failed to update balance' })

  return res.status(200).json({ success: true, new_balance: newBalance })
}
