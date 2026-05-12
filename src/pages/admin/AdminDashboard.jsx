import { useState, useEffect } from 'react'
import { Users, TrendingUp, DollarSign, Plus, Edit2, Zap, ToggleLeft, ToggleRight, Copy, Check, Trash2, Link, Lock, Unlock } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const INITIAL_CATEGORIES = [
  { id: 'final-expense',      name: 'Gastos finales',        icon: '🕊️', description: 'Seguros de gastos funerarios y vida',   is_active: true  },
  { id: 'financial-products', name: 'Productos financieros', icon: '💰', description: 'UIL · Anualidades · Whole Life · Seguro de vida', is_active: true  },
  { id: 'life-insurance',     name: 'Seguros de vida',       icon: '🛡️', description: 'Pólizas de seguro de vida',             is_active: false },
  { id: 'medicare',           name: 'Medicare / Medicaid',   icon: '🏥', description: 'Planes Medicare y Medicaid',            is_active: false },
  { id: 'auto-insurance',     name: 'Seguros de auto',       icon: '🚗', description: 'Seguros vehiculares',                  is_active: false },
  { id: 'real-estate',        name: 'Bienes raíces',         icon: '🏠', description: 'Compra, venta y renta de propiedades', is_active: false },
]

const EMPTY_LEAD_FORM = {
  full_name: '', phone: '', email: '', city: '', state: '',
  product_interest: '', source: '', campaign_name: '', client_id: '', acquisition_cost: '',
}

const PROD_BASE_URL = 'https://unlocklead.click'

function CopyWebhook({ clientId }) {
  const [copied, setCopied] = useState(false)
  const url = `${PROD_BASE_URL}/api/webhook?client=${clientId}`
  function copy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">URL del webhook</p>
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
        <code className="flex-1 text-xs text-green-400 break-all">{url}</code>
        <button onClick={copy} className="flex-shrink-0 text-slate-500 hover:text-green-400 transition-colors p-1">
          {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-1.5">Pega esta URL en Meta Ads o n8n para este cliente.</p>
    </div>
  )
}

function ClientRow({ client }) {
  const [expanded, setExpanded] = useState(false)
  const statusColor = { active: 'green', pending: 'yellow', paused: 'slate' }[client.status] || 'slate'
  const statusLabel = { active: 'Activo', pending: 'Pendiente', paused: 'Pausado' }[client.status] || client.status
  const unlockRate = client.leads_total > 0 ? Math.round((client.leads_unlocked / client.leads_total) * 100) : 0

  return (
    <div>
      <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setExpanded(e => !e)}>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-sm">{client.company_name}</p>
          <p className="text-xs text-slate-500">{client.email}{client.city ? ` · ${client.city}` : ''}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {(client.categories || []).map(cat => (
            <span key={cat} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{cat}</span>
          ))}
          {(!client.categories || client.categories.length === 0) && <span className="text-xs text-slate-400">Sin categoría</span>}
        </div>
        <div className="text-center hidden md:block">
          <p className="text-xs text-slate-400">Leads</p>
          <p className="font-semibold text-slate-900 text-sm">{client.leads_total}</p>
        </div>
        <div className="text-center hidden md:block">
          <p className="text-xs text-slate-400">Desbloqueados</p>
          <Badge color="green">{client.leads_unlocked}</Badge>
        </div>
        <div className="text-center hidden md:block">
          <p className="text-xs text-slate-400">Conversión</p>
          <p className="font-semibold text-slate-900 text-sm">{unlockRate}%</p>
        </div>
        <div className="text-center hidden md:block">
          <p className="text-xs text-slate-400">Ingresos</p>
          <p className="font-semibold text-green-600 text-sm">${client.revenue}</p>
        </div>
        <Badge color={statusColor}>{statusLabel}</Badge>
        <Edit2 size={14} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>

      {expanded && (
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-5 grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Información de contacto</p>
            {[
              ['Email', client.email],
              ['Teléfono', client.phone || '—'],
              ['Ciudad', client.city || '—'],
              ['Leads/mes solicitados', client.leads_per_month || '—'],
              ['Presupuesto campaña', client.budget || '—'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-900 text-right ml-4">{val}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Métricas</p>
            {[
              ['Total leads', client.leads_total],
              ['Desbloqueados', client.leads_unlocked],
              ['Bloqueados', client.leads_total - client.leads_unlocked],
              ['Tasa conversión', `${unlockRate}%`],
              ['Ingresos leads', `$${client.revenue}`],
              ['Costo adquisición', `$${client.total_cost.toFixed(2)}`],
              ['Utilidad neta', `$${(client.revenue - client.total_cost).toFixed(2)}`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-900">{val}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Campaña & Webhook</p>
            <div>
              <p className="text-xs text-slate-500 mb-1">Objetivo</p>
              <p className="text-sm text-slate-900">{client.goal || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Audiencia objetivo</p>
              <p className="text-sm text-slate-900 leading-relaxed">{client.target_audience || '—'}</p>
            </div>
            <div className="pt-3 border-t border-slate-200">
              <CopyWebhook clientId={client.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

const EMPTY_CAMPAIGN_FORM = { name: '', client_id: '', source: 'Meta Ads', meta_form_id: '' }

export default function AdminDashboard() {
  const { isMock } = useAuth()
  const [activeTab, setActiveTab] = useState('clients')
  const [clients, setClients] = useState([])
  const [leads, setLeads] = useState([])
  const [categories, setCategories] = useState(INITIAL_CATEGORIES)
  const [campaigns, setCampaigns] = useState([])
  const [campaignForm, setCampaignForm] = useState(EMPTY_CAMPAIGN_FORM)
  const [campaignLoading, setCampaignLoading] = useState(false)
  const [leadForm, setLeadForm] = useState(EMPTY_LEAD_FORM)
  const [leadModalOpen, setLeadModalOpen] = useState(false)
  const [loadingData, setLoadingData] = useState(!isMock)
  const [costEdits, setCostEdits] = useState({})

  useEffect(() => {
    if (isMock) return
    fetchData()
    fetchCampaigns()
  }, [isMock])

  async function fetchCampaigns() {
    const { data } = await supabase
      .from('campaigns')
      .select('id, name, source, is_active, created_at, client_id, meta_form_id, clients(company_name)')
      .order('created_at', { ascending: false })
    if (data) setCampaigns(data)
  }

  async function fetchData() {
    setLoadingData(true)
    try {
      const [{ data: clientsData }, { data: usersData }, { data: leadsData }, { data: unlocksData }] = await Promise.all([
        supabase.from('clients').select('id, company_name, lead_price, balance, created_at, user_id, phone, city, categories, budget, leads_per_month, target_audience, goal, status').order('created_at', { ascending: false }),
        supabase.from('users').select('id, email, full_name'),
        supabase.from('leads').select('id, full_name, email, phone, city, product_interest, is_locked, status, created_at, client_id, acquisition_cost').order('created_at', { ascending: false }).limit(200),
        supabase.from('lead_unlocks').select('id, client_id, amount_paid'),
      ])

      if (clientsData) {
        const mapped = clientsData.map(c => {
          const user = usersData?.find(u => u.id === c.user_id)
          const clientLeads = leadsData?.filter(l => l.client_id === c.id) || []
          const clientUnlocks = unlocksData?.filter(u => u.client_id === c.id) || []
          const revenue = clientUnlocks.reduce((s, u) => s + Number(u.amount_paid || 0), 0)
          const total_cost = clientLeads.reduce((s, l) => s + Number(l.acquisition_cost || 0), 0)
          return {
            id: c.id,
            company_name: c.company_name || user?.email || '(sin nombre)',
            email: user?.email || '',
            phone: c.phone || '',
            city: c.city || '',
            categories: c.categories || [],
            budget: c.budget || '',
            leads_per_month: c.leads_per_month || 0,
            target_audience: c.target_audience || '',
            goal: c.goal || '',
            status: c.status || 'pending',
            leads_total: clientLeads.length,
            leads_unlocked: clientUnlocks.length,
            revenue,
            total_cost,
            created_at: c.created_at,
          }
        })
        setClients(mapped)
      }

      if (leadsData) {
        const clientsMap = {}
        clientsData?.forEach(c => { clientsMap[c.id] = c.company_name || '—' })
        setLeads(leadsData.map(l => ({
          ...l,
          client_name: clientsMap[l.client_id] || '—',
          price: Math.max(12, Math.round((l.acquisition_cost || 0) * 3)),
        })))
      }
    } catch (e) {
      console.error('Error cargando datos admin:', e)
    }
    setLoadingData(false)
  }

  const totalRevenue = clients.reduce((sum, c) => sum + c.revenue, 0)
  const totalCost = clients.reduce((sum, c) => sum + c.total_cost, 0)
  const totalLeads = leads.length
  const totalUnlocked = leads.filter(l => !l.is_locked).length
  const unlockRate = totalLeads > 0 ? Math.round((totalUnlocked / totalLeads) * 100) : 0
  const activeCategories = categories.filter(c => c.is_active).length

  function handleLeadFormChange(e) {
    setLeadForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleCreateLead(e) {
    e.preventDefault()
    const client = clients.find(c => c.id === leadForm.client_id)
    const { data, error } = await supabase.from('leads').insert({
      full_name: leadForm.full_name,
      phone: leadForm.phone || null,
      email: leadForm.email || null,
      city: leadForm.city || null,
      state: leadForm.state || null,
      product_interest: leadForm.product_interest || null,
      source: leadForm.source || null,
      campaign_name: leadForm.campaign_name || null,
      client_id: leadForm.client_id || null,
      acquisition_cost: leadForm.acquisition_cost ? parseFloat(leadForm.acquisition_cost) : 0,
      is_locked: true,
      status: 'new',
    }).select().single()
    if (error) { alert('Error al crear lead: ' + error.message); return }
    setLeads(prev => [{
      ...data,
      client_name: client?.company_name || '—',
      price: Math.max(12, Math.round((data.acquisition_cost || 0) * 3)),
    }, ...prev])
    setLeadForm(EMPTY_LEAD_FORM)
    setLeadModalOpen(false)
  }

  async function toggleLock(leadId) {
    const lead = leads.find(l => l.id === leadId)
    const newLocked = !lead.is_locked
    await supabase.from('leads').update({ is_locked: newLocked }).eq('id', leadId)
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, is_locked: newLocked } : l))
  }

  async function saveCost(leadId, value) {
    const cost = parseFloat(value) || 0
    await supabase.from('leads').update({ acquisition_cost: cost }).eq('id', leadId)
    setLeads(prev => prev.map(l => l.id === leadId ? {
      ...l,
      acquisition_cost: cost,
      price: Math.max(12, Math.round(cost * 3)),
    } : l))
  }

  function toggleCategory(categoryId) {
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, is_active: !c.is_active } : c))
  }

  async function handleAddCampaign(e) {
    e.preventDefault()
    setCampaignLoading(true)
    const { error } = await supabase.from('campaigns').insert({
      name: campaignForm.name.trim(),
      client_id: campaignForm.client_id,
      source: campaignForm.source,
      meta_form_id: campaignForm.meta_form_id.trim() || null,
    })
    if (!error) { setCampaignForm(EMPTY_CAMPAIGN_FORM); await fetchCampaigns() }
    setCampaignLoading(false)
  }

  async function handleDeleteCampaign(id) {
    await supabase.from('campaigns').delete().eq('id', id)
    await fetchCampaigns()
  }

  async function handleToggleCampaign(id, current) {
    await supabase.from('campaigns').update({ is_active: !current }).eq('id', id)
    await fetchCampaigns()
  }

  const tabs = [
    { id: 'clients', label: 'Clientes' },
    { id: 'leads', label: `Leads (${totalLeads})` },
    { id: 'campaigns', label: 'Campañas' },
    { id: 'categories', label: 'Categorías' },
  ]

  if (loadingData) {
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
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Zap size={14} className="text-blue-500" />
              </div>
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Panel Admin</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Administración</h1>
          </div>
          <Button onClick={() => setLeadModalOpen(true)}>
            <Plus size={16} /> Crear lead
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Clientes" value={clients.length} sub={`${clients.filter(c => c.status === 'active').length} activos`} color="bg-blue-50 text-blue-600" />
          <StatCard icon={TrendingUp} label="Leads totales" value={totalLeads} sub={`${totalUnlocked} desbloqueados · ${unlockRate}% conversión`} color="bg-green-50 text-green-600" />
          <StatCard icon={DollarSign} label="Ingresos leads" value={`$${totalRevenue.toLocaleString()}`} sub={`Costo: $${totalCost.toFixed(0)}`} color="bg-emerald-50 text-emerald-600" />
          <StatCard icon={DollarSign} label="Utilidad neta" value={`$${(totalRevenue - totalCost).toFixed(0)}`} sub={totalRevenue > 0 ? `Margen ${Math.round(((totalRevenue - totalCost) / totalRevenue) * 100)}%` : '—'} color="bg-slate-100 text-slate-700" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="flex border-b border-slate-100">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                {tab.id === 'categories' && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">{activeCategories}</span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'clients' && (
            <div className="divide-y divide-slate-100">
              {clients.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-12">No hay clientes registrados aún.</p>
              )}
              {clients.map(client => <ClientRow key={client.id} client={client} />)}
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Nombre', 'Ciudad', 'Interés', 'Cliente', 'Costo $', 'Precio $', 'Estado', 'Bloqueo', ''].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 text-sm">{lead.full_name}</p>
                        <p className="text-xs text-slate-400">{lead.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-sm">{lead.city || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{lead.product_interest || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-sm">{lead.client_name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-xs">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={lead.acquisition_cost || 0}
                            onBlur={e => saveCost(lead.id, e.target.value)}
                            className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-500/20"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-green-600">${lead.price}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                      <td className="px-4 py-3">
                        <Badge color={lead.is_locked ? 'yellow' : 'green'}>
                          {lead.is_locked ? 'Bloqueado' : 'Desbloqueado'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleLock(lead.id)} className="text-slate-400 hover:text-blue-500 transition-colors p-1" title={lead.is_locked ? 'Desbloquear' : 'Bloquear'}>
                          {lead.is_locked ? <Unlock size={14} /> : <Lock size={14} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr><td colSpan={9} className="text-center text-slate-400 text-sm py-12">No hay leads aún.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900">Campañas registradas</h3>
                <p className="text-sm text-slate-500 mt-1">Registra el nombre exacto de cada campaña de Meta Ads. Los leads se enrutan automáticamente al cliente correcto.</p>
              </div>

              <form onSubmit={handleAddCampaign} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6">
                <p className="text-sm font-semibold text-slate-700 mb-4">Registrar nueva campaña</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Nombre de campaña (exacto)</label>
                    <input
                      required
                      value={campaignForm.name}
                      onChange={e => setCampaignForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Camp_GastosFinal_Q1"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Cliente</label>
                    <select
                      required
                      value={campaignForm.client_id}
                      onChange={e => setCampaignForm(p => ({ ...p, client_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
                    >
                      <option value="">Seleccionar cliente</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.company_name && c.company_name !== '(sin nombre)' ? `${c.company_name}` : c.email}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Fuente</label>
                    <select
                      value={campaignForm.source}
                      onChange={e => setCampaignForm(p => ({ ...p, source: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
                    >
                      {['Meta Ads', 'Zapier', 'n8n', 'Make', 'GoHighLevel', 'Manual'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Meta Form ID <span className="text-slate-400">(solo Meta Ads)</span></label>
                    <input
                      value={campaignForm.meta_form_id}
                      onChange={e => setCampaignForm(p => ({ ...p, meta_form_id: e.target.value }))}
                      placeholder="1234567890123456"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
                    />
                  </div>
                </div>
                <button type="submit" disabled={campaignLoading} className="mt-3 px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {campaignLoading ? 'Guardando...' : '+ Registrar campaña'}
                </button>
              </form>

              {campaigns.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Link size={28} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No hay campañas registradas aún.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {campaigns.map(camp => (
                    <div key={camp.id} className={`flex items-center gap-4 p-4 rounded-xl border ${camp.is_active ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">{camp.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{camp.clients?.company_name || '—'} · {camp.source}{camp.meta_form_id ? ` · Form: ${camp.meta_form_id}` : ''}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${camp.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                        {camp.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                      <button onClick={() => handleToggleCampaign(camp.id, camp.is_active)} className="text-slate-400 hover:text-blue-500 transition-colors p-1">
                        {camp.is_active ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                      </button>
                      <button onClick={() => handleDeleteCampaign(camp.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                <strong>Cómo funciona:</strong> Cuando llega un lead por webhook, el sistema busca el nombre de campaña y lo asigna al cliente correcto automáticamente.
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-slate-900">Nichos de leads disponibles</h3>
                  <p className="text-sm text-slate-500 mt-1">Las categorías activas aparecen en el onboarding. Activa un nicho cuando tengas capacidad de correr esa campaña.</p>
                </div>
              </div>
              <div className="space-y-3">
                {categories.map(cat => (
                  <div key={cat.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${cat.is_active ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 text-sm">{cat.name}</p>
                        {cat.is_active
                          ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Activa</span>
                          : <span className="text-xs bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-semibold">Inactiva</span>
                        }
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                    </div>
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${cat.is_active ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                    >
                      {cat.is_active ? <><ToggleRight size={16} /> Activa</> : <><ToggleLeft size={16} /> Inactiva</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal open={leadModalOpen} onClose={() => setLeadModalOpen(false)} title="Crear lead manualmente" size="lg">
        <form onSubmit={handleCreateLead} className="grid grid-cols-2 gap-4">
          {[
            { name: 'full_name', label: 'Nombre completo', required: true },
            { name: 'phone', label: 'Teléfono' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'city', label: 'Ciudad' },
            { name: 'state', label: 'Estado/Provincia' },
            { name: 'product_interest', label: 'Interés de producto' },
            { name: 'campaign_name', label: 'Campaña' },
            { name: 'source', label: 'Fuente' },
          ].map(({ name, label, type = 'text', required }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <input
                type={type}
                name={name}
                required={required}
                value={leadForm[name]}
                onChange={handleLeadFormChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Costo de adquisición ($)</label>
            <input
              type="number"
              name="acquisition_cost"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={leadForm.acquisition_cost}
              onChange={handleLeadFormChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
            />
            {leadForm.acquisition_cost && (
              <p className="text-xs text-green-600 mt-1">
                Precio al cliente: ${Math.max(12, Math.round(parseFloat(leadForm.acquisition_cost) * 3))}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Asignar a cliente</label>
            <select
              name="client_id"
              required
              value={leadForm.client_id}
              onChange={handleLeadFormChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
            >
              <option value="">Seleccionar cliente</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.company_name && c.company_name !== '(sin nombre)' ? `${c.company_name} — ${c.email}` : c.email || c.id}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2 flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setLeadModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Crear lead</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
