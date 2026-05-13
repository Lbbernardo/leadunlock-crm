import { useState, useEffect } from 'react'
import { Users, Unlock, DollarSign, TrendingUp, AlertTriangle, CreditCard, Rocket, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import LeadCard from '../../components/leads/LeadCard'
import LeadFilters from '../../components/leads/LeadFilters'
import PaymentModal from '../../components/billing/PaymentModal'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

// Mock data for development (remove when Supabase is live)
const MOCK_LEADS = [
  { id: '1', full_name: 'Carlos Mendoza', phone: '+52 55 1234 5678', email: 'carlos@ejemplo.com', city: 'CDMX', state: 'Ciudad de México', product_interest: 'Crédito hipotecario', source: 'Meta Ads', campaign_name: 'Camp_Hipoteca_Q1', is_locked: false, is_unlocked: true, status: 'interested', notes: 'Muy interesado, llamar en la tarde.', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: '2', full_name: 'María López García', phone: '+52 33 9876 5432', email: 'maria.lg@ejemplo.com', city: 'Guadalajara', state: 'Jalisco', product_interest: 'Seguro de auto', source: 'Meta Ads', campaign_name: 'Camp_Seguros_Jalisco', is_locked: true, is_unlocked: false, status: 'new', notes: null, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: '3', full_name: 'Roberto Sánchez', phone: '+52 81 5555 6666', email: 'roberto.s@ejemplo.com', city: 'Monterrey', state: 'Nuevo León', product_interest: 'Consultoría fiscal', source: 'Zapier', campaign_name: 'Retargeting_NL', is_locked: true, is_unlocked: false, status: 'new', notes: null, created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: '4', full_name: 'Ana Flores Ramos', phone: '+52 55 2222 3333', email: 'ana.fr@ejemplo.com', city: 'CDMX', state: 'Ciudad de México', product_interest: 'Crédito PyME', source: 'Meta Ads', campaign_name: 'Camp_PyME_CDMX', is_locked: false, is_unlocked: true, status: 'contacted', notes: 'Agendé demo para el viernes.', created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: '5', full_name: 'Luis Torres Vega', phone: '+52 664 111 2222', email: 'luis.tv@ejemplo.com', city: 'Tijuana', state: 'Baja California', product_interest: 'Importación/Exportación', source: 'n8n', campaign_name: 'Camp_Comercio_BC', is_locked: true, is_unlocked: false, status: 'new', notes: null, created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: '6', full_name: 'Patricia Herrera', phone: '+52 222 444 5555', email: 'pati.h@ejemplo.com', city: 'Puebla', state: 'Puebla', product_interest: 'Crédito hipotecario', source: 'Meta Ads', campaign_name: 'Camp_Hipoteca_Q1', is_locked: true, is_unlocked: false, status: 'new', notes: null, created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: '7', full_name: 'Jorge Ramírez Díaz', phone: '+52 55 7777 8888', email: 'jorge.rd@ejemplo.com', city: 'Toluca', state: 'Estado de México', product_interest: 'Seguro de vida', source: 'Meta Ads', campaign_name: 'Camp_Seguros_EDOMEX', is_locked: false, is_unlocked: true, status: 'closed', notes: 'Cerrado. Cliente firmó contrato.', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: '8', full_name: 'Sofía Castillo Luna', phone: '+52 33 3333 4444', email: 'sofia.cl@ejemplo.com', city: 'Guadalajara', state: 'Jalisco', product_interest: 'Consultoría fiscal', source: 'GoHighLevel', campaign_name: 'Camp_Fiscal_GDL', is_locked: true, is_unlocked: false, status: 'new', notes: null, created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
]

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

function PaymentMethodBanner({ clientData }) {
  if (!clientData) return null
  if (clientData.status === 'payment_required') {
    return (
      <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
        <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-700 font-semibold text-sm">Tu tarjeta fue rechazada</p>
          <p className="text-red-600 text-xs mt-0.5">No podrás desbloquear leads hasta que actualices tu método de pago.</p>
        </div>
        <Link to="/dashboard/profile" className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 border border-red-300 px-3 py-1.5 rounded-xl transition-colors flex-shrink-0">
          <CreditCard size={13} /> Actualizar
        </Link>
      </div>
    )
  }
  if (!clientData.payment_method_last4) {
    return (
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
        <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-amber-800 font-semibold text-sm">Sin método de pago activo</p>
          <p className="text-amber-700 text-xs mt-0.5">Agrega una tarjeta para poder desbloquear tus leads.</p>
        </div>
        <Link to="/dashboard/profile" className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-xl transition-colors flex-shrink-0">
          <CreditCard size={13} /> Agregar tarjeta
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
    console.log('[Dashboard] clientId:', clientId)
    Promise.all([
      supabase.rpc('get_client_leads', { p_client_id: clientId }),
      supabase.from('campaigns').select('id, name, source, is_active, interest_category').eq('client_id', clientId).eq('is_active', true),
    ]).then(([leadsRes, campRes]) => {
      console.log('[Dashboard] leads:', leadsRes.data?.length, 'error:', leadsRes.error?.message, leadsRes.error?.code)
      console.log('[Dashboard] campaigns:', campRes.data?.length, 'error:', campRes.error?.message)
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
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard de Leads</h1>
          <p className="text-slate-500 mt-1">Gestiona y desbloquea tus leads de campañas</p>
        </div>

        <PaymentMethodBanner clientData={clientData} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Total leads" value={totalLeads} color="bg-blue-50 text-blue-600" />
          <StatCard icon={Unlock} label="Desbloqueados" value={unlockedLeads} color="bg-green-50 text-green-600" />
          <StatCard icon={TrendingUp} label="Bloqueados" value={lockedLeads} color="bg-orange-50 text-orange-600" />
          <StatCard icon={DollarSign} label="Total gastado" value={`$${totalSpent}`} color="bg-slate-100 text-slate-600" />
        </div>

        {campaigns.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Campañas activas</p>
            <div className="flex flex-wrap gap-3">
              {campaigns.map(camp => (
                <div key={camp.id} className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl px-4 py-3">
                  <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Rocket size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-slate-900">{camp.name}</p>
                      <CheckCircle2 size={13} className="text-green-500" />
                    </div>
                    {camp.interest_category && (
                      <p className="text-xs text-green-700 font-medium">{camp.interest_category}</p>
                    )}
                    <p className="text-xs text-slate-400">{camp.source}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <LeadFilters filters={filters} onChange={setFilters} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500">No se encontraron leads con esos filtros.</p>
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
        onSuccess={handleUnlockSuccess}
      />
    </DashboardLayout>
  )
}
