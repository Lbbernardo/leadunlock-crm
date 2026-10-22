// POST /api/stripe/charge-lead
// Cobra un lead del pool con la tarjeta guardada del cliente (cuando no tiene crédito).
// 1. Aparta el lead (si otro ya lo tomó → 409, sin cobrar)  2. Cobra  3. Asigna el lead

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { requireClientOwner } from '../_lib/auth.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function release(leadId, clientId) {
  await supabase.from('leads')
    .update({ reserved_by: null, reserved_until: null })
    .eq('id', leadId).eq('reserved_by', clientId)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { leadId, clientId } = req.body
  if (!leadId || !clientId) return res.status(400).json({ error: 'leadId and clientId required' })
  if (!await requireClientOwner(req, res, supabase, clientId)) return

  const { data: client } = await supabase
    .from('clients').select('id, status, stripe_customer_id').eq('id', clientId).single()
  if (!client) return res.status(404).json({ error: 'Client not found' })
  // payment_required = una tarjeta fue rechazada; puede seguir usando crédito o reintentar
  if (!['active', 'payment_required'].includes(client.status)) return res.status(403).json({ error: 'account_inactive' })
  if (!client.stripe_customer_id) return res.status(400).json({ error: 'no_payment_method' })

  const { data: price, error: reserveErr } = await supabase
    .rpc('reserve_pool_lead', { p_lead: leadId, p_client: clientId })
  if (reserveErr) {
    console.error('reserve error:', reserveErr)
    return res.status(500).json({ error: 'Failed to process unlock' })
  }
  if (price == null) return res.status(409).json({ error: 'lead_taken' })

  let pi
  try {
    // Obtener el método de pago por defecto del customer
    const customer = await stripe.customers.retrieve(client.stripe_customer_id)
    const paymentMethodId = customer.invoice_settings?.default_payment_method
    if (!paymentMethodId) {
      await release(leadId, clientId)
      return res.status(400).json({ error: 'no_payment_method' })
    }

    // Cobrar la tarjeta
    pi = await stripe.paymentIntents.create({
      amount: Math.round(price * 100),
      currency: 'usd',
      customer: client.stripe_customer_id,
      payment_method: paymentMethodId,
      confirm: true,
      off_session: true,
      metadata: { lead_id: leadId, client_id: clientId, type: 'lead_unlock' },
    })
  } catch (err) {
    await release(leadId, clientId)
    console.error('charge-lead error:', err)
    if (err.code === 'authentication_required' || err.decline_code) {
      return res.status(402).json({ error: 'card_declined', message: err.message })
    }
    return res.status(500).json({ error: err.message })
  }

  if (pi.status !== 'succeeded') {
    await release(leadId, clientId)
    return res.status(402).json({ error: 'payment_failed', status: pi.status })
  }

  const { data: claimed } = await supabase
    .rpc('claim_pool_lead', { p_lead: leadId, p_client: clientId })
  if (!claimed) {
    // La reserva expiró y otro lo tomó: devolver el cobro
    await stripe.refunds.create({ payment_intent: pi.id })
      .catch(e => console.error('CRITICAL refund failed:', pi.id, e.message))
    return res.status(409).json({ error: 'lead_taken' })
  }

  const { error: recordErr } = await supabase.from('lead_unlocks')
    .insert({ client_id: clientId, lead_id: leadId, amount_paid: price, payment_method: 'card' })
  if (recordErr) console.error('Unlock record error:', recordErr)

  return res.status(200).json({ success: true, amount: price })
}
