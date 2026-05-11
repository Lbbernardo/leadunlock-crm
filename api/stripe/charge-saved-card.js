// POST /api/stripe/charge-saved-card
// Cobra con la tarjeta guardada del cliente para desbloquear un lead (off-session)

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { leadId, clientId } = req.body
  if (!leadId || !clientId) return res.status(400).json({ error: 'leadId and clientId required' })

  try {
    // Verificar lead y que pertenece al cliente
    const { data: lead, error: leadErr } = await supabase
      .from('leads')
      .select('id, full_name, is_locked, client_id, acquisition_cost')
      .eq('id', leadId)
      .eq('client_id', clientId)
      .single()

    if (leadErr || !lead) return res.status(404).json({ error: 'Lead no encontrado' })
    if (!lead.is_locked) return res.status(409).json({ error: 'Lead ya desbloqueado' })

    // Verificar que no esté ya en lead_unlocks
    const { data: existing } = await supabase
      .from('lead_unlocks')
      .select('id')
      .eq('lead_id', leadId)
      .eq('client_id', clientId)
      .maybeSingle()

    if (existing) return res.status(409).json({ error: 'Lead ya desbloqueado' })

    // Obtener datos del cliente
    const { data: client } = await supabase
      .from('clients')
      .select('stripe_customer_id, payment_method_last4, status')
      .eq('id', clientId)
      .single()

    if (!client?.stripe_customer_id || !client?.payment_method_last4) {
      return res.status(402).json({ error: 'no_payment_method', message: 'No tienes un método de pago activo' })
    }

    // Obtener el payment method predeterminado del customer en Stripe
    const customer = await stripe.customers.retrieve(client.stripe_customer_id)
    const pmId = customer.invoice_settings?.default_payment_method

    if (!pmId) {
      // Marcar cuenta como payment_required
      await supabase.from('clients').update({ status: 'payment_required' }).eq('id', clientId)
      return res.status(402).json({ error: 'no_payment_method', message: 'No tienes un método de pago activo' })
    }

    // Calcular precio server-side (no confiar en el frontend)
    const price = Math.max(12, (lead.acquisition_cost || 5) * 3)
    const amountCents = Math.round(price * 100)

    // Cobrar off-session con la tarjeta guardada
    let pi
    try {
      pi = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: 'usd',
        customer: client.stripe_customer_id,
        payment_method: pmId,
        confirm: true,
        off_session: true,
        metadata: { lead_id: leadId, client_id: clientId, lead_name: lead.full_name },
        description: `Desbloqueo lead — ${lead.full_name}`,
      })
    } catch (stripeErr) {
      // Si requiere autenticación 3D Secure, devolver clientSecret para completar en frontend
      if (stripeErr.code === 'authentication_required') {
        return res.status(402).json({
          error: 'requires_action',
          clientSecret: stripeErr.payment_intent?.client_secret,
          paymentIntentId: stripeErr.payment_intent?.id,
          message: 'Tu banco requiere autenticación adicional',
        })
      }
      // Tarjeta rechazada u otro error
      await supabase.from('clients').update({ status: 'payment_required' }).eq('id', clientId)
      return res.status(402).json({ error: 'card_declined', message: stripeErr.message })
    }

    if (pi.status !== 'succeeded') {
      return res.status(402).json({ error: 'payment_failed', message: 'El pago no fue procesado' })
    }

    // Registrar desbloqueo en DB
    const amountPaid = pi.amount / 100

    await supabase.from('lead_unlocks').insert({
      lead_id: leadId,
      client_id: clientId,
      amount_paid: amountPaid,
      stripe_payment_intent_id: pi.id,
    })

    await supabase.from('leads').update({ is_locked: false }).eq('id', leadId)

    await supabase.from('payments').insert({
      client_id: clientId,
      stripe_payment_intent_id: pi.id,
      amount: amountPaid,
      status: 'succeeded',
      description: `Desbloqueo lead — ${lead.full_name}`,
    })

    // Si estaba en payment_required, restaurar a active
    if (client.status === 'payment_required') {
      await supabase.from('clients').update({ status: 'active' }).eq('id', clientId)
    }

    return res.status(200).json({ success: true, amountPaid })
  } catch (err) {
    console.error('charge-saved-card error:', err)
    return res.status(500).json({ error: err.message })
  }
}
