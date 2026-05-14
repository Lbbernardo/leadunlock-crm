import { useState, useEffect } from 'react'
import { Wallet, Unlock, DollarSign, TrendingUp, CheckCircle, CreditCard, Coins } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const MOCK_UNLOCKED_LEADS = [
  { id: '1', full_name: 'Carlos Mendoza', amount: 20, unlocked_at: new Date(Date.now() - 1 * 86400000).toISOString(), campaign: 'Camp_FE_Miami', payment_method: 'card' },
  { id: '4', full_name: 'Ana Flores Ramos', amount: 15, unlocked_at: new Date(Date.now() - 4 * 86400000).toISOString(), campaign: 'Camp_FE_Miami', payment_method: 'credit' },
  { id: '7', full_name: 'Jorge Ramírez Díaz', amount: 12, unlocked_at: new Date(Date.now() - 7 * 86400000).toISOString(), campaign: 'Camp_Medicare_FL', payment_method: 'credit' },
  { id: '8', full_name: 'María Torres', amount: 20, unlocked_at: new Date(Date.now() - 10 * 86400000).toISOString(), campaign: 'Camp_FE_Miami', payment_method: 'card' },
]

const THRESHOLD_AMOUNT = 1000
const THRESHOLD_LEADS = 50

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX', { dateStyle: 'medium' })
}

const TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'card', label: 'Tarjeta' },
  { id: 'credit', label: 'Crédito' },
]

export default function Billing() {
  const { clientId, clientData, isMock } = useAuth()
  const [unlockedLeads, setUnlockedLeads] = useState(isMock ? MOCK_UNLOCKED_LEADS : [])
  const [loading, setLoading] = useState(!isMock)
  const [tab, setTab] = useState('all')

  const balance = clientData?.balance || 0
  const leadPrice = clientData?.lead_price ?? null
  const leadsAvailable = leadPrice ? Math.floor(balance / leadPrice) : null
  const totalSpent = unlockedLeads.reduce((sum, l) => sum + Number(l.amount), 0)
  const totalCard = unlockedLeads.filter(l => l.payment_method === 'card').reduce((s, l) => s + Number(l.amount), 0)
  const totalCredit = unlockedLeads.filter(l => l.payment_method === 'credit').reduce((s, l) => s + Number(l.amount), 0)
  const countCard = unlockedLeads.filter(l => l.payment_method === 'card').length
  const countCredit = unlockedLeads.filter(l => l.payment_method === 'credit').length
  const progressPct = Math.min(100, (totalSpent / THRESHOLD_AMOUNT) * 100)
  const leadsPct = Math.min(100, (unlockedLeads.length / THRESHOLD_LEADS) * 100)
  const hasCredit = balance > 0

  const filtered = tab === 'all' ? unlockedLeads
    : unlockedLeads.filter(l => l.payment_method === tab)

  useEffect(() => {
    if (isMock || !clientId) return
    setLoading(true)
    supabase
      .from('lead_unlocks')
      .select('id, amount_paid, created_at, payment_method, leads(full_name, campaign_name)')
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
            payment_method: u.payment_method || 'credit',
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
      <div className="p-4 sm:p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight">Facturación</h1>
          <p className="text-white/35 mt-1 text-sm">Tu saldo, crédito e historial de desbloqueos</p>
        </div>

        {/* Crédito alcanzado */}
        {progressPct >= 100 && (
          <div className="mb-6 bg-green-500/[0.08] border border-green-500/25 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle size={20} className="text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-green-300">¡Alcanzaste $1,000 en leads!</p>
              <p className="text-sm text-green-400/70 mt-0.5">
                Tu crédito de $100 de activación ha sido devuelto a tu cuenta.
              </p>
            </div>
          </div>
        )}

        {/* KPI principal — crédito */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className={`rounded-2xl border p-5 col-span-2 sm:col-span-1 ${hasCredit ? 'bg-green-500/[0.07] border-green-500/25' : 'bg-white/[0.03] border-white/[0.07]'}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-white/40 uppercase tracking-wide">Crédito disponible</p>
              <Wallet size={15} className={hasCredit ? 'text-green-400' : 'text-white/25'} />
            </div>
            <p className={`text-2xl font-black tracking-tight ${hasCredit ? 'text-green-400' : 'text-white/30'}`}>
              ${balance.toLocaleString()}
            </p>
            <p className="text-xs text-white/25 mt-1">{leadPrice ? `$${leadPrice} por lead` : 'Precio por configurar'}</p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-white/40 uppercase tracking-wide">Leads disponibles</p>
              <Unlock size={15} className="text-blue-400" />
            </div>
            <p className="text-2xl font-black text-white tracking-tight">{leadsAvailable ?? '—'}</p>
            <p className="text-xs text-white/25 mt-1">con tu crédito</p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-white/40 uppercase tracking-wide">Desbloqueados</p>
              <CheckCircle size={15} className="text-green-400" />
            </div>
            <p className="text-2xl font-black text-white tracking-tight">{unlockedLeads.length}</p>
            <p className="text-xs text-white/25 mt-1">de {THRESHOLD_LEADS} meta</p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-white/40 uppercase tracking-wide">Total gastado</p>
              <DollarSign size={15} className="text-white/25" />
            </div>
            <p className="text-2xl font-black text-white tracking-tight">${totalSpent.toLocaleString()}</p>
            <p className="text-xs text-white/25 mt-1">de ${THRESHOLD_AMOUNT.toLocaleString()}</p>
          </div>
        </div>

        {/* Desglose por método de pago */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="bg-blue-500/[0.06] border border-blue-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-blue-500/15 rounded-xl flex items-center justify-center">
                <CreditCard size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Pagado con tarjeta</p>
                <p className="text-xs text-white/30">{countCard} {countCard === 1 ? 'lead' : 'leads'}</p>
              </div>
            </div>
            <p className="text-3xl font-black text-blue-400 tracking-tight">${totalCard.toLocaleString()}</p>
          </div>

          <div className="bg-green-500/[0.06] border border-green-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-green-500/15 rounded-xl flex items-center justify-center">
                <Coins size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Pagado con crédito</p>
                <p className="text-xs text-white/30">{countCredit} {countCredit === 1 ? 'lead' : 'leads'}</p>
              </div>
            </div>
            <p className="text-3xl font-black text-green-400 tracking-tight">${totalCredit.toLocaleString()}</p>
          </div>
        </div>

        {/* Progreso */}
        <div className="bg-white/[0.02] rounded-2xl border border-white/[0.07] p-5 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={15} className="text-white/30" />
            <p className="font-semibold text-white/70 text-sm">Progreso hacia la meta</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/40">Gasto total</span>
                <span className="font-semibold text-white">${totalSpent} / ${THRESHOLD_AMOUNT}</span>
              </div>
              <div className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${progressPct >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-xs text-white/25 mt-1.5">{progressPct.toFixed(0)}% completado</p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/40">Leads desbloqueados</span>
                <span className="font-semibold text-white">{unlockedLeads.length} / {THRESHOLD_LEADS}</span>
              </div>
              <div className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${leadsPct >= 100 ? 'bg-green-500' : 'bg-emerald-500'}`}
                  style={{ width: `${leadsPct}%` }} />
              </div>
              <p className="text-xs text-white/25 mt-1.5">{leadsPct.toFixed(0)}% completado</p>
            </div>
          </div>
          {(progressPct >= 100 || leadsPct >= 100) && (
            <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-sm text-green-400 font-medium text-center">
              Meta alcanzada — Habla con tu asesor para revisar tu plan
            </div>
          )}
        </div>

        {/* Historial */}
        <div className="bg-white/[0.02] rounded-2xl border border-white/[0.07]">
          <div className="p-5 border-b border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
            <h2 className="font-bold text-white text-sm">Historial de desbloqueos</h2>
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    tab === t.id
                      ? 'bg-white/[0.1] text-white'
                      : 'text-white/35 hover:text-white/60'
                  }`}
                >
                  {t.label}
                  {t.id === 'card' && countCard > 0 && (
                    <span className="ml-1.5 bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full text-[10px]">{countCard}</span>
                  )}
                  {t.id === 'credit' && countCredit > 0 && (
                    <span className="ml-1.5 bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full text-[10px]">{countCredit}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {filtered.length === 0 ? (
              <p className="text-center text-white/25 text-sm py-10">No hay registros en esta categoría.</p>
            ) : filtered.map((item) => {
              const isCard = item.payment_method === 'card'
              return (
                <div key={item.id} className="flex items-center justify-between p-4 sm:p-5 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isCard ? 'bg-blue-500/10' : 'bg-green-500/10'
                    }`}>
                      {isCard
                        ? <CreditCard size={15} className="text-blue-400" />
                        : <Coins size={15} className="text-green-400" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white text-sm truncate">{item.full_name}</p>
                      <p className="text-xs text-white/30 truncate">{item.campaign} · {formatDate(item.unlocked_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      isCard
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'bg-green-500/15 text-green-400'
                    }`}>
                      {isCard ? 'Tarjeta' : 'Crédito'}
                    </span>
                    <span className="font-bold text-white text-sm">-${item.amount}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
