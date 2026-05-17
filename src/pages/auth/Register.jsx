import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Unlock, Mail, Lock, User, Building2, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'

export default function Register() {
  const [form, setForm] = useState({ fullName: '', companyName: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const { signUp } = useAuth()
  const timerRef = useRef(null)

  useEffect(() => {
    if (!confirmed) return
    setCountdown(60)
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timerRef.current); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [confirmed])

  async function handleResend() {
    setResending(true)
    await signUp(form.email, form.password, { full_name: form.fullName, company_name: form.companyName, role: 'client' })
    setResending(false)
    setResent(true)
    setCountdown(60)
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timerRef.current); return 0 }
        return c - 1
      })
    }, 1000)
    setTimeout(() => setResent(false), 3000)
  }

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

    const { error: err } = await signUp(form.email, form.password, {
      full_name: form.fullName,
      company_name: form.companyName,
      role: 'client',
    })

    if (err) {
      setError(err.message === 'User already registered'
        ? 'Este correo ya está registrado.'
        : err.message)
      setLoading(false)
    } else {
      setConfirmed(true)
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Revisa tu correo</h1>
          <p className="text-slate-400">
            Te enviamos un link de confirmación a <span className="text-white font-medium">{form.email}</span>.<br />
            Haz clic en el link para activar tu cuenta y continuar el registro.
          </p>
          <div className="mt-6">
            {countdown > 0 ? (
              <p className="text-slate-600 text-sm">¿No llegó? Puedes reenviar en <span className="text-slate-400 font-medium">{countdown}s</span></p>
            ) : resent ? (
              <p className="text-green-400 text-sm font-medium">¡Correo reenviado!</p>
            ) : (
              <button onClick={handleResend} disabled={resending}
                className="text-sm text-green-400 hover:text-green-300 font-medium transition-colors disabled:opacity-50">
                {resending ? 'Enviando...' : 'Reenviar correo de confirmación'}
              </button>
            )}
            <p className="text-slate-700 text-xs mt-2">Revisa también tu carpeta de spam.</p>
          </div>
        </div>
      </div>
    )
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
