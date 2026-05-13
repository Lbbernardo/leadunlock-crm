import { useState, useEffect } from 'react'
import { Wallet, Unlock, DollarSign, TrendingUp, CheckCircle } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const MOCK_UNLOCKED_LEADS = [
  { id: '1', full_name: 'Carlos Mendoza', amount: 20, unlocked_at: new Date(Date.now() - 1 * 86400000).toISOString(), campaign: 'Camp_Hipoteca_Q1' },
  { id: '4', full_name: 'Ana Flores Ramos', amount: 20, unlocked_at: new Date(Date.now() - 4 * 86400000).toISOString(), campaign: 'Camp_PyME_CDMX' },
  { id: '7', full_name: 'Jorge Ramírez Díaz', amount: 20, unlocked_at: new Date(Date.now() - 7 * 86400000).toISOString(), campaign: 'Camp_Seguros_EDOMEX' },
]

const THRESHOLD_AMOUNT = 1000
const THRESHOLD_LEADS = 50

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX', { dateStyle: 'medium' })
}

export default function Billing() {
  const { clientId, clientData, isMock } = useAuth()
  const [unlockedLeads, setUnlockedLeads] = useState(isMock ? MOCK_UNLOCKED_LEADS : [])
  const [loading, setLoading] = useState(!isMock)

  const balance = clientData?.balance || 0
  const leadPrice = clientData?.lead_price ?? null
  const leadsAvailable = leadPrice ? Math.floor(balance / leadPrice) : null
  const totalSpent = unlockedLeads.reduce((sum, l) => sum + Number(l.amount), 0)
  const progressPct = Math.min(100, (totalSpent / THRESHOLD_AMOUNT) * 100)
  const leadsPct = Math.min(100, (unlockedLeads.length / THRESHOLD_LEADS) * 100)
  const hasCredit = balance > 0

  useEffect(() => {
    if (isMock || !clientId) return
    setLoading(true)
    supabase
      .from('lead_unlocks')
      .select('id, amount_paid, created_at, leads(full_name, campaign_name)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .then(({ data: unlocks }) => {
        if (unlocks) {
          setUnlockedLeads(unlocks.map(u => ({
            id: u.id,
            full_name: u.leads?.full_name || '—',
            amount: u.amount_paid,
            unlocked_at: u.created_at,
            campaign: u.leads?.campaign_name || '—',
          })))
        }
        setLoading(false)
      })
  }, [clientId, isMock])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Facturación & Crédito</h1>
          <p className="text-slate-500 mt-1">Tu saldo y historial de desbloqueos</p>
        </div>

        {/* Aviso de crédito al llegar a $1,000 */}
        {progressPct >= 100 && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle size={20} className="text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-green-800">¡Alcanzaste $1,000 en leads!</p>
              <p className="text-sm text-green-700 mt-0.5">
                Tu crédito de $100 de activación ha sido devuelto a tu cuenta. Úsalo para desbloquear más leads.
              </p>
            </div>
          </div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className={`rounded-2xl border p-5 ${hasCredit ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500">Crédito disponible</p>
              <Wallet size={16} className={hasCredit ? 'text-green-500' : 'text-slate-400'} />
            </div>
            <p className={`text-2xl font-bold ${hasCredit ? 'text-green-600' : 'text-slate-400'}`}>
              ${balance.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">${leadPrice} por lead</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500">Leads disponibles</p>
              <Unlock size={16} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{leadsAvailable ?? '—'}</p>
            <p className="text-xs text-slate-400 mt-0.5">con tu crédito actual</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500">Desbloqueados</p>
              <CheckCircle size={16} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{unlockedLeads.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">de {THRESHOLD_LEADS} leads</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500">Total consumido</p>
              <DollarSign size={16} className="text-slate-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">${totalSpent.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-0.5">de ${THRESHOLD_AMOUNT.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress toward threshold */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-slate-500" />
            <p className="font-semibold text-slate-900 text-sm">Progreso hacia la meta</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-500">Gasto en leads</span>
                <span className="font-semibold text-slate-900">${totalSpent} / ${THRESHOLD_AMOUNT}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${progressPct >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">{progressPct.toFixed(0)}% completado</p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-500">Leads desbloqueados</span>
                <span className="font-semibold text-slate-900">{unlockedLeads.length} / {THRESHOLD_LEADS}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${leadsPct >= 100 ? 'bg-green-500' : 'bg-emerald-500'}`}
                  style={{ width: `${leadsPct}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">{leadsPct.toFixed(0)}% completado</p>
            </div>
          </div>
          {(progressPct >= 100 || leadsPct >= 100) && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 font-medium text-center">
              Meta alcanzada — Habla con tu asesor para revisar tu plan
            </div>
          )}
        </div>

        {/* Unlock history */}
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Historial de desbloqueos</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {unlockedLeads.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-10">Aún no has desbloqueado ningún lead.</p>
            ) : unlockedLeads.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                    <Unlock size={16} className="text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{item.full_name}</p>
                    <p className="text-xs text-slate-400">{item.campaign} · {formatDate(item.unlocked_at)}</p>
                  </div>
                </div>
                <span className="font-semibold text-slate-900">-${item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
