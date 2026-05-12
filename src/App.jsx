import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ClientDashboard from './pages/dashboard/ClientDashboard'
import LeadDetail from './pages/dashboard/LeadDetail'
import Billing from './pages/dashboard/Billing'
import Help from './pages/dashboard/Help'
import Profile from './pages/dashboard/Profile'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminFinanzas from './pages/admin/AdminFinanzas'
import Manual from './pages/admin/Manual'
import Onboarding from './pages/onboarding/Onboarding'
import Building from './pages/dashboard/Building'
import Privacy from './pages/Privacy'
import ResetPassword from './pages/auth/ResetPassword'

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400" />
      <p className="text-slate-400 text-sm">Cargando...</p>
    </div>
  </div>
)

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/dashboard" replace />

  return children
}

// Solo para rutas del dashboard de clientes — requiere cuenta activa y campaña configurada
function ClientRoute({ children }) {
  const { user, profile, clientData, loading, isMock } = useAuth()
  const [campaignReady, setCampaignReady] = useState(isMock ? true : null)

  useEffect(() => {
    if (isMock || !clientData?.id) return
    supabase
      .from('campaigns')
      .select('id')
      .eq('client_id', clientData.id)
      .not('meta_form_id', 'is', null)
      .limit(1)
      .then(({ data }) => setCampaignReady(data != null && data.length > 0))
  }, [clientData?.id, isMock])

  if (loading || campaignReady === null) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />

  const status = clientData?.status
  if (status === 'pending' || !status) return <Navigate to="/onboarding" replace />
  if (!campaignReady) return <Navigate to="/building" replace />

  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/dashboard" element={<ClientRoute><ClientDashboard /></ClientRoute>} />
          <Route path="/dashboard/leads/:id" element={<ClientRoute><LeadDetail /></ClientRoute>} />
          <Route path="/dashboard/billing" element={<ClientRoute><Billing /></ClientRoute>} />
          <Route path="/dashboard/help" element={<ClientRoute><Help /></ClientRoute>} />
          <Route path="/dashboard/profile" element={<ClientRoute><Profile /></ClientRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/finanzas" element={<ProtectedRoute adminOnly><AdminFinanzas /></ProtectedRoute>} />
          <Route path="/admin/manual" element={<ProtectedRoute adminOnly><Manual /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/building" element={<ProtectedRoute><Building /></ProtectedRoute>} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
