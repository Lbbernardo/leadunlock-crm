import { useState, useEffect } from 'react'
import { Users, Unlock, DollarSign, TrendingUp, AlertTriangle, CreditCard, Rocket, CheckCircle2, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import LeadCard from '../../components/leads/LeadCard'
import LeadFilters from '../../components/leads/LeadFilters'
import PaymentModal from '../../components/billing/PaymentModal'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const MOCK_LEADS = [
  { id: '1', full_name: 'Carlos Mendoza', phone: '+1 305 123 4567', email: 'carlos@ejemplo.com', city: 'Miami', state: 'FL', product_interest: 'Final Expense', source: 'Meta Ads', campaign_name: 'Camp_FE_Miami', is_locked: false, is_unlocked: true, status: 'interested', notes: 'Muy interesado, llamar en la tarde.', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: '2', full_name: 'María López García', phone: '+1 407 987 6543', email: 'maria.lg@ejemplo.com', city: 'Orlando', state: 'FL', product_interest: 'Medicare', source: 'Meta Ads', campaign_name: 'Camp_Medicare_FL', is_locked: true, is_unlocked: false, status: 'new', notes: null, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: '3', full_name: 'Roberto Sánchez', phone: '+1 713 555 6666', email: 'roberto.s@ejemplo.com', city: 'Houston', state: 'TX', product_interest: 'Whole Life', source: 'Meta Ads', campaign_name: 'Camp_WL_TX', is_locked: true, is_unlocked: false, status: 'new', notes: null, created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: '4', full_name: 'Ana Flores Ramos', phone: '+1 305 222 3333', email: 'ana.fr@ejemplo.com', city: 'Miami', state: 'FL', product_interest: 'Anualidades', source: 'Meta Ads', campaign_name: 'Camp_FE_Miami', is_locked: false, is_unlocked: true, status: 'contacted', notes: 'Agendé llamada para el viernes.', created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: '5', full_name: 'Luis Torres Vega', phone: '+1 619 111 2222', email: 'luis.tv@ejemplo.com', city: 'San Diego', state: 'CA', product_interest: 'Final Expense', source: 'Meta Ads', campaign_name: 'Camp_FE_CA', is_locked: true, is_unlocked: false, status: 'new', notes: null, created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: '6', full_name: 'Patricia Herrera', phone: '+1 832 444 5555', email: 'pati.h@ejemplo.com', city: 'Houston', state: 'TX', product_interest: 'Medicare', source: 'Meta Ads', campaign_name: 'Camp_Medicare_TX', is_locked: true, is_unlocked: false, status: 'new', notes: null, created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
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

export default function ClientDashboard() {
  const { clientId, isMock, clientData } = useAuth()
  const [leads, setLeads] = useState(isMock ? MOCK_LEADS : [])
  const [campaigns, setCampaigns] = useState([])
  const [filters, setFilters] = useState({ search: '', status: '', locked: '' })
  const [selectedLead, setSelectedLead] = useState(null)
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [loading, setLoading] = useState(!isMock)

  useEffect(() => {
    if (isMock || !clientId) { setLoading(false); return }
    setLoading(true)
    Promise.all([
      supabase.rpc('get_client_leads', { p_client_id: clientId }),
      supabase.from('campaigns').select('id, name, source, is_active, interest_category').eq('client_id', clientId).eq('is_active', true),
    ]).then(([leadsRes, campRes]) => {
      if (!leadsRes.error) setLeads(leadsRes.data || [])
      if (!campRes.error) setCampaigns(campRes.data || [])
      setLoading(false)
    })
  }, [clientId, isMock])

  const filtered = leads.filter((lead) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (
        !lead.full_name.toLowerCase().includes(q) &&
        !lead.city?.toLowerCase().includes(q) &&
        !lead.campaign_name?.toLowerCase().includes(q)
      ) return false
    }
    if (filters.status && lead.status !== filters.status) return false
    if (filters.locked === 'locked' && lead.is_unlocked) return false
    if (filters.locked === 'unlocked' && !lead.is_unlocked) return false
    return true
  })

  const totalLeads = leads.length
  const unlockedLeads = leads.filter((l) => l.is_unlocked).length
  const lockedLeads = leads.filter((l) => !l.is_unlocked).length
  const totalSpent = leads.filter((l) => l.is_unlocked).reduce((sum, l) => sum + (l.price ? Math.round(l.price) : 12), 0)

  function handleUnlock(lead) {
    setSelectedLead(lead)
    setPayModalOpen(true)
  }

  function handleUnlockSuccess(leadId) {
    setLeads((prev) =>
      prev.map((l) => l.id === leadId ? { ...l, is_locked: false, is_unlocked: true } : l),
    )
  }

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
          <p className="text-white/35 mt-1 text-sm">Gestiona y desbloquea tus leads de campañas activas</p>
        </div>

        <PaymentMethodBanner clientData={clientData} />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard icon={Users} label="Total leads" value={totalLeads} sub="recibidos" />
          <StatCard icon={Unlock} label="Desbloqueados" value={unlockedLeads} sub={`${totalLeads > 0 ? Math.round(unlockedLeads / totalLeads * 100) : 0}% conversión`} accent />
          <StatCard icon={Lock} label="Bloqueados" value={lockedLeads} sub="disponibles" />
          <StatCard icon={DollarSign} label="Total gastado" value={`$${totalSpent}`} sub="en leads" />
        </div>

        {/* Campaigns */}
        {campaigns.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-3">Campañas activas</p>
            <div className="flex flex-wrap gap-3">
              {campaigns.map(camp => (
                <div key={camp.id} className="flex items-center gap-3 bg-green-500/[0.07] border border-green-500/20 rounded-2xl px-4 py-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Rocket size={14} className="text-green-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-white">{camp.name}</p>
                      <CheckCircle2 size={12} className="text-green-400" />
                    </div>
                    {camp.interest_category && (
                      <p className="text-xs text-green-400/70 font-medium">{camp.interest_category}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-5">
          <LeadFilters filters={filters} onChange={setFilters} />
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
            <p className="text-white/30 text-sm font-medium">No se encontraron leads con esos filtros.</p>
            <p className="text-white/15 text-xs mt-1">Prueba ajustando los filtros de búsqueda</p>
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
        leadPrice={
          selectedLead?.acquisition_cost > 0
            ? Math.max(Math.round(selectedLead.acquisition_cost * 3), 12)
            : clientData?.lead_price
        }
        onSuccess={handleUnlockSuccess}
      />
    </DashboardLayout>
  )
}
