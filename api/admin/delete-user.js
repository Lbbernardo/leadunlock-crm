// POST /api/admin/delete-user
// Elimina un cliente y todos sus datos: leads, unlocks, campañas, usuario y auth.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { clientId, userId } = req.body

  if (!clientId) {
    return res.status(400).json({ error: 'clientId es requerido' })
  }

  // 1. Borrar lead_unlocks del cliente
  await supabase.from('lead_unlocks').delete().eq('client_id', clientId)

  // 2. Borrar leads del cliente
  await supabase.from('leads').delete().eq('client_id', clientId)

  // 3. Borrar campañas del cliente
  await supabase.from('campaigns').delete().eq('client_id', clientId)

  // 4. Borrar fila en clients
  const { error: clientErr } = await supabase.from('clients').delete().eq('id', clientId)
  if (clientErr) return res.status(500).json({ error: 'Error borrando cliente', detail: clientErr.message })

  if (userId) {
    // 5. Borrar fila en users (tabla pública)
    await supabase.from('users').delete().eq('id', userId)

    // 6. Borrar usuario de Supabase Auth — libera el email para re-registro
    const { error: authErr } = await supabase.auth.admin.deleteUser(userId)
    if (authErr) return res.status(500).json({ error: 'Error borrando auth user', detail: authErr.message })
  }

  return res.status(200).json({ success: true })
}
