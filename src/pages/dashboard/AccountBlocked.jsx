import { useAuth } from '../../context/AuthContext'
import { Unlock, PauseCircle, Ban } from 'lucide-react'

export default function AccountBlocked() {
  const { clientData, signOut } = useAuth()
  const banned = clientData?.status === 'banned'

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${banned ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
          {banned
            ? <Ban size={32} className="text-red-400" />
            : <PauseCircle size={32} className="text-yellow-400" />
          }
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          {banned ? 'Cuenta suspendida' : 'Cuenta pausada'}
        </h1>

        <p className="text-slate-400 leading-relaxed">
          {banned
            ? 'Tu cuenta ha sido suspendida. Si crees que esto es un error, contáctanos.'
            : 'Tu cuenta está temporalmente pausada. Contáctanos para reactivarla.'
          }
        </p>

        <a
          href="mailto:lbbernardoo@gmail.com"
          className="inline-block mt-6 px-6 py-3 bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-semibold rounded-xl border border-white/[0.1] transition-colors"
        >
          Contactar soporte
        </a>

        <button
          onClick={signOut}
          className="block mx-auto mt-4 text-sm text-slate-500 hover:text-slate-400 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
