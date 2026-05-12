import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Clock, Zap, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const STEPS = [
  { label: 'Cuenta activada', done: true },
  { label: 'Configurando tu campaña en Meta Ads', done: false, active: true },
  { label: 'Conectando sistema de leads', done: false },
  { label: 'Dashboard listo para ti', done: false },
]

export default function Building() {
  const { clientId, clientData, profile, signOut, isMock } = useAuth()
  const navigate = useNavigate()
  const [dots, setDots] = useState('.')

  const firstName = (profile?.full_name || clientData?.company_name || '').split(' ')[0]

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 600)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (isMock) { navigate('/dashboard', { replace: true }); return }
    if (!clientId) return

    async function check() {
      const { data } = await supabase
        .from('campaigns')
        .select('id')
        .eq('client_id', clientId)
        .not('meta_form_id', 'is', null)
        .limit(1)

      if (data && data.length > 0) {
        navigate('/dashboard', { replace: true })
      }
    }

    check()
    const interval = setInterval(check, 15000)
    return () => clearInterval(interval)
  }, [clientId, isMock, navigate])

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-xl">LeadUnlock CRM</span>
        </div>

        {/* Icono animado */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-xl bg-green-500 animate-pulse" />
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle size={14} className="text-white" />
            </div>
          </div>
        </div>

        {/* Saludo + mensaje */}
        <div className="text-center mb-10">
          {firstName && (
            <p className="text-green-400 font-semibold text-lg mb-1">Hola, {firstName} 👋</p>
          )}
          <h1 className="text-2xl font-bold text-white mb-3">
            Estamos trabajando para ti{dots}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Te avisamos cuando todo esté listo. Vuelve pronto — esta página
            se actualiza automáticamente.
          </p>
        </div>

        {/* Timeline de pasos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 mb-6">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.done
                  ? 'bg-green-500'
                  : step.active
                  ? 'bg-slate-700 border-2 border-green-500'
                  : 'bg-slate-800 border border-slate-700'
              }`}>
                {step.done
                  ? <CheckCircle size={16} className="text-white" />
                  : step.active
                  ? <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  : <Clock size={14} className="text-slate-600" />
                }
              </div>
              <p className={`text-sm font-medium ${
                step.done ? 'text-green-400' : step.active ? 'text-white' : 'text-slate-600'
              }`}>
                {step.label}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-600 mb-8">
          Verificando automáticamente cada 15 segundos
        </p>

        {/* Cerrar sesión */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors text-sm"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
