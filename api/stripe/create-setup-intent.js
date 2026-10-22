// POST /api/stripe/create-setup-intent
// Crea un SetupIntent para guardar tarjeta sin cobrar

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '../_lib/auth.js'
import { getOrCreateCustomer } from '../_lib/activation.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const user = await getAuthUser(req, supabase)
  if (!user) return res.status(401).json({ error: 'unauthorized' })

  try {
    const customerId = await getOrCreateCustomer(stripe, supabase, user.id)

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
