import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Unlock, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error: err } = await signIn(email, password)
    if (err) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
    } else {
      const userId = data?.user?.id
      if (userId) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .maybeSingle()

        if (userData?.role === 'admin') {
          await supabase.auth.signOut()
          setError('Esta área es solo para clientes. Usa el acceso de administrador.')
          setLoading(false)
          return
        }
        const { data: clientData } = await supabase
          .from('clients')
          .select('status')
          .eq('user_id', userId)
          .maybeSingle()
        if (clientData?.status === 'pending') {
          navigate('/onboarding')
          return
        }
      }
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Unlock size={20} className="text-white" />
            </div>
            <span className="font-bold text-white text-xl">LeadUnlock</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Bienvenido de vuelta</h1>
          <p className="text-slate-400 mt-2">Ingresa a tu dashboard de leads</p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Correo electrónico</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300">Contraseña</label>
                <Link to="/forgot-password" className="text-xs text-green-400 hover:text-green-300 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-800 text-red-400 rounded-xl text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full py-3 text-base">
              Iniciar sesión
            </Button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-green-400 hover:text-green-300 font-medium transition-colors">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  )
}
