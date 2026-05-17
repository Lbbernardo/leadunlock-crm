// POST /api/admin
// Maneja todas las acciones de admin: add-credit, delete-user, notify-registration

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

async function addCredit(body, res) {
  const { clientId, amount } = body
  const amountNum = Number(amount)
  if (!clientId || !amountNum || amountNum <= 0)
    return res.status(400).json({ error: 'Invalid parameters' })

  const { data: client, error: fetchErr } = await supabase
    .from('clients').select('balance').eq('id', clientId).single()
  if (fetchErr || !client) return res.status(404).json({ error: 'Client not found' })

  const newBalance = (client.balance || 0) + amountNum
  const { error: updateErr } = await supabase
    .from('clients').update({ balance: newBalance }).eq('id', clientId)
  if (updateErr) return res.status(500).json({ error: 'Failed to update balance' })

  return res.status(200).json({ success: true, new_balance: newBalance })
}

async function deleteUser(body, res) {
  const { clientId, userId } = body
  if (!clientId) return res.status(400).json({ error: 'clientId es requerido' })

  await supabase.from('lead_unlocks').delete().eq('client_id', clientId)
  await supabase.from('leads').delete().eq('client_id', clientId)
  await supabase.from('campaigns').delete().eq('client_id', clientId)

  const { error: clientErr } = await supabase.from('clients').delete().eq('id', clientId)
  if (clientErr) return res.status(500).json({ error: 'Error borrando cliente', detail: clientErr.message })

  if (userId) {
    await supabase.from('users').delete().eq('id', userId)
    const { error: authErr } = await supabase.auth.admin.deleteUser(userId)
    if (authErr) return res.status(500).json({ error: 'Error borrando auth user', detail: authErr.message })
  }

  return res.status(200).json({ success: true })
}

async function notifyRegistration(body, res) {
  const { name, email } = body
  if (!email) return res.status(400).json({ error: 'email requerido' })

  if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LeadUnlock <notificaciones@unlocklead.click>',
        to: process.env.ADMIN_EMAIL,
        subject: '👤 Nuevo usuario registrado — LeadUnlock',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
            <div style="background:#0f172a;padding:24px;border-radius:12px 12px 0 0">
              <h2 style="color:#ffffff;margin:0;font-size:18px">Nuevo usuario registrado</h2>
            </div>
            <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="color:#64748b;padding:6px 0;width:100px">Nombre</td><td style="color:#0f172a;font-weight:600">${name || '—'}</td></tr>
                <tr><td style="color:#64748b;padding:6px 0">Email</td><td style="color:#0f172a;font-weight:600">${email}</td></tr>
                <tr><td style="color:#64748b;padding:6px 0">Fecha</td><td style="color:#0f172a">${new Date().toLocaleString('es-US', { timeZone: 'America/New_York' })}</td></tr>
              </table>
              <a href="https://unlocklead.click/admin" style="display:inline-block;margin-top:16px;background:#0f172a;color:#ffffff;text-decoration:none;padding:10px 22px;border-radius:8px;font-weight:600;font-size:14px">
                Ver en el admin
              </a>
            </div>
          </div>
        `,
      }),
    }).catch(e => console.error('notify-registration error:', e.message))
  }

  return res.status(200).json({ ok: true })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { action, ...body } = req.body

  if (action === 'add-credit')          return addCredit(body, res)
  if (action === 'delete-user')         return deleteUser(body, res)
  if (action === 'notify-registration') return notifyRegistration(body, res)

  return res.status(400).json({ error: 'action inválida' })
}
