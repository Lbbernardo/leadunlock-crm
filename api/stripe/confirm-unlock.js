// Vercel Serverless Function — POST /api/stripe/confirm-unlock
// Verifies payment and unlocks the lead in the database

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { paymentIntentId, leadId, clientId } = req.body

  if (!paymentIntentId || !leadId || !clientId) {
    return res.status(400).json({ error: 'paymentIntentId, leadId and clientId are required' })
  }

  // Verify payment with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

  if (paymentIntent.status !== 'succeeded') {
    return res.status(402).json({ error: 'Payment not completed' })
  }

  // Verify metadata matches request
  if (
    paymentIntent.metadata.lead_id !== leadId ||
    paymentIntent.metadata.client_id !== clientId
  ) {
    return res.status(403).json({ error: 'Payment metadata mismatch' })
  }

  const amountPaid = paymentIntent.amount / 100

  // Create unlock record
  const { error: unlockErr } = await supabase
    .from('lead_unlocks')
    .insert({
      lead_id: leadId,
      client_id: clientId,
      amount_paid: amountPaid,
      stripe_payment_intent_id: paymentIntentId,
    })

  if (unlockErr && unlockErr.code !== '23505') {
    console.error('Unlock insert error:', unlockErr)
    return res.status(500).json({ error: 'Failed to unlock lead' })
  }

  // Update lead is_locked flag
  await supabase
    .from('leads')
    .update({ is_locked: false })
    .eq('id', leadId)

  // Record payment
  await supabase
    .from('payments')
    .insert({
      client_id: clientId,
      stripe_payment_intent_id: paymentIntentId,
      amount: amountPaid,
      status: 'succeeded',
      description: `Desbloqueo lead #${leadId}`,
    })

  return res.status(200).json({ success: true })
}
