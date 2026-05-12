import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Unlock, Mail, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    await resetPassword(email)
    setSent(true)
    setLoading(false)
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
          <h1 className="text-2xl font-bold text-white">Recuperar contraseña</h1>
          <p className="text-slate-400 mt-2">Te enviamos un enlace de recuperación</p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <p className="text-white font-medium">Correo enviado</p>
              <p className="text-slate-400 text-sm">
                Si el correo existe, recibirás un enlace para restablecer tu contraseña.
              </p>
              <Link
                to="/login"
                className="inline-block text-green-400 hover:text-green-300 text-sm font-medium transition-colors mt-4"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
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
              <Button type="submit" loading={loading} className="w-full py-3">
                Enviar enlace de recuperación
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          <Link to="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
            ← Volver al login
          </Link>
        </p>
      </div>
    </div>
  )
}
