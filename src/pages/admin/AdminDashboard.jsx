import { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Users, TrendingUp, DollarSign, Edit2, Zap, ToggleLeft, ToggleRight, Copy, Check, Trash2, Link, ChevronDown, Lock, Unlock, RefreshCw, Activity, ArrowUpRight } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import DashboardLayout from '../../components/layout/DashboardLayout'
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

function ClientRow({ client, onRefresh, initialExpanded = false }) {
  const rowRef = useRef(null)
  const [expanded, setExpanded] = useState(initialExpanded)
  const [clientLeads, setClientLeads] = useState([])
  const [loadingLeads, setLoadingLeads] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [creditAmount, setCreditAmount] = useState('')
  const [creditLoading, setCreditLoading] = useState(false)
  const [creditMsg, setCreditMsg] = useState(null)
  const [currentBalance, setCurrentBalance] = useState(client.balance)

  useEffect(() => {
    if (initialExpanded) {
      fetchLeads()
      setEditForm({
        company_name: client.company_name !== '(sin nombre)' ? client.company_name : '',
        phone: client.phone || '',
        city: client.city || '',
        status: client.status || 'pending',
        leads_per_month: client.leads_per_month || '',
        budget: client.budget || '',
        goal: client.goal || '',
        target_audience: client.target_audience || '',
      })
      setTimeout(() => rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300)
    }
  }, [initialExpanded])

  const statusColor = { active: 'green', pending: 'yellow', paused: 'slate' }[client.status] || 'slate'
  const statusLabel = { active: 'Activo', pending: 'Pendiente', paused: 'Pausado' }[client.status] || client.status
  const unlockRate = client.leads_total > 0 ? Math.round((client.leads_unlocked / client.leads_total) * 100) : 0

  async function fetchLeads() {
    setLoadingLeads(true)
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
    if (data) setClientLeads(data)
    setLoadingLeads(false)
  }

  function handleExpand() {
    if (!expanded) {
      fetchLeads()
      setEditForm({
        company_name: client.company_name !== '(sin nombre)' ? client.company_name : '',
        phone: client.phone || '',
        city: client.city || '',
        status: client.status || 'pending',
        leads_per_month: client.leads_per_month || '',
        budget: client.budget || '',
        goal: client.goal || '',
        target_audience: client.target_audience || '',
      })
    }
    setExpanded(e => !e)
  }

  async function handleSave() {
    setSaving(true)
    await supabase.from('clients').update({
      company_name: editForm.company_name || null,
      phone: editForm.phone || null,
      city: editForm.city || null,
      status: editForm.status,
      leads_per_month: editForm.leads_per_month ? parseInt(editForm.leads_per_month) : null,
      budget: editForm.budget || null,
      goal: editForm.goal || null,
      target_audience: editForm.target_audience || null,
    }).eq('id', client.id)
    setSaving(false)
    setEditMode(false)
    onRefresh()
  }

  async function handleDeleteLead(leadId) {
    if (!confirm('¿Eliminar este lead permanentemente?')) return
    await supabase.from('leads').delete().eq('id', leadId)
    setClientLeads(prev => prev.filter(l => l.id !== leadId))
  }

  async function handleToggleLock(leadId, currentLocked) {
    await supabase.from('leads').update({ is_locked: !currentLocked }).eq('id', leadId)
    setClientLeads(prev => prev.map(l => l.id === leadId ? { ...l, is_locked: !currentLocked } : l))
  }

  async function handleAddCredit(e) {
    e.stopPropagation()
    const amount = parseFloat(creditAmount)
    if (!amount || amount <= 0) return
    setCreditLoading(true)
    setCreditMsg(null)
    try {
      const res = await fetch('/api/admin/add-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id, amount }),
      })
      const data = await res.json()
      if (data.success) {
        setCurrentBalance(data.new_balance)
        setCreditAmount('')
        setCreditMsg({ type: 'ok', text: `+$${amount} agregado. Nuevo saldo: $${data.new_balance}` })
      } else {
        setCreditMsg({ type: 'err', text: data.error || 'Error al agregar crédito' })
      }
    } catch {
      setCreditMsg({ type: 'err', text: 'Error de conexión' })
    }
    setCreditLoading(false)
    setTimeout(() => setCreditMsg(null), 4000)
  }

  return (
    <div ref={rowRef}>
      <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors" onClick={handleExpand}>
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
        <ChevronDown size={14} className={`text-slate-400 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </div>

      {expanded && (
        <div className="bg-slate-50 border-t border-slate-200">
          {/* Info + Métricas + Webhook */}
          <div className="px-6 py-5 grid md:grid-cols-3 gap-6 border-b border-slate-200">
            {/* Col 1: Info editable */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Cuenta</p>
                {!editMode
                  ? <button onClick={e => { e.stopPropagation(); setEditMode(true) }} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium">
                      <Edit2 size={10} /> Editar
                    </button>
                  : <div className="flex gap-3">
                      <button onClick={() => setEditMode(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancelar</button>
                      <button onClick={handleSave} disabled={saving} className="text-xs text-green-600 hover:text-green-700 font-semibold">
                        {saving ? 'Guardando…' : 'Guardar'}
                      </button>
                    </div>
                }
              </div>
              {editMode ? (
                <div className="space-y-2">
                  {[
                    { label: 'Empresa', key: 'company_name' },
                    { label: 'Teléfono', key: 'phone' },
                    { label: 'Ciudad', key: 'city' },
                    { label: 'Leads/mes', key: 'leads_per_month', type: 'number' },
                    { label: 'Presupuesto', key: 'budget' },
                  ].map(({ label, key, type = 'text' }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-20 flex-shrink-0">{label}</span>
                      <input
                        type={type}
                        value={editForm[key] || ''}
                        onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))}
                        onClick={e => e.stopPropagation()}
                        className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-green-400 bg-white"
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-20 flex-shrink-0">Estado</span>
                    <select
                      value={editForm.status}
                      onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-green-400 bg-white"
                    >
                      <option value="active">Activo</option>
                      <option value="pending">Pendiente</option>
                      <option value="paused">Pausado</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {[
                    ['Email', client.email],
                    ['Teléfono', client.phone || '—'],
                    ['Ciudad', client.city || '—'],
                    ['Leads/mes', client.leads_per_month || '—'],
                    ['Presupuesto', client.budget || '—'],
                    ['Estado', statusLabel],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-xs text-slate-400">{label}</span>
                      <span className="text-xs font-medium text-slate-900 text-right ml-4 max-w-[60%] truncate">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Col 2: Métricas financieras */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Métricas</p>
              <div className="space-y-1.5">
                {[
                  ['Total leads', client.leads_total],
                  ['Desbloqueados', client.leads_unlocked],
                  ['Bloqueados', client.leads_total - client.leads_unlocked],
                  ['Conversión', `${unlockRate}%`],
                  ['Ingresos leads', `$${client.revenue}`],
                  ['Costo adquisición', `$${client.total_cost.toFixed(2)}`],
                  ['Utilidad neta', `$${(client.revenue - client.total_cost).toFixed(2)}`],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-xs text-slate-400">{label}</span>
                    <span className="text-xs font-medium text-slate-900">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 3: Campaña + Webhook */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Campaña & Webhook</p>
              {editMode ? (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Objetivo</label>
                    <textarea
                      rows={2}
                      value={editForm.goal || ''}
                      onChange={e => setEditForm(p => ({ ...p, goal: e.target.value }))}
                      onClick={e => e.stopPropagation()}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg resize-none focus:outline-none focus:border-green-400 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Audiencia objetivo</label>
                    <textarea
                      rows={3}
                      value={editForm.target_audience || ''}
                      onChange={e => setEditForm(p => ({ ...p, target_audience: e.target.value }))}
                      onClick={e => e.stopPropagation()}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg resize-none focus:outline-none focus:border-green-400 bg-white"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-2">
                    <p className="text-xs text-slate-400 mb-0.5">Objetivo</p>
                    <p className="text-xs text-slate-900">{client.goal || '—'}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-slate-400 mb-0.5">Audiencia objetivo</p>
                    <p className="text-xs text-slate-900 leading-relaxed">{client.target_audience || '—'}</p>
                  </div>
                </>
              )}
              <div className="pt-3 border-t border-slate-200">
                <CopyWebhook clientId={client.id} />
              </div>
            </div>
          </div>

          {/* Gestión de crédito */}
          <div className="px-6 py-5 border-t border-slate-200 bg-slate-50/50">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Estado del crédito */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Crédito de cuenta</p>
                <div className="flex items-end gap-4 mb-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Saldo disponible</p>
                    <p className={`text-2xl font-bold ${currentBalance > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      ${currentBalance.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Leads disponibles</p>
                    <p className="text-2xl font-bold text-slate-700">
                      {Math.floor(currentBalance / (client.lead_price || 20))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Precio por lead</p>
                    <p className="text-lg font-semibold text-slate-600">${client.lead_price || 20}</p>
                  </div>
                </div>
                {/* Progress toward $1,000 / 50 leads */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Consumido: ${client.revenue.toLocaleString()} de $1,000</span>
                    <span>{client.leads_unlocked} de 50 leads</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (client.revenue / 1000) * 100)}%` }}
                    />
                  </div>
                  {client.revenue >= 1000 || client.leads_unlocked >= 50 ? (
                    <p className="text-xs text-green-600 font-semibold mt-1">Meta alcanzada</p>
                  ) : null}
                </div>
              </div>

              {/* Agregar crédito */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Agregar crédito</p>
                <div className="flex gap-2 mb-2">
                  {[100, 200, 500, 1000].map(preset => (
                    <button
                      key={preset}
                      onClick={e => { e.stopPropagation(); setCreditAmount(String(preset)) }}
                      className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                        creditAmount === String(preset)
                          ? 'bg-green-500 text-white border-green-500'
                          : 'border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-600 bg-white'
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Otro monto..."
                    value={creditAmount}
                    onChange={e => setCreditAmount(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white"
                  />
                  <button
                    onClick={handleAddCredit}
                    disabled={creditLoading || !creditAmount}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    {creditLoading ? '…' : '+ Agregar'}
                  </button>
                </div>
                {creditMsg && (
                  <p className={`text-xs mt-2 font-medium ${creditMsg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
                    {creditMsg.text}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Historial de leads */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Historial de leads ({clientLeads.length})
              </p>
              <button
                onClick={e => { e.stopPropagation(); fetchLeads() }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                <RefreshCw size={11} /> Actualizar
              </button>
            </div>

            {loadingLeads ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500" />
              </div>
            ) : clientLeads.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">No hay leads para esta cuenta.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full bg-white text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Nombre', 'Teléfono', 'Email', 'Ciudad', 'Interés', 'Status', 'Bloqueo', 'Fecha', ''].map(h => (
                        <th key={h} className="text-left font-semibold text-slate-400 uppercase tracking-wide px-3 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2.5 font-medium text-slate-900">{lead.full_name}</td>
                        <td className="px-3 py-2.5 text-slate-500">{lead.phone || '—'}</td>
                        <td className="px-3 py-2.5 text-slate-500">{lead.email || '—'}</td>
                        <td className="px-3 py-2.5 text-slate-500">{lead.city || '—'}</td>
                        <td className="px-3 py-2.5">
                          {lead.product_interest
                            ? <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{lead.product_interest}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-3 py-2.5"><StatusBadge status={lead.status} /></td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={e => { e.stopPropagation(); handleToggleLock(lead.id, lead.is_locked) }}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-medium transition-colors ${lead.is_locked ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                          >
                            {lead.is_locked ? <><Lock size={10} /> Bloqueado</> : <><Unlock size={10} /> Libre</>}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-slate-400">
                          {new Date(lead.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteLead(lead.id) }}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                            title="Eliminar lead"
                          >
                            <Trash2 size={13} />
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
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('overview')
  const [highlightClientId, setHighlightClientId] = useState(null)
  const [clients, setClients] = useState([])
  const [leads, setLeads] = useState([])
  const [categories, setCategories] = useState(INITIAL_CATEGORIES)
  const [campaigns, setCampaigns] = useState([])
  const [campaignForm, setCampaignForm] = useState(EMPTY_CAMPAIGN_FORM)
  const [campaignLoading, setCampaignLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(!isMock)

  useEffect(() => {
    if (isMock) return
    fetchData()
    fetchCampaigns()
  }, [isMock])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const clientParam = params.get('client')
    if (clientParam) {
      setActiveTab('clients')
      setHighlightClientId(clientParam)
    }
  }, [location.search])

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
        supabase.from('leads').select('id, full_name, email, phone, city, product_interest, is_locked, status, created_at, client_id, acquisition_cost').order('created_at', { ascending: false }).limit(1000),
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
            balance: c.balance || 0,
            lead_price: c.lead_price || 20,
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

  // --- Chart data ---
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  const leadsThisMonth = leads.filter(l => {
    const d = new Date(l.created_at)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })

  const leadsPerDay = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      return d.toISOString().split('T')[0]
    })
    return days.map(date => ({
      fecha: date.slice(5),
      leads: leads.filter(l => l.created_at?.startsWith(date)).length,
    }))
  }, [leads])

  const leadsPerClient = useMemo(() =>
    [...clients]
      .sort((a, b) => b.leads_total - a.leads_total)
      .slice(0, 6)
      .map(c => ({
        nombre: c.company_name.split(' ')[0],
        leads: c.leads_total,
        desbloqueados: c.leads_unlocked,
      }))
  , [clients])

  const accountStatusData = useMemo(() => [
    { name: 'Activos',    value: clients.filter(c => c.status === 'active').length,  color: '#22c55e' },
    { name: 'Pendientes', value: clients.filter(c => c.status === 'pending').length, color: '#f59e0b' },
    { name: 'Pausados',   value: clients.filter(c => c.status === 'paused').length,  color: '#64748b' },
  ].filter(d => d.value > 0), [clients])

  const recentLeads = leads.slice(0, 8)

  const tabs = [
    { id: 'overview',    label: 'Resumen' },
    { id: 'clients',     label: 'Clientes' },
    { id: 'campaigns',   label: 'Campañas' },
    { id: 'categories',  label: 'Categorías' },
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

          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Cuentas activas',
                    value: clients.filter(c => c.status === 'active').length,
                    sub: `de ${clients.length} total`,
                    color: 'bg-blue-500',
                    icon: Users,
                  },
                  {
                    label: 'Leads este mes',
                    value: leadsThisMonth.length,
                    sub: `${leads.length} histórico`,
                    color: 'bg-green-500',
                    icon: TrendingUp,
                  },
                  {
                    label: 'Desbloqueados',
                    value: totalUnlocked,
                    sub: `${unlockRate}% conversión`,
                    color: 'bg-emerald-500',
                    icon: Unlock,
                  },
                  {
                    label: 'Ingresos totales',
                    value: `$${totalRevenue.toLocaleString()}`,
                    sub: `Utilidad $${(totalRevenue - totalCost).toFixed(0)}`,
                    color: 'bg-violet-500',
                    icon: DollarSign,
                  },
                ].map(({ label, value, sub, color, icon: Icon }) => (
                  <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center`}>
                        <Icon size={16} className="text-white" />
                      </div>
                      <ArrowUpRight size={14} className="text-slate-300" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                    <p className="text-xs text-slate-300 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Área: leads últimos 30 días + Pie: estado cuentas */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-slate-700">Leads últimos 30 días</p>
                    <span className="text-xs text-slate-400">{leadsThisMonth.length} este mes</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={leadsPerDay} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={4} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }}
                        labelStyle={{ color: '#64748b' }}
                      />
                      <Area type="monotone" dataKey="leads" stroke="#22c55e" strokeWidth={2} fill="url(#colorLeads)" name="Leads" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <p className="text-sm font-semibold text-slate-700 mb-4">Estado de cuentas</p>
                  {accountStatusData.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-slate-300 text-sm">Sin cuentas aún</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie data={accountStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                            {accountStatusData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-1.5 mt-2">
                        {accountStatusData.map(d => (
                          <div key={d.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                              <span className="text-slate-500">{d.name}</span>
                            </div>
                            <span className="font-semibold text-slate-800">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bar: leads por cliente + Actividad reciente */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <p className="text-sm font-semibold text-slate-700 mb-4">Leads por cliente</p>
                  {leadsPerClient.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-slate-300 text-sm">Sin datos</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={leadsPerClient} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="nombre" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="leads" name="Total" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="desbloqueados" name="Desbloqueados" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity size={14} className="text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700">Actividad reciente</p>
                  </div>
                  {recentLeads.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-slate-300 text-sm">Sin actividad</div>
                  ) : (
                    <div className="space-y-3">
                      {recentLeads.map(lead => {
                        const clientName = clients.find(c => c.id === lead.client_id)?.company_name || '—'
                        return (
                          <div key={lead.id} className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${lead.is_locked ? 'bg-yellow-400' : 'bg-green-400'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-800 truncate">{lead.full_name}</p>
                              <p className="text-xs text-slate-400 truncate">{clientName}</p>
                            </div>
                            <span className="text-xs text-slate-300 flex-shrink-0">
                              {new Date(lead.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="divide-y divide-slate-100">
              {clients.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-12">No hay clientes registrados aún.</p>
              )}
              {clients.map(client => (
                <ClientRow
                  key={client.id}
                  client={client}
                  onRefresh={fetchData}
                  initialExpanded={client.id === highlightClientId}
                />
              ))}
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

    </DashboardLayout>
  )
}
