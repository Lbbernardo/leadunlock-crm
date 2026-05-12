// POST /api/stripe/create-activation-payment
// Crea el PaymentIntent de $100 para activar la cuenta del cliente

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { amount } = req.body
  const amountInCents = amount && amount > 0 ? Math.round(amount * 100) : 10000

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    setup_future_usage: 'off_session',
    metadata: { type: 'account_activation' },
    description: 'Activación cuenta LeadUnlock CRM',
  })

  return res.status(200).json({ clientSecret: paymentIntent.client_secret })
}
