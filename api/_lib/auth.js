// Helpers de autenticación para las API routes.
// El frontend manda `Authorization: Bearer <access_token>` de Supabase.

export async function getAuthUser(req, supabase) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single()

  return { id: user.id, isAdmin: profile?.role === 'admin' }
}

// Retorna el usuario si es dueño del cliente (o admin); si no, responde 401/403 y retorna null.
export async function requireClientOwner(req, res, supabase, clientId) {
  const user = await getAuthUser(req, supabase)
  if (!user) {
    res.status(401).json({ error: 'unauthorized' })
    return null
  }
  if (user.isAdmin) return user

  const { data: client } = await supabase
    .from('clients').select('user_id').eq('id', clientId).single()
  if (!client || client.user_id !== user.id) {
    res.status(403).json({ error: 'Forbidden' })
    return null
  }
  return user
}
