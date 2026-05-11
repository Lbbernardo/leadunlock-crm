// Vercel Serverless Function — POST /api/stripe/webhook
// Handles Stripe webhook events (alternative to confirm-unlock for production)
// Configure in Stripe Dashboard: Webhooks > Add endpoint > /api/stripe/webhook
// Events to listen: payment_intent.succeeded

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const rawBody = await getRawBody(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    const { lead_id, client_id } = pi.metadata

    if (lead_id && client_id) {
      await supabase.from('lead_unlocks').insert({
        lead_id,
        client_id,
        amount_paid: pi.amount / 100,
        stripe_payment_intent_id: pi.id,
      }).onConflict('lead_id,client_id').ignore()

      await supabase.from('leads').update({ is_locked: false }).eq('id', lead_id)

      await supabase.from('payments').insert({
        client_id,
        stripe_payment_intent_id: pi.id,
        amount: pi.amount / 100,
        status: 'succeeded',
        description: `Desbloqueo lead #${lead_id}`,
      }).onConflict('stripe_payment_intent_id').ignore()

      // Si el pago se recuperó, restaurar status a active
      await supabase
        .from('clients')
        .update({ status: 'active' })
        .eq('id', client_id)
        .eq('status', 'payment_required')
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object
    const { client_id } = pi.metadata

    // Solo marcar si era un cobro off-session (desbloqueo de lead con tarjeta guardada)
    if (client_id && pi.off_session) {
      await supabase
        .from('clients')
        .update({ status: 'payment_required' })
        .eq('id', client_id)
    }
  }

  return res.status(200).json({ received: true })
}
