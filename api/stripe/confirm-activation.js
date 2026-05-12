// POST /api/stripe/confirm-activation
// Tras pagar $100, guarda el método de pago en la cuenta del cliente

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { paymentIntentId, userId } = req.body
  if (!paymentIntentId || !userId) return res.status(400).json({ error: 'paymentIntentId and userId required' })

  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['payment_method'],
    })

    if (pi.status !== 'succeeded') return res.status(400).json({ error: 'Payment not succeeded' })

    const pm = pi.payment_method
    const last4 = pm?.card?.last4 || null
    const brand = pm?.card?.brand || null

    // Create or retrieve Stripe Customer
    let customerId = null
    const { data: client } = await supabase
      .from('clients')
      .select('stripe_customer_id, id')
      .eq('user_id', userId)
      .single()

    if (client?.stripe_customer_id) {
      customerId = client.stripe_customer_id
    } else {
      const { data: userRow } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', userId)
        .single()

      const customer = await stripe.customers.create({
        email: userRow?.email,
        name: userRow?.full_name,
        metadata: { userId },
      })
      customerId = customer.id
    }

    // Attach payment method to customer
    if (pm?.id && customerId) {
      try {
        await stripe.paymentMethods.attach(pm.id, { customer: customerId })
        await stripe.customers.update(customerId, {
          invoice_settings: { default_payment_method: pm.id },
        })
      } catch (e) {
        // Already attached — ignorar
      }
    }

    const activationAmount = pi.amount / 100

    await supabase
      .from('clients')
      .update({
        stripe_customer_id: customerId,
        payment_method_last4: last4,
        payment_method_brand: brand,
        activation_amount_paid: activationAmount,
      })
      .eq('user_id', userId)

    return res.status(200).json({ success: true, last4, brand, amount: activationAmount })
  } catch (err) {
    console.error('confirm-activation error:', err)
    return res.status(500).json({ error: err.message })
  }
}
