// Vercel Serverless Function — POST /api/stripe/create-payment-intent
// Creates a Stripe PaymentIntent for unlocking a lead

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

  const { leadId, clientId, amount } = req.body

  if (!leadId || !clientId || !amount) {
    return res.status(400).json({ error: 'leadId, clientId and amount are required' })
  }

  // Verify lead exists and belongs to client
  const { data: lead, error: leadErr } = await supabase
    .from('leads')
    .select('id, full_name, is_locked, client_id')
    .eq('id', leadId)
    .eq('client_id', clientId)
    .single()

  if (leadErr || !lead) {
    return res.status(404).json({ error: 'Lead not found' })
  }

  // Check it hasn't already been unlocked
  const { data: existing } = await supabase
    .from('lead_unlocks')
    .select('id')
    .eq('lead_id', leadId)
    .eq('client_id', clientId)
    .single()

  if (existing) {
    return res.status(409).json({ error: 'Lead already unlocked' })
  }

  // Get client lead price (fallback to $20)
  const { data: client } = await supabase
    .from('clients')
    .select('lead_price')
    .eq('id', clientId)
    .single()

  const priceInCents = Math.round((client?.lead_price || 20) * 100)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: priceInCents,
    currency: 'usd',
    metadata: {
      lead_id: leadId,
      client_id: clientId,
      lead_name: lead.full_name,
    },
  })

  return res.status(200).json({ clientSecret: paymentIntent.client_secret })
}
