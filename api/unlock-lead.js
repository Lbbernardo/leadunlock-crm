// POST /api/unlock-lead
// Desbloquea un lead del pool con el crédito del cliente.
// 1. Aparta el lead (si otro ya lo tomó → 409)  2. Descuenta crédito  3. Asigna el lead

import { createClient } from '@supabase/supabase-js'
import { requireClientOwner } from './_lib/auth.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

async function release(leadId, clientId) {
  await supabase.from('leads')
    .update({ reserved_by: null, reserved_until: null })
    .eq('id', leadId).eq('reserved_by', clientId)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { leadId, clientId, expectedPrice } = req.body
  if (!leadId || !clientId) return res.status(400).json({ error: 'Missing leadId or clientId' })
  if (!await requireClientOwner(req, res, supabase, clientId)) return

  const { data: client } = await supabase
    .from('clients').select('id, balance, status').eq('id', clientId).single()
  if (!client) return res.status(404).json({ error: 'Client not found' })
  // payment_required = una tarjeta fue rechazada; puede seguir usando crédito o reintentar
  if (!['active', 'payment_required'].includes(client.status)) return res.status(403).json({ error: 'account_inactive' })

  const { data: price, error: reserveErr } = await supabase
    .rpc('reserve_pool_lead', { p_lead: leadId, p_client: clientId })
  if (reserveErr) {
    console.error('reserve error:', reserveErr)
    return res.status(500).json({ error: 'Failed to process unlock' })
  }
  if (price == null) return res.status(409).json({ error: 'lead_taken' })
  // El precio sube a los 30 min: nunca cobrar más de lo que el cliente vio en pantalla
  if (expectedPrice != null && price > Number(expectedPrice)) {
    await release(leadId, clientId)
    return res.status(409).json({ error: 'price_changed', price })
  }

  const { data: newBalance, error: deductErr } = await supabase
    .rpc('deduct_balance', { p_client: clientId, p_amount: price })
  if (deductErr || newBalance == null) {
    await release(leadId, clientId)
    if (deductErr) console.error('deduct error:', deductErr)
    return res.status(402).json({ error: 'insufficient_balance', balance: client.balance || 0, required: price })
  }

  const { data: claimed } = await supabase
    .rpc('claim_pool_lead', { p_lead: leadId, p_client: clientId })
  if (!claimed) {
    // La reserva expiró y otro lo tomó: devolver el crédito
    await supabase.rpc('deduct_balance', { p_client: clientId, p_amount: -price })
    return res.status(409).json({ error: 'lead_taken' })
  }

  const { error: recordErr } = await supabase.from('lead_unlocks')
    .insert({ client_id: clientId, lead_id: leadId, amount_paid: price, payment_method: 'credit' })
  if (recordErr) console.error('Unlock record error:', recordErr)

  return res.status(200).json({ success: true, new_balance: newBalance, amount: price })
}
