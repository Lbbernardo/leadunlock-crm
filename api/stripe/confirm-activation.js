// POST /api/stripe/confirm-activation
// Tras pagar la activación: verifica que el pago es de este usuario, guarda la tarjeta y activa la cuenta.

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '../_lib/auth.js'
import { activateClient } from '../_lib/activation.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const user = await getAuthUser(req, supabase)
  if (!user) return res.status(401).json({ error: 'unauthorized' })

  const { paymentIntentId } = req.body || {}
  if (!paymentIntentId) return res.status(400).json({ error: 'paymentIntentId required' })

  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['payment_method'] })

    if (pi.status !== 'succeeded') return res.status(400).json({ error: 'Payment not succeeded' })
    if (pi.metadata?.type !== 'account_activation' || pi.metadata?.user_id !== user.id) {
      return res.status(403).json({ error: 'Este pago no corresponde a tu cuenta' })
    }

    // La tarjeta ya quedó ligada al customer (el PaymentIntent se creó con customer + setup_future_usage).
    // La marcamos como predeterminada para poder cobrar leads.
    const pm = pi.payment_method
    if (pm?.id && pi.customer) {
      await stripe.customers.update(pi.customer, {
        invoice_settings: { default_payment_method: pm.id },
      })
    }

    const amount = pi.amount / 100
    await activateClient(supabase, {
      userId: user.id,
      amount,
      discountId: pi.metadata.discount_id || null,
      last4: pm?.card?.last4 || null,
      brand: pm?.card?.brand || null,
    })

    return res.status(200).json({ success: true, last4: pm?.card?.last4 || null, brand: pm?.card?.brand || null, amount })
  } catch (err) {
    console.error('confirm-activation error:', err)
    return res.status(500).json({ error: err.message })
  }
}
