// POST /api/stripe/confirm-setup
// Tras SetupIntent exitoso, guarda el nuevo método de pago como predeterminado

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '../_lib/auth.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const user = await getAuthUser(req, supabase)
  if (!user) return res.status(401).json({ error: 'unauthorized' })

  const { setupIntentId } = req.body || {}
  if (!setupIntentId) return res.status(400).json({ error: 'setupIntentId required' })

  try {
    const si = await stripe.setupIntents.retrieve(setupIntentId, {
      expand: ['payment_method'],
    })

    if (si.status !== 'succeeded') {
      return res.status(400).json({ error: `SetupIntent status: ${si.status}` })
    }

    // La tarjeta tiene que ser del customer de este usuario
    const { data: client } = await supabase
      .from('clients').select('stripe_customer_id, status').eq('user_id', user.id).single()
    if (!client?.stripe_customer_id || si.customer !== client.stripe_customer_id) {
      return res.status(403).json({ error: 'Esta tarjeta no corresponde a tu cuenta' })
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

    // Tarjeta nueva: si estaba bloqueado por un cobro rechazado, vuelve a activo
    await supabase
      .from('clients')
      .update({
        payment_method_last4: last4,
        payment_method_brand: brand,
        ...(client.status === 'payment_required' && { status: 'active' }),
      })
      .eq('user_id', user.id)

    return res.status(200).json({ success: true, last4, brand })
  } catch (err) {
    console.error('confirm-setup error:', err)
    return res.status(500).json({ error: err.message })
  }
}
