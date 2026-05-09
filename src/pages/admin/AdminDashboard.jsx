import { useState, useEffect } from 'react'
import { Users, TrendingUp, DollarSign, Plus, Eye, Edit2, Zap, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const MOCK_CLIENTS = [
  { id: 'c1', company_name: 'García Insurance', email: 'garcia@insurance.com', leads_total: 24, leads_unlocked: 8, revenue: 160, created_at: '2024-01-15', categories: ['Gastos finales', 'Productos financieros'] },
  { id: 'c2', company_name: 'López Benefits', email: 'lopez@benefits.com', leads_total: 15, leads_unlocked: 5, revenue: 100, created_at: '2024-02-01', categories: ['Gastos finales'] },
  { id: 'c3', company_name: 'Miami Financial', email: 'info@miamifinancial.com', leads_total: 31, leads_unlocked: 12, revenue: 240, created_at: '2024-02-20', categories: ['Productos financieros'] },
]

const MOCK_LEADS = [
  { id: '1', full_name: 'Carlos Mendoza', email: 'carlos@ejemplo.com', city: 'Miami', product_interest: 'Final expense', is_locked: false, status: 'interested', created_at: new Date(Date.now() - 1 * 86400000).toISOString(), client_name: 'García Insurance', category: 'Gastos finales' },
  { id: '2', full_name: 'María López García', email: 'maria.lg@ejemplo.com', city: 'Orlando', product_interest: 'Préstamo personal', is_locked: true, status: 'new', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), client_name: 'Miami Financial', category: 'Productos financieros' },
  { id: '3', full_name: 'Roberto Sánchez', email: 'roberto.s@ejemplo.com', city: 'Tampa', product_interest: 'Final expense', is_locked: true, status: 'new', created_at: new Date(Date.now() - 3 * 86400000).toISOString(), client_name: 'López Benefits', category: 'Gastos finales' },
  { id: '4', full_name: 'Ana Flores Ramos', email: 'ana.fr@ejemplo.com', city: 'Miami', product_interest: 'Crédito PyME', is_locked: false, status: 'contacted', created_at: new Date(Date.now() - 4 * 86400000).toISOString(), client_name: 'Miami Financial', category: 'Productos financieros' },
  { id: '5', full_name: 'Luis Torres Vega', email: 'luis.tv@ejemplo.com', city: 'Hialeah', product_interest: 'Final expense', is_locked: true, status: 'new', created_at: new Date(Date.now() - 5 * 86400000).toISOString(), client_name: 'García Insurance', category: 'Gastos finales' },
]

const INITIAL_CATEGORIES = [
  { id: 'final-expense',      name: 'Gastos finales',        icon: '🕊️', description: 'Seguros de gastos funerarios y vida',   is_active: true,  clients: 2 },
  { id: 'financial-products', name: 'Productos financieros', icon: '💰', description: 'UIL · Anualidades · Whole Life · Seguro de vida', is_active: true,  clients: 2 },
  { id: 'life-insurance',     name: 'Seguros de vida',       icon: '🛡️', description: 'Pólizas de seguro de vida',             is_active: false, clients: 0 },
  { id: 'medicare',           name: 'Medicare / Medicaid',   icon: '🏥', description: 'Planes Medicare y Medicaid',            is_active: false, clients: 0 },
  { id: 'auto-insurance',     name: 'Seguros de auto',       icon: '🚗', description: 'Seguros vehiculares',                  is_active: false, clients: 0 },
  { id: 'real-estate',        name: 'Bienes raíces',         icon: '🏠', description: 'Compra, venta y renta de propiedades', is_active: false, clients: 0 },
]

const EMPTY_LEAD_FORM = {
  full_name: '', phone: '', email: '', city: '', state: '',
  product_interest: '', source: '', campaign_name: '', client_id: '',
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const { isMock } = useAuth()
  const [activeTab, setActiveTab] = useState('clients')
  const [clients, setClients] = useState(MOCK_CLIENTS)
  const [leads, setLeads] = useState(MOCK_LEADS)
  const [categories, setCategories] = useState(INITIAL_CATEGORIES)
  const [leadForm, setLeadForm] = useState(EMPTY_LEAD_FORM)
  const [leadModalOpen, setLeadModalOpen] = useState(false)
  const [loadingData, setLoadingData] = useState(!isMock)

  useEffect(() => {
    if (isMock) return
    fetchData()
  }, [isMock])

  async function fetchData() {
    setLoadingData(true)
    const [{ data: clientsData }, { data: leadsData }] = await Promise.all([
      supabase
        .from('clients')
        .select('id, company_name, lead_price, balance, created_at, users(email, full_name)')
        .order('created_at', { ascending: false }),
      supabase
        .from('leads')
        .select('id, full_name, email, city, product_interest, is_locked, status, created_at, client_id, clients(company_name)')
        .order('created_at', { ascending: false })
        .limit(100),
    ])

    if (clientsData) {
      const mapped = clientsData.map(c => {
        const clientLeads = leadsData?.filter(l => l.client_id === c.id) || []
        const unlocked = clientLeads.filter(l => !l.is_locked).length
        return {
          id: c.id,
          company_name: c.company_name || '(sin nombre)',
          email: c.users?.email || '',
          leads_total: clientLeads.length,
          leads_unlocked: unlocked,
          revenue: unlocked * (c.lead_price || 20),
          created_at: c.created_at,
          categories: [],
        }
      })
      setClients(mapped)
    }

    if (leadsData) {
      setLeads(leadsData.map(l => ({
        ...l,
        client_name: l.clients?.company_name || '—',
        category: l.product_interest || '—',
      })))
    }

    setLoadingData(false)
  }

  const totalRevenue = clients.reduce((sum, c) => sum + c.revenue, 0)
  const totalLeads = leads.length
  const activeCategories = categories.filter(c => c.is_active).length

  function handleLeadFormChange(e) {
    setLeadForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleCreateLead(e) {
    e.preventDefault()
    const client = clients.find((c) => c.id === leadForm.client_id)
    const newLead = {
      ...leadForm,
      id: Date.now().toString(),
      is_locked: true,
      status: 'new',
      created_at: new Date().toISOString(),
      client_name: client?.company_name || '—',
      category: '—',
    }
    setLeads((prev) => [newLead, ...prev])
    setLeadForm(EMPTY_LEAD_FORM)
    setLeadModalOpen(false)
  }

  function toggleLock(leadId) {
    setLeads((prev) =>
      prev.map((l) => l.id === leadId ? { ...l, is_locked: !l.is_locked } : l),
    )
  }

  function toggleCategory(categoryId) {
    setCategories(prev =>
      prev.map(c => c.id === categoryId ? { ...c, is_active: !c.is_active } : c)
    )
  }

  const tabs = [
    { id: 'clients', label: 'Clientes' },
    { id: 'leads', label: 'Leads' },
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

        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard icon={Users} label="Clientes activos" value={clients.length} color="bg-blue-50 text-blue-600" />
          <StatCard icon={TrendingUp} label="Leads totales" value={totalLeads} color="bg-green-50 text-green-600" />
          <StatCard icon={DollarSign} label="Ingresos totales" value={`$${totalRevenue}`} color="bg-slate-100 text-slate-700" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="flex border-b border-slate-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                {tab.id === 'categories' && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
                    {activeCategories} activas
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'clients' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Empresa', 'Email', 'Categorías', 'Leads', 'Desbloqueados', 'Ingresos', ''].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 text-sm">{client.company_name}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{client.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {client.categories.map(cat => (
                            <span key={cat} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 text-sm">{client.leads_total}</td>
                      <td className="px-6 py-4">
                        <Badge color="green">{client.leads_unlocked}</Badge>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 text-sm">${client.revenue}</td>
                      <td className="px-6 py-4">
                        <button className="text-slate-400 hover:text-blue-500 transition-colors p-1">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Nombre', 'Email', 'Ciudad', 'Categoría', 'Cliente', 'Estado', 'Bloqueo', ''].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-900 text-sm">{lead.full_name}</td>
                      <td className="px-5 py-4 text-slate-500 text-sm">{lead.email}</td>
                      <td className="px-5 py-4 text-slate-500 text-sm">{lead.city}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          {lead.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-sm">{lead.client_name}</td>
                      <td className="px-5 py-4"><StatusBadge status={lead.status} /></td>
                      <td className="px-5 py-4">
                        <Badge color={lead.is_locked ? 'yellow' : 'green'}>
                          {lead.is_locked ? 'Bloqueado' : 'Desbloqueado'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleLock(lead.id)}
                          className="text-slate-400 hover:text-blue-500 transition-colors p-1"
                        >
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-slate-900">Nichos de leads disponibles</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Las categorías activas aparecen en el onboarding para que los clientes las elijan.
                    Activa un nuevo nicho cuando tengas capacidad de correr esa campaña.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      cat.is_active
                        ? 'border-green-200 bg-green-50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
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
                      {cat.clients > 0 && (
                        <p className="text-xs text-blue-600 mt-0.5">{cat.clients} cliente{cat.clients !== 1 ? 's' : ''} con este nicho</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        cat.is_active
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {cat.is_active
                        ? <><ToggleRight size={16} /> Activa</>
                        : <><ToggleLeft size={16} /> Inactiva</>
                      }
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                <strong>Nota:</strong> Al activar un nuevo nicho, aparecerá en el selector del onboarding para nuevos clientes.
                Los clientes existentes no se ven afectados.
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
            { name: 'email', label: 'Email', type: 'email', required: true },
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

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Asignar a cliente</label>
            <select
              name="client_id"
              required
              value={leadForm.client_id}
              onChange={handleLeadFormChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2 flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setLeadModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Crear lead
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
