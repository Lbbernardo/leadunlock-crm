import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

const IS_MOCK = import.meta.env.DEV && (
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
)

const MOCK_USER = { id: 'mock-user-id', email: 'demo@leadunlock.com' }
const MOCK_PROFILE = {
  id: 'mock-user-id',
  email: 'demo@leadunlock.com',
  full_name: 'Usuario Demo',
  role: 'admin',
  clients: [{ id: 'mock-client-id', company_name: 'Mi Empresa Demo', lead_price: 20, balance: 0 }],
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(IS_MOCK ? MOCK_USER : null)
  const [profile, setProfile] = useState(IS_MOCK ? MOCK_PROFILE : null)
  const [loading, setLoading] = useState(!IS_MOCK)

  useEffect(() => {
    if (IS_MOCK) return

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) { setLoading(false); return }
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    }).catch(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('users')
      .select('*, clients(*)')
      .eq('id', userId)
      .single()
    if (data && data.clients && !Array.isArray(data.clients)) {
      data.clients = [data.clients]
    }
    setProfile(data)
    setLoading(false)
  }

  async function refreshProfile() {
    if (!user?.id) return
    const { data } = await supabase
      .from('users')
      .select('*, clients(*)')
      .eq('id', user.id)
      .single()
    if (data) {
      if (data.clients && !Array.isArray(data.clients)) data.clients = [data.clients]
      setProfile(data)
    }
  }

  const signIn = IS_MOCK
    ? async () => ({ error: null })
    : (email, password) => supabase.auth.signInWithPassword({ email, password })

  const signUp = IS_MOCK
    ? async () => ({ error: null })
    : (email, password, metadata) => supabase.auth.signUp({ email, password, options: { data: metadata, emailRedirectTo: 'https://unlocklead.click/auth/callback' } })

  const signOut = IS_MOCK
    ? async () => {}
    : () => supabase.auth.signOut()

  const resetPassword = IS_MOCK
    ? async () => {}
    : (email) => supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

  const isAdmin = profile?.role === 'admin'
  const clientId = profile?.clients?.[0]?.id
  const clientData = profile?.clients?.[0]

  return (
    <AuthContext.Provider value={{
      user, profile, isAdmin, clientId, clientData, loading,
      signIn, signUp, signOut, resetPassword, refreshProfile, isMock: IS_MOCK,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
