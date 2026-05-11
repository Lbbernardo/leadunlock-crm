// POST /api/stripe/create-setup-intent
// Crea un SetupIntent para guardar tarjeta sin cobrar

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userId } = req.body
  if (!userId) return res.status(400).json({ error: 'userId required' })

  try {
    const { data: client } = await supabase
      .from('clients')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    let customerId = client?.stripe_customer_id

    if (!customerId) {
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

      await supabase
        .from('clients')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId)
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
    })

    return res.status(200).json({ clientSecret: setupIntent.client_secret })
  } catch (err) {
    console.error('create-setup-intent error:', err)
    return res.status(500).json({ error: err.message })
  }
}
