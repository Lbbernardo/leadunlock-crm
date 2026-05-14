// POST /api/stripe/webhook
// Stripe firma cada evento — verificamos la firma antes de procesar.
// Eventos: payment_intent.succeeded, payment_intent.payment_failed

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  let rawBody
  try {
    rawBody = await getRawBody(req)
  } catch (err) {
    console.error('Error reading body:', err)
    return res.status(400).json({ error: 'Could not read body' })
  }

  const sig = req.headers['stripe-signature']
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET not set')
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret)
  } catch (err) {
    console.error('Stripe signature verification failed:', err.message)
    return res.status(400).json({ error: `Signature error: ${err.message}` })
  }

  console.log('Stripe webhook event:', event.type)

  // ── Pago exitoso ──────────────────────────────────────────────────────────
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    const { lead_id, client_id, type } = pi.metadata

    // Cobro de activación de cuenta ($100)
    if (type === 'activation' && client_id) {
      await supabase
        .from('clients')
        .update({ status: 'active' })
        .eq('id', client_id)
        .eq('status', 'pending')
      console.log('Activation payment confirmed for client:', client_id)
    }

    // Cobro de lead con tarjeta (off-session)
    if (lead_id && client_id) {
      const amount = pi.amount / 100

      const [unlockRes, leadRes] = await Promise.all([
        supabase.from('lead_unlocks').insert({
          lead_id,
          client_id,
          amount_paid: amount,
          payment_method: 'card',
        }),
        supabase.from('leads').update({ is_locked: false }).eq('id', lead_id),
      ])

      if (unlockRes.error) console.error('lead_unlock insert error:', unlockRes.error)
      if (leadRes.error) console.error('lead update error:', leadRes.error)

      // Si el cliente estaba en payment_required, restaurarlo a active
      await supabase
        .from('clients')
        .update({ status: 'active' })
        .eq('id', client_id)
        .eq('status', 'payment_required')

      console.log('Lead unlocked via webhook:', lead_id)
    }
  }

  // ── Pago fallido ──────────────────────────────────────────────────────────
  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object
    const { client_id } = pi.metadata

    if (client_id && pi.off_session) {
      await supabase
        .from('clients')
        .update({ status: 'payment_required' })
        .eq('id', client_id)
      console.log('Payment failed, client marked payment_required:', client_id)
    }
  }

  return res.status(200).json({ received: true })
}
