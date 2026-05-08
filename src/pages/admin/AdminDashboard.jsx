import { useState } from 'react'
import { Users, TrendingUp, DollarSign, Plus, Eye, Edit2, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Badge, StatusBadge } from '../../components/ui/Badge'

const MOCK_CLIENTS = [
  { id: 'c1', company_name: 'Hipoteca Fácil MX', email: 'admin@hipotecafacil.com', leads_total: 24, leads_unlocked: 8, revenue: 160, created_at: '2024-01-15' },
  { id: 'c2', company_name: 'Seguros García', email: 'ventas@segurosg.com', leads_total: 15, leads_unlocked: 5, revenue: 100, created_at: '2024-02-01' },
  { id: 'c3', company_name: 'PyME Capital', email: 'info@pymecapital.mx', leads_total: 31, leads_unlocked: 12, revenue: 240, created_at: '2024-02-20' },
]

const MOCK_LEADS = [
  { id: '1', full_name: 'Carlos Mendoza', email: 'carlos@ejemplo.com', city: 'CDMX', product_interest: 'Crédito hipotecario', is_locked: false, status: 'interested', created_at: new Date(Date.now() - 1 * 86400000).toISOString(), client_name: 'Hipoteca Fácil MX' },
  { id: '2', full_name: 'María López García', email: 'maria.lg@ejemplo.com', city: 'Guadalajara', product_interest: 'Seguro de auto', is_locked: true, status: 'new', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), client_name: 'Seguros García' },
  { id: '3', full_name: 'Roberto Sánchez', email: 'roberto.s@ejemplo.com', city: 'Monterrey', product_interest: 'Consultoría fiscal', is_locked: true, status: 'new', created_at: new Date(Date.now() - 3 * 86400000).toISOString(), client_name: 'PyME Capital' },
  { id: '4', full_name: 'Ana Flores Ramos', email: 'ana.fr@ejemplo.com', city: 'CDMX', product_interest: 'Crédito PyME', is_locked: false, status: 'contacted', created_at: new Date(Date.now() - 4 * 86400000).toISOString(), client_name: 'PyME Capital' },
  { id: '5', full_name: 'Luis Torres Vega', email: 'luis.tv@ejemplo.com', city: 'Tijuana', product_interest: 'Importación', is_locked: true, status: 'new', created_at: new Date(Date.now() - 5 * 86400000).toISOString(), client_name: 'PyME Capital' },
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
  const [activeTab, setActiveTab] = useState('clients')
  const [clients, setClients] = useState(MOCK_CLIENTS)
  const [leads, setLeads] = useState(MOCK_LEADS)
  const [leadForm, setLeadForm] = useState(EMPTY_LEAD_FORM)
  const [leadModalOpen, setLeadModalOpen] = useState(false)

  const totalRevenue = clients.reduce((sum, c) => sum + c.revenue, 0)
  const totalLeads = leads.length
  const unlockedLeads = leads.filter((l) => !l.is_locked).length

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

  const tabs = [
    { id: 'clients', label: 'Clientes' },
    { id: 'leads', label: 'Leads' },
  ]

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
              </button>
            ))}
          </div>

          {activeTab === 'clients' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Empresa', 'Email', 'Leads', 'Desbloqueados', 'Ingresos', 'Acción'].map((h) => (
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
                    {['Nombre', 'Email', 'Ciudad', 'Interés', 'Cliente', 'Estado', 'Bloqueo', 'Acción'].map((h) => (
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
                      <td className="px-5 py-4 text-slate-500 text-sm">{lead.product_interest}</td>
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
                          title="Cambiar estado de bloqueo"
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
