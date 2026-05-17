// POST /api/admin/notify-registration
// Notifica al admin cuando un nuevo usuario se registra

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email } = req.body
  if (!email) return res.status(400).json({ error: 'email requerido' })

  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) {
    return res.status(200).json({ ok: true })
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'LeadUnlock <notificaciones@unlocklead.click>',
      to: process.env.ADMIN_EMAIL,
      subject: '👤 Nuevo registro — LeadUnlock',
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
            <p style="color:#64748b;font-size:13px;margin:16px 0 0">Aún no ha pagado la activación.</p>
            <a href="https://unlocklead.click/admin" style="display:inline-block;margin-top:16px;background:#0f172a;color:#ffffff;text-decoration:none;padding:10px 22px;border-radius:8px;font-weight:600;font-size:14px">
              Ver en el admin
            </a>
          </div>
        </div>
      `,
    }),
  }).catch(e => console.error('notify-registration error:', e.message))

  return res.status(200).json({ ok: true })
}
