// Pool de leads: entrada de leads + notificaciones a los clientes que coinciden.
// Lo usan make-lead, meta-webhook y webhook.

import { toStateCode, zipToState } from '../../src/lib/usStates.js'

const FROM = 'LeadUnlock <notificaciones@unlocklead.click>'

const esc = (v) => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

export function basePrice(cost) {
  return Math.max(Math.round((Number(cost) || 0) * 3), 12)
}

async function resend(path, payload) {
  if (!process.env.RESEND_API_KEY) return
  await fetch(`https://api.resend.com${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(r => r.json()).then(d => {
    if (d.error || d.statusCode >= 400) console.error('Email error:', JSON.stringify(d))
  }).catch(e => console.error('Email fetch error:', e.message))
}

export async function sendSMS(to, message) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_PHONE_NUMBER || !to) return
  const phone = to.replace(/\D/g, '')
  if (phone.length < 10) return
  const toFormatted = `+${phone.startsWith('1') ? phone : '1' + phone}`
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ From: process.env.TWILIO_PHONE_NUMBER, To: toFormatted, Body: message }).toString(),
    }
  ).catch(e => console.error('SMS fetch error:', e.message))
  const data = await res?.json().catch(() => null)
  if (data?.error_code) console.error('SMS error Twilio:', data.error_code, data.message)
}

// Datos del lead desde Facebook Graph API → { full_name, phone, email, city, state }
export async function fetchMetaLead(leadgenId) {
  const graphRes = await fetch(
    `https://graph.facebook.com/v19.0/${leadgenId}?fields=field_data&access_token=${process.env.META_PAGE_ACCESS_TOKEN}`
  )
  const graphData = await graphRes.json()
  if (graphData.error) {
    console.error('Facebook Graph API error:', graphData.error)
    throw new Error(graphData.error.message)
  }

  const fields = {}
  for (const field of graphData.field_data || []) {
    fields[field.name] = field.values?.[0] || ''
  }

  return {
    full_name: fields.full_name || `${fields.first_name || ''} ${fields.last_name || ''}`.trim() || 'Sin nombre',
    phone: fields.phone_number || fields.phone || null,
    email: fields.email || null,
    city: fields.city || null,
    state: fields.state || fields.province || null,
    zip_code: fields.zip_code || fields.post_code || fields.zip || null,
  }
}

// Campaña activa por form_id de Meta (ya no depende del cliente)
export async function findCampaignByForm(supabase, formId) {
  const { data } = await supabase
    .from('campaigns')
    .select('id, name, interest_category, lead_interest, cost_per_lead, default_state')
    .eq('meta_form_id', String(formId))
    .eq('is_active', true)
    .maybeSingle()
  return data
}

// Estado del lead: el que escribió → su código postal → el estado por defecto de la campaña
function resolveState(lead) {
  return toStateCode(lead.state) || zipToState(lead.zip_code) || toStateCode(lead.default_state)
}

// Inserta el lead en el pool (sin cliente, bloqueado)
export async function addPoolLead(supabase, lead) {
  const stateCode = resolveState(lead)
  const { data, error } = await supabase.from('leads').insert({
    client_id: null,
    campaign_id: lead.campaign_id || null,
    campaign_name: lead.campaign_name || null,
    full_name: lead.full_name,
    phone: lead.phone || null,
    email: lead.email || null,
    city: lead.city || null,
    state: lead.state || stateCode,
    state_code: stateCode,
    zip_code: lead.zip_code || null,
    category: lead.category || null,
    product_interest: lead.product_interest || null,
    source: lead.source || 'Meta Ads',
    is_locked: true,
    status: 'new',
    acquisition_cost: lead.acquisition_cost || 0,
  }).select().single()

  if (error) throw error
  return data
}

function matches(client, lead) {
  const cats = client.pool_categories || []
  const states = client.pool_states || []
  if (cats.length > 0 && !cats.includes(lead.category)) return false
  if (states.length > 0 && !states.includes(lead.state_code)) return false
  return true
}

// Avisa a todos los clientes activos que coinciden + al admin
export async function notifyPoolLead(supabase, lead) {
  const { data: clients } = await supabase
    .from('clients')
    .select('id, user_id, phone, pool_categories, pool_states')
    .eq('status', 'active')

  const targets = (clients || []).filter(c => matches(c, lead))
  const price = basePrice(lead.acquisition_cost)
  const firstName = esc((lead.full_name || '').trim().split(' ')[0] || 'Nuevo lead')
  const where = esc([lead.city, lead.state_code || lead.state].filter(Boolean).join(', '))
  const label = [lead.category, where].filter(Boolean).join(' · ')

  const userIds = targets.map(c => c.user_id).filter(Boolean)
  const { data: users } = userIds.length
    ? await supabase.from('users').select('id, email').in('id', userIds)
    : { data: [] }

  const emails = (users || []).filter(u => u.email).map(u => ({
    from: FROM,
    to: u.email,
    subject: `⚡ Nuevo lead disponible — ${label || 'LeadUnlock'}`,
    html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
      <div style="background:#0f172a;padding:28px 24px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:#ffffff;font-size:22px;margin:0">LeadUnlock</h1>
      </div>
      <div style="background:#f8fafc;padding:28px 24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
        <h2 style="font-size:20px;margin:0 0 12px">⚡ Nuevo lead en tu zona</h2>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:0 0 20px">
          <p style="margin:0;font-weight:600;font-size:18px;color:#0f172a">${firstName}</p>
          <p style="margin:6px 0 0;color:#64748b;font-size:14px">${label}</p>
          <p style="margin:6px 0 0;color:#16a34a;font-weight:600">$${price}</p>
        </div>
        <p style="color:#b45309;font-weight:600;margin:0 0 20px">El primer agente que lo desbloquee se lo queda.</p>
        <a href="https://unlocklead.click/dashboard" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px">
          Desbloquear ahora
        </a>
      </div>
    </div>`,
  }))

  // Resend batch acepta hasta 100 por llamada
  for (let i = 0; i < emails.length; i += 100) {
    await resend('/emails/batch', emails.slice(i, i + 100))
  }

  const sms = `LeadUnlock: nuevo lead ${label ? `(${label}) ` : ''}— $${price}. El primero que lo desbloquee se lo queda: unlocklead.click/dashboard`
  await Promise.all(targets.filter(c => c.phone).map(c => sendSMS(c.phone, sms)))

  if (process.env.ADMIN_EMAIL) {
    await resend('/emails', {
      from: FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `Lead nuevo al pool — ${label || lead.full_name}`,
      html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
        <h2 style="color:#16a34a;margin:0 0 16px">🔔 Lead nuevo al pool</h2>
        <p style="margin:0 0 8px;color:#475569"><strong>Nombre:</strong> ${esc(lead.full_name)}</p>
        <p style="margin:0 0 8px;color:#475569"><strong>Categoría:</strong> ${esc(lead.category) || '— sin categoría —'}</p>
        <p style="margin:0 0 8px;color:#475569"><strong>Ubicación:</strong> ${where || '—'}</p>
        <p style="margin:0 0 8px;color:#475569"><strong>Precio:</strong> $${price}</p>
        <p style="margin:0 0 24px;color:#475569"><strong>Clientes avisados:</strong> ${targets.length}</p>
        <a href="https://unlocklead.click/admin" style="background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Ver en el admin</a>
      </div>`,
    })
  }
  if (process.env.ADMIN_PHONE) {
    await sendSMS(process.env.ADMIN_PHONE, `LeadUnlock — lead al pool\n${label || lead.full_name}\nAvisados: ${targets.length} clientes`)
  }

  return targets.length
}
