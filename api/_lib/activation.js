// Activación de cuenta ($100): precio, cupones, cliente de Stripe y emails.
// Lo usan create-activation-payment (cobro o cupón gratis) y confirm-activation.

export const ACTIVATION_PRICE = 100

// Valida el cupón en el servidor. Retorna la fila o null si no sirve.
export async function findValidDiscount(supabase, code) {
  const clean = String(code || '').trim().toUpperCase()
  if (!clean) return null
  const { data: row } = await supabase
    .from('discount_codes')
    .select('id, discount_pct, max_uses, used_count, expires_at, active')
    .eq('code', clean)
    .maybeSingle()
  if (!row || !row.active) return null
  if (row.expires_at && new Date(row.expires_at) < new Date()) return null
  if (row.max_uses !== null && row.used_count >= row.max_uses) return null
  return row
}

export function activationAmount(discount) {
  const pct = discount?.discount_pct || 0
  return pct > 0 ? Math.round(ACTIVATION_PRICE * (1 - pct / 100)) : ACTIVATION_PRICE
}

// Cliente de Stripe del usuario (lo crea si no existe). La tarjeta de activación
// tiene que quedar ligada a este customer para poder cobrar leads después.
export async function getOrCreateCustomer(stripe, supabase, userId) {
  const { data: client } = await supabase
    .from('clients').select('stripe_customer_id').eq('user_id', userId).maybeSingle()
  if (client?.stripe_customer_id) return client.stripe_customer_id

  const { data: userRow } = await supabase
    .from('users').select('email, full_name').eq('id', userId).single()
  const customer = await stripe.customers.create({
    email: userRow?.email,
    name: userRow?.full_name,
    metadata: { userId },
  })

  if (client) {
    await supabase.from('clients').update({ stripe_customer_id: customer.id }).eq('user_id', userId)
  } else {
    await supabase.from('clients').insert({ user_id: userId, stripe_customer_id: customer.id, balance: 0, lead_price: 12 })
  }
  return customer.id
}

async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY || !to) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: 'LeadUnlock <hola@unlocklead.click>', to, subject, html }),
  }).catch(e => console.error('Email error:', e.message))
}

function welcomeHtml(name) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
      <div style="background:#0f172a;padding:32px 24px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:#ffffff;font-size:24px;margin:0">LeadUnlock</h1>
      </div>
      <div style="background:#f8fafc;padding:32px 24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
        <h2 style="font-size:20px;margin:0 0 12px">¡Bienvenido, ${name}!</h2>
        <p style="color:#475569;line-height:1.6;margin:0 0 20px">
          Tu cuenta está activa. Ya puedes ver los leads disponibles en tu zona.
        </p>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:0 0 24px">
          <p style="font-weight:600;margin:0 0 12px;color:#0f172a">¿Cómo funciona?</p>
          <ol style="color:#475569;line-height:1.8;margin:0;padding-left:20px">
            <li>Elige tus nichos y estados en <strong>Mi perfil</strong></li>
            <li>Te avisamos por email y SMS cuando entra un lead nuevo</li>
            <li>El primer agente que lo desbloquea se lo queda</li>
          </ol>
        </div>
        <a href="https://unlocklead.click/dashboard" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px">
          Ver leads disponibles
        </a>
        <p style="color:#94a3b8;font-size:13px;margin:24px 0 0">
          ¿Tienes preguntas? Responde este correo y te ayudamos.
        </p>
      </div>
    </div>`
}

function adminHtml(name, email, amount, code) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
      <div style="background:#0f172a;padding:24px;border-radius:12px 12px 0 0">
        <h2 style="color:#22c55e;margin:0;font-size:20px">Nuevo cliente activado</h2>
      </div>
      <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="color:#64748b;padding:6px 0;width:120px">Nombre</td><td style="color:#0f172a;font-weight:600">${name || '—'}</td></tr>
          <tr><td style="color:#64748b;padding:6px 0">Email</td><td style="color:#0f172a;font-weight:600">${email || '—'}</td></tr>
          <tr><td style="color:#64748b;padding:6px 0">Pago</td><td style="color:#22c55e;font-weight:700">$${amount} USD${code ? ' (con cupón)' : ''}</td></tr>
          <tr><td style="color:#64748b;padding:6px 0">Fecha</td><td style="color:#0f172a">${new Date().toLocaleString('es-US', { timeZone: 'America/New_York' })}</td></tr>
        </table>
        <a href="https://unlocklead.click/admin" style="display:inline-block;margin-top:20px;background:#0f172a;color:#ffffff;text-decoration:none;padding:10px 22px;border-radius:8px;font-weight:600;font-size:14px">
          Ver en el admin
        </a>
      </div>
    </div>`
}

// Activa la cuenta. Solo cuenta el cupón y manda emails la primera vez (si ya estaba activa, no repite).
export async function activateClient(supabase, { userId, amount, discountId, last4, brand }) {
  const { data: client } = await supabase
    .from('clients').select('id, status').eq('user_id', userId).maybeSingle()
  const wasActive = client?.status === 'active'

  const fields = { status: 'active', activation_amount_paid: amount }
  if (last4) Object.assign(fields, { payment_method_last4: last4, payment_method_brand: brand })

  const { error } = client
    ? await supabase.from('clients').update(fields).eq('user_id', userId)
    : await supabase.from('clients').insert({ user_id: userId, balance: 0, lead_price: 12, ...fields })
  if (error) throw new Error(`No se pudo activar la cuenta: ${error.message}`)

  if (wasActive) return

  if (discountId) {
    const { data: code } = await supabase
      .from('discount_codes').select('used_count').eq('id', discountId).single()
    await supabase.from('discount_codes')
      .update({ used_count: (code?.used_count || 0) + 1 }).eq('id', discountId)
  }

  const { data: userRow } = await supabase
    .from('users').select('email, full_name').eq('id', userId).single()
  const firstName = userRow?.full_name?.split(' ')[0] || 'agente'
  await Promise.all([
    sendEmail(userRow?.email, '¡Tu cuenta LeadUnlock está activa! 🎉', welcomeHtml(firstName)),
    sendEmail(process.env.ADMIN_EMAIL, '🎉 Nuevo cliente activado — LeadUnlock',
      adminHtml(userRow?.full_name, userRow?.email, amount, discountId)),
  ])
}
