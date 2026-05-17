// POST /api/stripe/confirm-activation
// Tras pagar $100, guarda el método de pago en la cuenta del cliente

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function sendAdminNewClientEmail(clientEmail, clientName, amount) {
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'LeadUnlock <notificaciones@unlocklead.click>',
      to: process.env.ADMIN_EMAIL,
      subject: '🎉 Nuevo cliente activado — LeadUnlock',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
          <div style="background:#0f172a;padding:24px;border-radius:12px 12px 0 0">
            <h2 style="color:#22c55e;margin:0;font-size:20px">Nuevo cliente activado</h2>
          </div>
          <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="color:#64748b;padding:6px 0;width:120px">Nombre</td><td style="color:#0f172a;font-weight:600">${clientName || '—'}</td></tr>
              <tr><td style="color:#64748b;padding:6px 0">Email</td><td style="color:#0f172a;font-weight:600">${clientEmail || '—'}</td></tr>
              <tr><td style="color:#64748b;padding:6px 0">Pago</td><td style="color:#22c55e;font-weight:700">$${amount} USD</td></tr>
              <tr><td style="color:#64748b;padding:6px 0">Fecha</td><td style="color:#0f172a">${new Date().toLocaleString('es-US', { timeZone: 'America/New_York' })}</td></tr>
            </table>
            <a href="https://unlocklead.click/admin" style="display:inline-block;margin-top:20px;background:#0f172a;color:#ffffff;text-decoration:none;padding:10px 22px;border-radius:8px;font-weight:600;font-size:14px">
              Ver en el admin
            </a>
          </div>
        </div>
      `,
    }),
  }).catch(e => console.error('Admin notification email error:', e.message))
}

async function sendWelcomeEmail(toEmail, firstName) {
  if (!process.env.RESEND_API_KEY) return
  const name = firstName || 'there'
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'LeadUnlock <hola@unlocklead.click>',
      to: toEmail,
      subject: '¡Tu cuenta LeadUnlock está activa! 🎉',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
          <div style="background:#0f172a;padding:32px 24px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:#ffffff;font-size:24px;margin:0">LeadUnlock</h1>
          </div>
          <div style="background:#f8fafc;padding:32px 24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
            <h2 style="font-size:20px;margin:0 0 12px">¡Bienvenido, ${name}!</h2>
            <p style="color:#475569;line-height:1.6;margin:0 0 20px">
              Tu cuenta está activa y tu pago de activación fue procesado exitosamente.
              Estamos configurando tu campaña en Meta Ads para que los leads empiecen a llegar.
            </p>
            <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:0 0 24px">
              <p style="font-weight:600;margin:0 0 12px;color:#0f172a">¿Qué pasa ahora?</p>
              <ol style="color:#475569;line-height:1.8;margin:0;padding-left:20px">
                <li>Configuramos tu campaña de Meta Ads (1–3 días)</li>
                <li>Los leads empiezan a llegar a tu panel</li>
                <li>Tú decides cuáles desbloquear y contactar</li>
              </ol>
            </div>
            <a href="https://unlocklead.click/dashboard" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px">
              Ver mi panel
            </a>
            <p style="color:#94a3b8;font-size:13px;margin:24px 0 0">
              ¿Tienes preguntas? Responde este correo y te ayudamos.
            </p>
          </div>
        </div>
      `,
    }),
  }).catch(e => console.error('Welcome email error:', e.message))
}

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
    let userEmail = null
    let userFirstName = null

    const { data: client } = await supabase
      .from('clients')
      .select('stripe_customer_id, id')
      .eq('user_id', userId)
      .single()

    const { data: userRow } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    userEmail = userRow?.email || null
    userFirstName = userRow?.full_name?.split(' ')[0] || null

    if (client?.stripe_customer_id) {
      customerId = client.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
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

    if (userEmail) sendWelcomeEmail(userEmail, userFirstName)
    sendAdminNewClientEmail(userEmail, userRow?.full_name, activationAmount)

    return res.status(200).json({ success: true, last4, brand, amount: activationAmount })
  } catch (err) {
    console.error('confirm-activation error:', err)
    return res.status(500).json({ error: err.message })
  }
}
