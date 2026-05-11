// POST /api/stripe/confirm-setup
// Tras SetupIntent exitoso, guarda el nuevo método de pago como predeterminado

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { setupIntentId, userId } = req.body
  if (!setupIntentId || !userId) return res.status(400).json({ error: 'setupIntentId and userId required' })

  try {
    const si = await stripe.setupIntents.retrieve(setupIntentId, {
      expand: ['payment_method'],
    })

    if (si.status !== 'succeeded') {
      return res.status(400).json({ error: `SetupIntent status: ${si.status}` })
    }

    const pm = si.payment_method
    const last4 = pm?.card?.last4 || null
    const brand = pm?.card?.brand || null

    // Establecer como método de pago predeterminado del customer
    if (pm?.id && si.customer) {
      await stripe.customers.update(si.customer, {
        invoice_settings: { default_payment_method: pm.id },
      })
    }

    await supabase
      .from('clients')
      .update({
        payment_method_last4: last4,
        payment_method_brand: brand,
      })
      .eq('user_id', userId)

    return res.status(200).json({ success: true, last4, brand })
  } catch (err) {
    console.error('confirm-setup error:', err)
    return res.status(500).json({ error: err.message })
  }
}
