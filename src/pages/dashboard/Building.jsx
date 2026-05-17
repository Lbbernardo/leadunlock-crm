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

        {/* Soporte WhatsApp */}
        <a
          href="https://wa.me/16304154252"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-colors text-sm font-medium mb-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Contactar soporte
        </a>

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
