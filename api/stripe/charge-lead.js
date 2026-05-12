// POST /api/stripe/charge-lead
// Cobra el lead con la tarjeta guardada del cliente (cuando no tiene crédito)

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { leadId, clientId } = req.body
  if (!leadId || !clientId) return res.status(400).json({ error: 'leadId and clientId required' })

  const [{ data: client }, { data: lead }] = await Promise.all([
    supabase.from('clients').select('id, balance, lead_price, stripe_customer_id, user_id').eq('id', clientId).single(),
    supabase.from('leads').select('id, is_locked, client_id').eq('id', leadId).single(),
  ])

  if (!client) return res.status(404).json({ error: 'Client not found' })
  if (!lead) return res.status(404).json({ error: 'Lead not found' })
  if (lead.client_id !== clientId) return res.status(403).json({ error: 'Forbidden' })
  if (!lead.is_locked) return res.status(200).json({ success: true, already_unlocked: true })
  if (!client.stripe_customer_id) return res.status(400).json({ error: 'no_payment_method' })

  const price = client.lead_price || 20

  try {
    // Obtener el método de pago por defecto del customer
    const customer = await stripe.customers.retrieve(client.stripe_customer_id)
    const paymentMethodId = customer.invoice_settings?.default_payment_method

    if (!paymentMethodId) return res.status(400).json({ error: 'no_payment_method' })

    // Cobrar la tarjeta
    const pi = await stripe.paymentIntents.create({
      amount: Math.round(price * 100),
      currency: 'usd',
      customer: client.stripe_customer_id,
      payment_method: paymentMethodId,
      confirm: true,
      off_session: true,
    })

    if (pi.status !== 'succeeded') {
      return res.status(402).json({ error: 'payment_failed', status: pi.status })
    }

    // Desbloquear lead y registrar unlock
    await Promise.all([
      supabase.from('leads').update({ is_locked: false }).eq('id', leadId),
      supabase.from('lead_unlocks').insert({ client_id: clientId, lead_id: leadId, amount_paid: price }),
    ])

    return res.status(200).json({ success: true, amount: price })
  } catch (err) {
    console.error('charge-lead error:', err)
    if (err.code === 'authentication_required' || err.decline_code) {
      return res.status(402).json({ error: 'card_declined', message: err.message })
    }
    return res.status(500).json({ error: err.message })
  }
}
