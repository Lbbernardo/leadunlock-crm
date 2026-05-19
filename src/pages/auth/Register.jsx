import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Unlock, Mail, Lock, User, Building2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'

export default function Register() {
  const [form, setForm] = useState({ fullName: '', companyName: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    setLoading(true)
    setError(null)

    const { data, error: err } = await signUp(form.email, form.password, {
      full_name: form.fullName,
      company_name: form.companyName,
      role: 'client',
    })

    const alreadyExists =
      err?.message?.toLowerCase().includes('already registered') ||
      err?.message?.toLowerCase().includes('already been registered') ||
      err?.status === 422 ||
      (data?.user && !data?.session)

    if (alreadyExists) {
      setError('Este correo ya tiene una cuenta. Inicia sesión o usa otro correo.')
      setLoading(false)
    } else if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'notify-registration', name: form.fullName, email: form.email }),
      }).catch(() => {})
      navigate('/onboarding')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Unlock size={20} className="text-white" />
            </div>
            <span className="font-bold text-white text-xl">LeadUnlock</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Crea tu cuenta</h1>
          <p className="text-slate-400 mt-2">Empieza a recibir leads en minutos</p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nombre completo</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  name="fullName"
                  required
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Juan García"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Empresa (opcional)</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Mi Empresa S.A."
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Correo electrónico</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@correo.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
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

            <Button type="submit" loading={loading} className="w-full py-3 text-base mt-2">
              Crear cuenta
            </Button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
