import { useState, useEffect, useCallback } from 'react'
import { Users, Unlock, DollarSign, AlertTriangle, CreditCard, Zap, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import LeadCard from '../../components/leads/LeadCard'
import LeadFilters from '../../components/leads/LeadFilters'
import PaymentModal from '../../components/billing/PaymentModal'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const MOCK_LEADS = [
  { id: '1', full_name: 'Carlos Mendoza', phone: '+1 305 123 4567', email: 'carlos@ejemplo.com', city: 'Miami', state: 'FL', category: 'Gastos finales', product_interest: 'Final Expense', source: 'Meta Ads', campaign_name: 'Camp_FE_Miami', is_unlocked: true, price: null, status: 'interested', notes: 'Muy interesado, llamar en la tarde.', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: '2', full_name: 'María López García', phone: '+1 407 987 6543', email: 'maria.lg@ejemplo.com', city: 'Orlando', state: 'FL', category: 'Gastos finales', product_interest: 'Medicare', source: 'Meta Ads', campaign_name: 'Camp_Medicare_FL', is_unlocked: false, price: 15, status: 'new', notes: null, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: '3', full_name: 'Roberto Sánchez', phone: '+1 713 555 6666', email: 'roberto.s@ejemplo.com', city: 'Houston', state: 'TX', category: 'Gastos finales', product_interest: 'Whole Life', source: 'Meta Ads', campaign_name: 'Camp_WL_TX', is_unlocked: false, price: 15, status: 'new', notes: null, created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: '4', full_name: 'Ana Flores Ramos', phone: '+1 305 222 3333', email: 'ana.fr@ejemplo.com', city: 'Miami', state: 'FL', category: 'Gastos finales', product_interest: 'Anualidades', source: 'Meta Ads', campaign_name: 'Camp_FE_Miami', is_unlocked: true, price: null, status: 'contacted', notes: 'Agendé llamada para el viernes.', created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: '5', full_name: 'Luis Torres Vega', phone: '+1 619 111 2222', email: 'luis.tv@ejemplo.com', city: 'San Diego', state: 'CA', category: 'Gastos finales', product_interest: 'Final Expense', source: 'Meta Ads', campaign_name: 'Camp_FE_CA', is_unlocked: false, price: 15, status: 'new', notes: null, created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: '6', full_name: 'Patricia Herrera', phone: '+1 832 444 5555', email: 'pati.h@ejemplo.com', city: 'Houston', state: 'TX', category: 'Gastos finales', product_interest: 'Medicare', source: 'Meta Ads', campaign_name: 'Camp_Medicare_TX', is_unlocked: false, price: 15, status: 'new', notes: null, created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
]

function StatCard({ icon: Icon, label, value, sub, accent = false }) {
  return (
    <div className={`rounded-2xl border p-5 transition-all ${
      accent
        ? 'bg-green-500/[0.07] border-green-500/25'
        : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.05]'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
          accent ? 'bg-green-500/20' : 'bg-white/[0.05]'
        }`}>
          <Icon size={16} className={accent ? 'text-green-400' : 'text-white/30'} />
        </div>
      </div>
      <p className="text-2xl font-black text-white tracking-tight">{value}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  )
}

function PaymentMethodBanner({ clientData }) {
  if (!clientData) return null
  if (clientData.status === 'payment_required') {
    return (
      <div className="flex items-start gap-3 bg-red-500/[0.08] border border-red-500/25 rounded-2xl p-4 mb-6">
        <AlertTriangle size={17} className="text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-300 font-semibold text-sm">Tu tarjeta fue rechazada</p>
          <p className="text-red-400/70 text-xs mt-0.5">No podrás desbloquear leads hasta que actualices tu método de pago.</p>
        </div>
        <Link to="/dashboard/profile"
          className="flex items-center gap-1.5 text-xs font-semibold text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-xl transition-colors flex-shrink-0">
          <CreditCard size={12} /> Actualizar
        </Link>
      </div>
    )
  }
  if (!clientData.payment_method_last4) {
    return (
      <div className="flex items-start gap-3 bg-amber-500/[0.07] border border-amber-500/20 rounded-2xl p-4 mb-6">
        <AlertTriangle size={17} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-amber-300 font-semibold text-sm">Sin método de pago activo</p>
          <p className="text-amber-400/60 text-xs mt-0.5">Agrega una tarjeta para poder desbloquear tus leads.</p>
        </div>
        <Link to="/dashboard/profile"
          className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3 py-1.5 rounded-xl transition-colors flex-shrink-0">
          <CreditCard size={12} /> Agregar tarjeta
        </Link>
      </div>
    )
  }
  return null
}

const POLL_MS = 30000

export default function ClientDashboard() {
  const { clientId, isMock, clientData } = useAuth()
  const [leads, setLeads] = useState(isMock ? MOCK_LEADS : [])
  const [tab, setTab] = useState('pool')
  const [filters, setFilters] = useState({ search: '', status: '' })
  const [selectedLead, setSelectedLead] = useState(null)
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [loading, setLoading] = useState(!isMock)

  const loadLeads = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_pool_leads')
    if (!error) setLeads(data || [])
    setLoading(false)
  }, [])

  // Los leads del pool cambian solos (otros agentes los toman): refrescar cada 30s
  useEffect(() => {
    if (isMock || !clientId) { setLoading(false); return }
    loadLeads()
    const timer = setInterval(loadLeads, POLL_MS)
    return () => clearInterval(timer)
  }, [clientId, isMock, loadLeads])

  const poolLeads = leads.filter(l => !l.is_unlocked)
  const myLeads = leads.filter(l => l.is_unlocked)
  const tabLeads = tab === 'pool' ? poolLeads : myLeads

  const filtered = tabLeads
    .filter((lead) => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (
          !lead.full_name?.toLowerCase().includes(q) &&
          !lead.city?.toLowerCase().includes(q) &&
          !lead.category?.toLowerCase().includes(q)
        ) return false
      }
      if (filters.status && lead.status !== filters.status) return false
      return true
    })
    .sort((a, b) => new Date(b.claimed_at || b.created_at) - new Date(a.claimed_at || a.created_at))

  const freshPool = poolLeads.filter(l => Date.now() - new Date(l.created_at) < 86400000).length

  function handleUnlock(lead) {
    setSelectedLead(lead)
    setPayModalOpen(true)
  }

  function handleUnlockSuccess() {
    setTab('mine')
    loadLeads()
  }

  function handleLeadTaken(leadId) {
    setLeads((prev) => prev.filter((l) => l.id !== leadId))
  }

  const noPrefs = !isMock && clientData && !(clientData.pool_categories?.length) && !(clientData.pool_states?.length)

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-semibold uppercase tracking-widest">En vivo</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Dashboard de Leads</h1>
          <p className="text-white/35 mt-1 text-sm">El primer agente que desbloquea un lead se lo queda. Los precios bajan con el tiempo.</p>
        </div>

        <PaymentMethodBanner clientData={clientData} />

        {noPrefs && (
          <div className="flex items-start gap-3 bg-blue-500/[0.07] border border-blue-500/20 rounded-2xl p-4 mb-6">
            <Settings2 size={17} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-blue-300 font-semibold text-sm">Estás viendo leads de todos los nichos y estados</p>
              <p className="text-blue-400/60 text-xs mt-0.5">Elige dónde tienes licencia para ver solo los leads que puedes trabajar.</p>
            </div>
            <Link to="/dashboard/profile"
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-xl transition-colors flex-shrink-0">
              Configurar
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard icon={Zap} label="Disponibles" value={poolLeads.length} sub="en el pool para ti" accent />
          <StatCard icon={Users} label="Nuevos hoy" value={freshPool} sub="últimas 24 horas" />
          <StatCard icon={Unlock} label="Mis leads" value={myLeads.length} sub="desbloqueados" />
          <StatCard icon={DollarSign} label="Crédito" value={`$${Number(clientData?.balance || 0).toLocaleString()}`} sub="disponible" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { id: 'pool', label: 'Disponibles', count: poolLeads.length },
            { id: 'mine', label: 'Mis leads', count: myLeads.length },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                tab === t.id
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                  : 'bg-white/[0.04] text-white/50 hover:text-white/80 border border-white/[0.07]'
              }`}
            >
              {t.label} <span className="opacity-60 ml-1">{t.count}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-5">
          <LeadFilters filters={filters} onChange={setFilters} showStatus={tab === 'mine'} />
        </div>

        {/* Lead grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 border border-white/[0.05] rounded-2xl bg-white/[0.02]">
            <div className="w-12 h-12 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users size={22} className="text-white/20" />
            </div>
            <p className="text-white/30 text-sm font-medium">
              {tabLeads.length > 0
                ? 'No se encontraron leads con esos filtros.'
                : tab === 'pool' ? 'No hay leads disponibles en este momento.' : 'Aún no has desbloqueado leads.'}
            </p>
            <p className="text-white/15 text-xs mt-1">
              {tab === 'pool' ? 'Te avisamos por email y SMS en cuanto entre uno nuevo.' : 'Revisa la pestaña Disponibles.'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onUnlock={handleUnlock} />
            ))}
          </div>
        )}
      </div>

      <PaymentModal
        open={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        lead={selectedLead}
        clientId={clientId}
        leadPrice={selectedLead?.price}
        onSuccess={handleUnlockSuccess}
        onTaken={handleLeadTaken}
      />
    </DashboardLayout>
  )
}
