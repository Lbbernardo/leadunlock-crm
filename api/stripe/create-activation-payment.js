// POST /api/stripe/create-activation-payment
// Crea el PaymentIntent de activación. El precio y el cupón se calculan aquí, nunca en el navegador.
// Si el cupón deja el precio en $0, activa la cuenta directamente.

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '../_lib/auth.js'
import { findValidDiscount, activationAmount, getOrCreateCustomer, activateClient } from '../_lib/activation.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const user = await getAuthUser(req, supabase)
  if (!user) return res.status(401).json({ error: 'unauthorized' })

  const { code } = req.body || {}
  const discount = code ? await findValidDiscount(supabase, code) : null
  if (code && !discount) return res.status(400).json({ error: 'Código inválido o vencido.' })

  const amount = activationAmount(discount)

  try {
    if (amount === 0) {
      await activateClient(supabase, { userId: user.id, amount: 0, discountId: discount?.id })
      return res.status(200).json({ activated: true, amount: 0 })
    }

    const customerId = await getOrCreateCustomer(stripe, supabase, user.id)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      customer: customerId,
      setup_future_usage: 'off_session',
      metadata: { type: 'account_activation', user_id: user.id, discount_id: discount?.id || '' },
      description: 'Activación cuenta LeadUnlock CRM',
    })

    return res.status(200).json({ clientSecret: paymentIntent.client_secret, amount })
  } catch (err) {
    console.error('create-activation-payment error:', err)
    return res.status(500).json({ error: err.message })
  }
}
