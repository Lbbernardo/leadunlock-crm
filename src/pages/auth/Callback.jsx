import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Unlock } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Callback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/onboarding', { replace: true })
      }
    })
  }, [navigate])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Unlock size={22} className="text-white" />
        </div>
        <p className="text-white font-medium">Confirmando tu cuenta...</p>
        <p className="text-slate-500 text-sm mt-2">Espera un momento</p>
      </div>
    </div>
  )
}
