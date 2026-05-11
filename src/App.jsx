import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ClientDashboard from './pages/dashboard/ClientDashboard'
import LeadDetail from './pages/dashboard/LeadDetail'
import Billing from './pages/dashboard/Billing'
import Help from './pages/dashboard/Help'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminFinanzas from './pages/admin/AdminFinanzas'
import Onboarding from './pages/onboarding/Onboarding'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400" />
          <p className="text-slate-400 text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/dashboard" replace />

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
          <Route path="/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/leads/:id" element={<ProtectedRoute><LeadDetail /></ProtectedRoute>} />
          <Route path="/dashboard/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
          <Route path="/dashboard/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/finanzas" element={<ProtectedRoute adminOnly><AdminFinanzas /></ProtectedRoute>} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
