import { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Users, TrendingUp, DollarSign, Edit2, Zap, ToggleLeft, ToggleRight, Copy, Check, Trash2, Link, ChevronDown, Lock, Unlock, RefreshCw, Activity, ArrowUpRight, Tag, Plus, AlertCircle } from 'lucide-react'
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
      <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-2">URL del webhook</p>
      <div className="flex items-center gap-2 bg-[#070b10] border border-white/[0.08] rounded-xl px-3 py-2">
        <code className="flex-1 text-xs text-green-400 break-all font-mono">{url}</code>
        <button onClick={copy} className="flex-shrink-0 text-white/30 hover:text-green-400 transition-colors p-1">
          {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
        </button>
      </div>
      <p className="text-xs text-white/30 mt-1.5">Pega esta URL en Meta Ads o n8n para este cliente.</p>
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
  const [addLeadOpen, setAddLeadOpen] = useState(false)
  const [addLeadForm, setAddLeadForm] = useState({ full_name: '', phone: '', email: '', city: '', state: '', product_interest: '', campaign_name: '', is_locked: true })
  const [addLeadLoading, setAddLeadLoading] = useState(false)
  const [addLeadError, setAddLeadError] = useState(null)

  useEffect(() => {
    if (initialExpanded) {
      fetchLeads()
      setEditForm({
        company_name: client.company_name !== '(sin nombre)' ? client.company_name : '',
        phone: client.phone || '',
        city: client.city || '',
        status: client.status || 'pending',
        lead_price: client.lead_price || '',
        leads_per_month: client.leads_per_month || '',
        budget: client.budget || '',
        goal: client.goal || '',
        target_audience: client.target_audience || '',
        product_description: client.product_description || '',
        target_state: client.target_state || '',
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
        lead_price: client.lead_price || '',
        leads_per_month: client.leads_per_month || '',
        budget: client.budget || '',
        goal: client.goal || '',
        target_audience: client.target_audience || '',
        product_description: client.product_description || '',
        target_state: client.target_state || '',
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
      lead_price: editForm.lead_price ? parseFloat(editForm.lead_price) : null,
      leads_per_month: editForm.leads_per_month ? parseInt(editForm.leads_per_month) : null,
      budget: editForm.budget || null,
      goal: editForm.goal || null,
      target_audience: editForm.target_audience || null,
      product_description: editForm.product_description || null,
      target_state: editForm.target_state || null,
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

  async function handleAddLead(e) {
    e.stopPropagation()
    if (!addLeadForm.full_name.trim()) { setAddLeadError('El nombre es requerido.'); return }
    setAddLeadLoading(true)
    setAddLeadError(null)
    const { data, error } = await supabase.from('leads').insert({
      client_id: client.id,
      full_name: addLeadForm.full_name.trim(),
      phone: addLeadForm.phone.trim() || null,
      email: addLeadForm.email.trim() || null,
      city: addLeadForm.city.trim() || null,
      state: addLeadForm.state.trim() || null,
      product_interest: addLeadForm.product_interest.trim() || null,
      campaign_name: addLeadForm.campaign_name.trim() || null,
      is_locked: addLeadForm.is_locked,
      source: 'Manual',
      status: 'new',
      acquisition_cost: 0,
    }).select().single()
    if (error) {
      setAddLeadError(error.message)
    } else {
      setClientLeads(prev => [data, ...prev])
      setAddLeadForm({ full_name: '', phone: '', email: '', city: '', state: '', product_interest: '', campaign_name: '', is_locked: true })
      setAddLeadOpen(false)
    }
    setAddLeadLoading(false)
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
      <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] cursor-pointer transition-colors" onClick={handleExpand}>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">{client.company_name}</p>
          <p className="text-xs text-white/30">{client.email}{client.city ? ` · ${client.city}` : ''}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {(client.categories || []).map(cat => (
            <span key={cat} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-medium border border-blue-500/15">{cat}</span>
          ))}
          {(!client.categories || client.categories.length === 0) && <span className="text-xs text-white/20">Sin categoría</span>}
        </div>
        <div className="text-center hidden md:block">
          <p className="text-[10px] text-white/25 uppercase tracking-wide">Leads</p>
          <p className="font-bold text-white text-sm">{client.leads_total}</p>
        </div>
        <div className="text-center hidden md:block">
          <p className="text-[10px] text-white/25 uppercase tracking-wide">Desbloq.</p>
          <Badge color="green">{client.leads_unlocked}</Badge>
        </div>
        <div className="text-center hidden md:block">
          <p className="text-[10px] text-white/25 uppercase tracking-wide">Conv.</p>
          <p className="font-bold text-white text-sm">{unlockRate}%</p>
        </div>
        <div className="text-center hidden md:block">
          <p className="text-[10px] text-white/25 uppercase tracking-wide">Ingresos</p>
          <p className="font-bold text-green-400 text-sm">${client.revenue}</p>
        </div>
        <Badge color={statusColor}>{statusLabel}</Badge>
        <ChevronDown size={14} className={`text-white/25 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </div>

      {expanded && (
        <div className="bg-white/[0.015] border-t border-white/[0.05]">
          {/* Info + Métricas + Webhook */}
          <div className="px-5 py-5 grid md:grid-cols-3 gap-6 border-b border-white/[0.05]">
            {/* Col 1: Info editable */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Cuenta</p>
                {!editMode
                  ? <button onClick={e => { e.stopPropagation(); setEditMode(true) }} className="flex items-center gap-1 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-semibold px-2.5 py-1 rounded-lg transition-colors border border-blue-500/15">
                      <Edit2 size={10} /> Editar
                    </button>
                  : <div className="flex gap-3">
                      <button onClick={() => setEditMode(false)} className="text-xs text-white/30 hover:text-white/60">Cancelar</button>
                      <button onClick={handleSave} disabled={saving} className="text-xs text-green-400 hover:text-green-300 font-semibold">
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
                    { label: 'Precio lead $', key: 'lead_price', type: 'number' },
                    { label: 'Leads/mes', key: 'leads_per_month', type: 'number' },
                    { label: 'Presupuesto', key: 'budget' },
                  ].map(({ label, key, type = 'text' }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs text-white/30 w-20 flex-shrink-0">{label}</span>
                      <input
                        type={type}
                        value={editForm[key] || ''}
                        onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))}
                        onClick={e => e.stopPropagation()}
                        className="flex-1 px-2 py-1.5 text-xs border border-white/10 rounded-lg focus:outline-none focus:border-green-500/40 bg-white/[0.05] text-white"
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30 w-20 flex-shrink-0">Estado</span>
                    <select
                      value={editForm.status}
                      onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 px-2 py-1.5 text-xs border border-white/10 rounded-lg focus:outline-none focus:border-green-500/40 bg-[#0c1018] text-white"
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
                      <span className="text-xs text-white/30">{label}</span>
                      <span className="text-xs font-medium text-white/70 text-right ml-4 max-w-[60%] truncate">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Col 2: Métricas financieras */}
            <div>
              <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-3">Métricas</p>
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
                    <span className="text-xs text-white/30">{label}</span>
                    <span className="text-xs font-medium text-white/70">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 3: Campaña + Webhook */}
            <div>
              <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-3">Campaña & Webhook</p>
              {editMode ? (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-white/30 block mb-1">Producto / servicio</label>
                    <textarea
                      rows={2}
                      value={editForm.product_description || ''}
                      onChange={e => setEditForm(p => ({ ...p, product_description: e.target.value }))}
                      onClick={e => e.stopPropagation()}
                      className="w-full px-2 py-1 text-xs border border-white/[0.1] rounded-lg resize-none focus:outline-none focus:border-green-500/40 bg-white/[0.05] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/30 block mb-1">Estado(s) de venta</label>
                    <input
                      value={editForm.target_state || ''}
                      onChange={e => setEditForm(p => ({ ...p, target_state: e.target.value }))}
                      onClick={e => e.stopPropagation()}
                      placeholder="Ej. Florida, Texas"
                      className="w-full px-2 py-1 text-xs border border-white/[0.1] rounded-lg focus:outline-none focus:border-green-500/40 bg-white/[0.05] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/30 block mb-1">Objetivo</label>
                    <textarea
                      rows={2}
                      value={editForm.goal || ''}
                      onChange={e => setEditForm(p => ({ ...p, goal: e.target.value }))}
                      onClick={e => e.stopPropagation()}
                      className="w-full px-2 py-1 text-xs border border-white/[0.1] rounded-lg resize-none focus:outline-none focus:border-green-500/40 bg-white/[0.05] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/30 block mb-1">Audiencia objetivo</label>
                    <textarea
                      rows={3}
                      value={editForm.target_audience || ''}
                      onChange={e => setEditForm(p => ({ ...p, target_audience: e.target.value }))}
                      onClick={e => e.stopPropagation()}
                      className="w-full px-2 py-1 text-xs border border-white/[0.1] rounded-lg resize-none focus:outline-none focus:border-green-500/40 bg-white/[0.05] text-white"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-2">
                    <p className="text-xs text-white/30 mb-0.5">Producto / servicio</p>
                    <p className="text-xs text-white/65 leading-relaxed">{client.product_description || '—'}</p>
                  </div>
                  <div className="mb-2">
                    <p className="text-xs text-white/30 mb-0.5">Estado(s) de venta</p>
                    <p className="text-xs text-white/65">{client.target_state || '—'}</p>
                  </div>
                  <div className="mb-2">
                    <p className="text-xs text-white/30 mb-0.5">Objetivo</p>
                    <p className="text-xs text-white/65">{client.goal || '—'}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-white/30 mb-0.5">Audiencia objetivo</p>
                    <p className="text-xs text-white/65 leading-relaxed">{client.target_audience || '—'}</p>
                  </div>
                </>
              )}
              <div className="pt-3 border-t border-white/[0.05]">
                <CopyWebhook clientId={client.id} />
              </div>
            </div>
          </div>

          {/* Gestión de crédito */}
          <div className="px-6 py-5 border-t border-white/[0.05] bg-white/[0.01]">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Estado del crédito */}
              <div>
                <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-3">Crédito de cuenta</p>
                <div className="flex items-end gap-4 mb-3">
                  <div>
                    <p className="text-xs text-white/30 mb-0.5">Saldo disponible</p>
                    <p className={`text-2xl font-bold ${currentBalance > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      ${currentBalance.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-0.5">Leads disponibles</p>
                    <p className="text-2xl font-black text-white">
                      {client.lead_price ? Math.floor(currentBalance / client.lead_price) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-0.5">Precio por lead</p>
                    <p className="text-lg font-semibold text-white/60">{client.lead_price ? `$${client.lead_price}` : <span className="text-amber-500 text-sm font-medium">Sin precio</span>}</p>
                  </div>
                </div>
                {/* Progress toward $1,000 / 50 leads */}
                <div>
                  <div className="flex justify-between text-xs text-white/30 mb-1">
                    <span>Consumido: ${client.revenue.toLocaleString()} de $1,000</span>
                    <span>{client.leads_unlocked} de 50 leads</span>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
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
                <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-3">Agregar crédito</p>
                <div className="flex gap-2 mb-2">
                  {[100, 200, 500, 1000].map(preset => (
                    <button
                      key={preset}
                      onClick={e => { e.stopPropagation(); setCreditAmount(String(preset)) }}
                      className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                        creditAmount === String(preset)
                          ? 'bg-green-500 text-white border-green-500'
                          : 'border-white/[0.1] text-white/50 hover:border-green-500/40 hover:text-green-400 bg-white/[0.04]'
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
                    className="flex-1 px-3 py-2 border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:border-green-500/40 bg-white/[0.05]"
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
              <p className="text-xs font-bold text-white/30 uppercase tracking-wide">
                Historial de leads ({clientLeads.length})
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={e => { e.stopPropagation(); fetchLeads() }}
                  className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  <RefreshCw size={11} /> Actualizar
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setAddLeadOpen(o => !o); setAddLeadError(null) }}
                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-semibold transition-colors"
                >
                  <Plus size={11} /> Agregar lead
                </button>
              </div>
            </div>

            {/* Formulario agregar lead */}
            {addLeadOpen && (
              <div className="mb-4 bg-white/[0.03] border border-green-500/20 rounded-xl p-4" onClick={e => e.stopPropagation()}>
                <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-3">Nuevo lead manual</p>
                <div className="grid sm:grid-cols-2 gap-2 mb-2">
                  {[
                    { label: 'Nombre *', key: 'full_name', placeholder: 'Juan Pérez' },
                    { label: 'Teléfono', key: 'phone', placeholder: '+1 555 000 0000' },
                    { label: 'Email', key: 'email', placeholder: 'juan@email.com' },
                    { label: 'Ciudad', key: 'city', placeholder: 'Miami' },
                    { label: 'Estado', key: 'state', placeholder: 'Florida' },
                    { label: 'Interés', key: 'product_interest', placeholder: 'Fondo de retiro' },
                    { label: 'Campaña', key: 'campaign_name', placeholder: 'Camp_Q1' },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs text-white/30 mb-0.5 block">{label}</label>
                      <input
                        value={addLeadForm[key]}
                        onChange={e => setAddLeadForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-2 py-1.5 text-xs border border-white/[0.1] rounded-lg focus:outline-none focus:border-green-500/40 bg-white/[0.05] text-white"
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-1">
                    <label className="text-xs text-white/30">Bloqueado</label>
                    <button
                      onClick={() => setAddLeadForm(f => ({ ...f, is_locked: !f.is_locked }))}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${addLeadForm.is_locked ? 'bg-yellow-100 text-yellow-700' : 'bg-green-500/15 text-green-400'}`}
                    >
                      {addLeadForm.is_locked ? <><Lock size={10} /> Bloqueado</> : <><Unlock size={10} /> Libre</>}
                    </button>
                  </div>
                </div>
                {addLeadError && <p className="text-xs text-red-500 mb-2">{addLeadError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); setAddLeadOpen(false) }}
                    className="px-3 py-1.5 text-xs border border-white/[0.08] rounded-lg text-white/35 hover:bg-white/[0.05]"
                  >Cancelar</button>
                  <button
                    onClick={handleAddLead}
                    disabled={addLeadLoading}
                    className="px-3 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50"
                  >{addLeadLoading ? 'Guardando…' : '+ Guardar lead'}</button>
                </div>
              </div>
            )}

            {loadingLeads ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500" />
              </div>
            ) : clientLeads.length === 0 ? (
              <p className="text-center text-white/25 text-sm py-8">No hay leads para esta cuenta.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
                <table className="w-full bg-[#0c1018] text-xs">
                  <thead>
                    <tr className="bg-white/[0.03] border-b border-white/[0.05]">
                      {['Nombre', 'Teléfono', 'Email', 'Ciudad', 'Interés', 'Status', 'Bloqueo', 'Fecha', ''].map(h => (
                        <th key={h} className="text-left font-semibold text-white/30 uppercase tracking-wide px-3 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {clientLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-3 py-2.5 font-medium text-white/80">{lead.full_name}</td>
                        <td className="px-3 py-2.5 text-white/40">{lead.phone || '—'}</td>
                        <td className="px-3 py-2.5 text-white/40">{lead.email || '—'}</td>
                        <td className="px-3 py-2.5 text-white/40">{lead.city || '—'}</td>
                        <td className="px-3 py-2.5">
                          {lead.product_interest
                            ? <span className="bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full font-medium">{lead.product_interest}</span>
                            : <span className="text-white/25">—</span>}
                        </td>
                        <td className="px-3 py-2.5"><StatusBadge status={lead.status} /></td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={e => { e.stopPropagation(); handleToggleLock(lead.id, lead.is_locked) }}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-medium transition-colors ${lead.is_locked ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25' : 'bg-green-500/15 text-green-400 hover:bg-green-500/25'}`}
                          >
                            {lead.is_locked ? <><Lock size={10} /> Bloqueado</> : <><Unlock size={10} /> Libre</>}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-white/25">
                          {new Date(lead.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteLead(lead.id) }}
                            className="text-white/15 hover:text-red-400 transition-colors p-1"
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
    <div className="bg-white/[0.03] rounded-2xl border border-white/[0.07] p-5 hover:bg-white/[0.05] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-white/35 uppercase tracking-wide">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={17} />
        </div>
      </div>
      <p className="text-2xl font-black text-white tracking-tight">{value}</p>
      {sub && <p className="text-xs text-white/25 mt-1">{sub}</p>}
    </div>
  )
}

const EMPTY_CAMPAIGN_FORM = { name: '', client_id: '', source: 'Meta Ads', meta_form_id: '', interest_category: '', lead_interest: '', cost_per_lead: '' }

export default function AdminDashboard() {
  const { isMock, user: adminUser } = useAuth()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('overview')
  const [highlightClientId, setHighlightClientId] = useState(null)
  const [clients, setClients] = useState([])
  const [leads, setLeads] = useState([])
  const [categories, setCategories] = useState(INITIAL_CATEGORIES)
  const [campaigns, setCampaigns] = useState([])
  const [campaignForm, setCampaignForm] = useState(EMPTY_CAMPAIGN_FORM)
  const [campaignLoading, setCampaignLoading] = useState(false)
  const [editingCampaignId, setEditingCampaignId] = useState(null)
  const [editCampaignForm, setEditCampaignForm] = useState({})
  const [showCampaignForm, setShowCampaignForm] = useState(false)
  const [loadingData, setLoadingData] = useState(!isMock)
  const [codes, setCodes] = useState([])
  const [codeForm, setCodeForm] = useState({ code: '', discount_pct: 20, max_uses: '', expires_at: '' })
  const [codeLoading, setCodeLoading] = useState(false)
  const [codeError, setCodeError] = useState(null)
  const [leadsSearch, setLeadsSearch] = useState('')
  const [leadsClientFilter, setLeadsClientFilter] = useState('')
  const [leadsStatusFilter, setLeadsStatusFilter] = useState('all')
  const [scriptLinks, setScriptLinks] = useState([
    { id: null, title: '', url: '', position: 1 },
    { id: null, title: '', url: '', position: 2 },
    { id: null, title: '', url: '', position: 3 },
  ])
  const [scriptLinksSaving, setScriptLinksSaving] = useState(false)
  const [scriptLinksSaved, setScriptLinksSaved] = useState(false)

  useEffect(() => {
    if (isMock) return
    fetchData()
    fetchCampaigns()
    fetchCodes()
    fetchScriptLinks()
  }, [isMock])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const clientParam = params.get('client')
    if (clientParam) {
      setActiveTab('clients')
      setHighlightClientId(clientParam)
    }
  }, [location.search])

  async function fetchScriptLinks() {
    const { data } = await supabase.from('script_links').select('*').order('position')
    if (data && data.length > 0) {
      setScriptLinks([
        data.find(d => d.position === 1) || { id: null, title: '', url: '', position: 1 },
        data.find(d => d.position === 2) || { id: null, title: '', url: '', position: 2 },
        data.find(d => d.position === 3) || { id: null, title: '', url: '', position: 3 },
      ])
    }
  }

  async function saveScriptLinks() {
    setScriptLinksSaving(true)
    for (const link of scriptLinks) {
      if (link.id) {
        await supabase.from('script_links').update({ title: link.title, url: link.url }).eq('id', link.id)
      } else if (link.title || link.url) {
        await supabase.from('script_links').insert({ title: link.title, url: link.url, position: link.position })
      }
    }
    await fetchScriptLinks()
    setScriptLinksSaving(false)
    setScriptLinksSaved(true)
    setTimeout(() => setScriptLinksSaved(false), 2500)
  }

  async function fetchCodes() {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setCodeError(`Error al cargar códigos: ${error.message}`)
    else setCodes(data || [])
  }

  async function createCode() {
    setCodeError(null)
    const trimmed = codeForm.code.toUpperCase().trim()
    if (!trimmed) return setCodeError('El código no puede estar vacío.')
    if (!codeForm.discount_pct || codeForm.discount_pct < 1 || codeForm.discount_pct > 100)
      return setCodeError('El descuento debe estar entre 1% y 100%.')
    setCodeLoading(true)
    const { error } = await supabase.from('discount_codes').insert({
      code: trimmed,
      discount_pct: parseInt(codeForm.discount_pct),
      max_uses: codeForm.max_uses ? parseInt(codeForm.max_uses) : null,
      expires_at: codeForm.expires_at || null,
      active: true,
    })
    if (error) {
      setCodeError(error.code === '23505' ? 'Ese código ya existe.' : `Error: ${error.message}`)
    } else {
      setCodeForm({ code: '', discount_pct: 20, max_uses: '', expires_at: '' })
      fetchCodes()
    }
    setCodeLoading(false)
  }

  async function toggleCode(id, active) {
    await supabase.from('discount_codes').update({ active: !active }).eq('id', id)
    setCodes(prev => prev.map(c => c.id === id ? { ...c, active: !active } : c))
  }

  async function deleteCode(id) {
    await supabase.from('discount_codes').delete().eq('id', id)
    setCodes(prev => prev.filter(c => c.id !== id))
  }

  async function fetchCampaigns() {
    const { data } = await supabase
      .from('campaigns')
      .select('id, name, source, is_active, created_at, client_id, meta_form_id, interest_category, lead_interest, cost_per_lead, clients(company_name)')
      .order('created_at', { ascending: false })
    if (data) setCampaigns(data)
  }

  async function fetchData() {
    setLoadingData(true)
    try {
      const [{ data: clientsData }, { data: usersData }, { data: leadsData }, { data: unlocksData }] = await Promise.all([
        supabase.from('clients').select('id, company_name, lead_price, balance, created_at, user_id, phone, city, categories, budget, leads_per_month, target_audience, goal, product_description, target_state, status').order('created_at', { ascending: false }),
        supabase.from('users').select('id, email, full_name, role'),
        supabase.from('leads').select('id, full_name, email, phone, city, product_interest, is_locked, status, created_at, client_id, acquisition_cost, campaign_name, campaign_id').order('created_at', { ascending: false }).limit(1000),
        supabase.from('lead_unlocks').select('id, client_id, lead_id, amount_paid'),
      ])

      if (clientsData) {
        const adminIds = new Set((usersData || []).filter(u => u.role === 'admin').map(u => u.id))
        if (adminUser?.id) adminIds.add(adminUser.id)
        const mapped = clientsData
          .filter(c => !adminIds.has(c.user_id))
          .map(c => {
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
            product_description: c.product_description || '',
            target_state: c.target_state || '',
            status: c.status || 'pending',
            leads_total: clientLeads.length,
            leads_unlocked: clientUnlocks.length,
            revenue,
            total_cost,
            balance: c.balance || 0,
            lead_price: c.lead_price ?? null,
            created_at: c.created_at,
          }
        })
        setClients(mapped)
      }

      if (leadsData) {
        const clientsMap = {}
        clientsData?.forEach(c => { clientsMap[c.id] = c.company_name || '—' })
        const unlocksMap = {}
        unlocksData?.forEach(u => { if (u.lead_id) unlocksMap[u.lead_id] = Number(u.amount_paid || 0) })
        setLeads(leadsData.map(l => ({
          ...l,
          client_name: clientsMap[l.client_id] || '—',
          cost: Number(l.acquisition_cost || 0),
          amount_paid: unlocksMap[l.id] || 0,
          profit: (unlocksMap[l.id] || 0) - Number(l.acquisition_cost || 0),
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

  const campaignStats = useMemo(() => campaigns.map(camp => {
    const campLeads = leads.filter(l => l.campaign_id === camp.id)
    const unlocked = campLeads.filter(l => !l.is_locked)
    const totalCost = campLeads.reduce((s, l) => s + Number(l.cost || 0), 0)
    const totalRevenue = campLeads.reduce((s, l) => s + Number(l.amount_paid || 0), 0)
    const clientName = clients.find(c => c.id === camp.client_id)?.company_name || camp.clients?.company_name || '—'
    const autoPrice = camp.cost_per_lead > 0 ? Math.max(Math.round(camp.cost_per_lead * 3), 12) : null
    return {
      ...camp,
      client_name: clientName,
      total_leads: campLeads.length,
      unlocked_leads: unlocked.length,
      conversion_rate: campLeads.length > 0 ? Math.round((unlocked.length / campLeads.length) * 100) : 0,
      total_cost: totalCost,
      total_revenue: totalRevenue,
      profit: totalRevenue - totalCost,
      auto_price: autoPrice,
    }
  }), [campaigns, leads, clients])

  const campaignCategoryMap = useMemo(() => {
    const map = {}
    campaigns.forEach(c => { if (c.name && c.interest_category) map[c.name] = c.interest_category })
    return map
  }, [campaigns])

  const filteredLeads = useMemo(() => leads.filter(l => {
    if (leadsClientFilter && l.client_id !== leadsClientFilter) return false
    if (leadsStatusFilter === 'unlocked' && l.is_locked) return false
    if (leadsStatusFilter === 'locked' && !l.is_locked) return false
    if (leadsSearch) {
      const q = leadsSearch.toLowerCase()
      return (l.full_name || '').toLowerCase().includes(q) ||
             (l.client_name || '').toLowerCase().includes(q) ||
             (l.campaign_name || '').toLowerCase().includes(q)
    }
    return true
  }), [leads, leadsClientFilter, leadsStatusFilter, leadsSearch])
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
      interest_category: campaignForm.interest_category.trim() || null,
      lead_interest: campaignForm.lead_interest.trim() || null,
      cost_per_lead: campaignForm.cost_per_lead ? parseFloat(campaignForm.cost_per_lead) : 0,
    })
    if (!error) { setCampaignForm(EMPTY_CAMPAIGN_FORM); setShowCampaignForm(false); await fetchCampaigns() }
    setCampaignLoading(false)
  }

  async function handleDeleteCampaign(id) {
    if (!confirm('¿Eliminar esta campaña?')) return
    await supabase.from('campaigns').delete().eq('id', id)
    await fetchCampaigns()
  }

  async function handleToggleCampaign(id, current) {
    await supabase.from('campaigns').update({ is_active: !current }).eq('id', id)
    await fetchCampaigns()
  }

  async function handleSaveCampaign(id) {
    await supabase.from('campaigns').update({
      name: editCampaignForm.name?.trim(),
      source: editCampaignForm.source,
      meta_form_id: editCampaignForm.meta_form_id?.trim() || null,
      interest_category: editCampaignForm.interest_category?.trim() || null,
      lead_interest: editCampaignForm.lead_interest?.trim() || null,
      cost_per_lead: editCampaignForm.cost_per_lead ? parseFloat(editCampaignForm.cost_per_lead) : 0,
      client_id: editCampaignForm.client_id,
    }).eq('id', id)
    setEditingCampaignId(null)
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
    { id: 'leads',       label: 'Leads' },
    { id: 'campaigns',   label: 'Campañas' },
    { id: 'categories',  label: 'Categorías' },
    { id: 'codes',       label: 'Descuentos' },
    { id: 'scripts',     label: 'Guiones' },
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
      <div className="p-4 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Panel Admin</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Administración</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard icon={Users} label="Clientes" value={clients.length} sub={`${clients.filter(c => c.status === 'active').length} activos`} color="bg-blue-500/10 text-blue-400" />
          <StatCard icon={TrendingUp} label="Leads totales" value={totalLeads} sub={`${totalUnlocked} desbloqueados · ${unlockRate}%`} color="bg-green-500/10 text-green-400" />
          <StatCard icon={DollarSign} label="Ingresos leads" value={`$${totalRevenue.toLocaleString()}`} sub={`Costo: $${totalCost.toFixed(0)}`} color="bg-emerald-500/10 text-emerald-400" />
          <StatCard icon={DollarSign} label="Utilidad neta" value={`$${(totalRevenue - totalCost).toFixed(0)}`} sub={totalRevenue > 0 ? `Margen ${Math.round(((totalRevenue - totalCost) / totalRevenue) * 100)}%` : '—'} color="bg-white/[0.05] text-white/40" />
        </div>

        <div className="bg-[#0c1018] rounded-2xl border border-white/[0.07]">
          <div className="flex border-b border-white/[0.06] overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-4 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                  activeTab === tab.id ? 'border-green-500 text-green-400' : 'border-transparent text-white/35 hover:text-white/65'
                }`}
              >
                {tab.label}
                {tab.id === 'categories' && (
                  <span className="ml-2 text-[10px] bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded-full font-bold">{activeCategories}</span>
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
                  <div key={label} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 hover:bg-white/[0.05] transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center`}>
                        <Icon size={16} className="text-white" />
                      </div>
                      <ArrowUpRight size={14} className="text-white/15" />
                    </div>
                    <p className="text-2xl font-black text-white tracking-tight">{value}</p>
                    <p className="text-xs text-white/35 mt-0.5">{label}</p>
                    <p className="text-xs text-white/20 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Área: leads últimos 30 días + Pie: estado cuentas */}
              <div className="grid md:grid-cols-3 gap-5">
                <div className="md:col-span-2 bg-white/[0.02] rounded-2xl border border-white/[0.06] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-white/65">Leads últimos 30 días</p>
                    <span className="text-xs text-white/25">{leadsThisMonth.length} este mes</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={leadsPerDay} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} tickLine={false} axisLine={false} interval={4} />
                      <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: '#0c1018', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12, color: '#fff' }}
                        labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                      />
                      <Area type="monotone" dataKey="leads" stroke="#22c55e" strokeWidth={2} fill="url(#colorLeads)" name="Leads" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-5">
                  <p className="text-sm font-semibold text-white/65 mb-4">Estado de cuentas</p>
                  {accountStatusData.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-white/20 text-sm">Sin cuentas aún</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie data={accountStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                            {accountStatusData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: '#0c1018', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-1.5 mt-2">
                        {accountStatusData.map(d => (
                          <div key={d.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                              <span className="text-white/40">{d.name}</span>
                            </div>
                            <span className="font-bold text-white/70">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bar: leads por cliente + Actividad reciente */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-5">
                  <p className="text-sm font-semibold text-white/65 mb-4">Leads por cliente</p>
                  {leadsPerClient.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-white/30 text-sm">Sin datos</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={leadsPerClient} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="nombre" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: '#0c1018', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="leads" name="Total" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="desbloqueados" name="Desbloqueados" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity size={14} className="text-white/30" />
                    <p className="text-sm font-semibold text-white/65">Actividad reciente</p>
                  </div>
                  {recentLeads.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-white/20 text-sm">Sin actividad</div>
                  ) : (
                    <div className="space-y-3">
                      {recentLeads.map(lead => {
                        const clientName = clients.find(c => c.id === lead.client_id)?.company_name || '—'
                        return (
                          <div key={lead.id} className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${lead.is_locked ? 'bg-amber-400' : 'bg-green-400'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-white/70 truncate">{lead.full_name}</p>
                              <p className="text-xs text-white/30 truncate">{clientName}</p>
                            </div>
                            <span className="text-xs text-white/20 flex-shrink-0">
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
            <div className="divide-y divide-white/[0.04]">
              {clients.length === 0 && (
                <p className="text-center text-white/30 text-sm py-12">No hay clientes registrados aún.</p>
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

          {activeTab === 'leads' && (() => {
            const totalCostLeads = filteredLeads.reduce((s, l) => s + l.cost, 0)
            const totalPaidLeads = filteredLeads.reduce((s, l) => s + l.amount_paid, 0)
            const totalProfitLeads = totalPaidLeads - totalCostLeads
            const unlockedCount = filteredLeads.filter(l => !l.is_locked).length
            return (
              <div className="p-6">
                {/* Métricas resumen */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  {[
                    { label: 'Total leads', value: filteredLeads.length, color: 'text-white' },
                    { label: 'Desbloqueados', value: `${unlockedCount} (${filteredLeads.length > 0 ? Math.round((unlockedCount / filteredLeads.length) * 100) : 0}%)`, color: 'text-green-400' },
                    { label: 'Costo campaña', value: `$${totalCostLeads.toFixed(2)}`, color: 'text-red-400' },
                    { label: 'Cobrado', value: `$${totalPaidLeads.toFixed(2)}`, color: 'text-blue-400' },
                    { label: 'Ganancia', value: `$${totalProfitLeads.toFixed(2)}`, color: totalProfitLeads >= 0 ? 'text-green-400' : 'text-red-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
                      <p className="text-xs text-white/30 font-medium mb-1">{label}</p>
                      <p className={`text-xl font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Buscar por nombre, cliente o campaña..."
                    value={leadsSearch}
                    onChange={e => setLeadsSearch(e.target.value)}
                    className="flex-1 min-w-48 px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-green-500/40"
                  />
                  <select
                    value={leadsClientFilter}
                    onChange={e => setLeadsClientFilter(e.target.value)}
                    className="px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-green-500/40"
                  >
                    <option value="">Todos los clientes</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                  <select
                    value={leadsStatusFilter}
                    onChange={e => setLeadsStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-green-500/40"
                  >
                    <option value="all">Todos</option>
                    <option value="unlocked">Desbloqueados</option>
                    <option value="locked">Bloqueados</option>
                  </select>
                </div>

                {/* Tabla */}
                {filteredLeads.length === 0 ? (
                  <div className="text-center py-16 text-white/30 text-sm">No hay leads con esos filtros.</div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/[0.07]">
                    <table className="w-full bg-[#0c1018] text-xs">
                      <thead>
                        <tr className="bg-white/[0.03] border-b border-white/[0.05]">
                          {['Nombre', 'Cliente', 'Campaña / Categoría', 'Estado', 'Bloqueado', 'Costo', 'Cobrado', 'Ganancia', 'Fecha'].map(h => (
                            <th key={h} className="text-left font-semibold text-white/30 uppercase tracking-wide px-3 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {filteredLeads.map(lead => {
                          const category = campaignCategoryMap[lead.campaign_name]
                          const profit = lead.profit
                          return (
                            <tr key={lead.id} className="hover:bg-white/[0.03] transition-colors">
                              <td className="px-3 py-3">
                                <p className="font-medium text-white">{lead.full_name}</p>
                                <p className="text-white/30">{lead.city || '—'}</p>
                              </td>
                              <td className="px-3 py-3 font-medium text-white/70">{lead.client_name}</td>
                              <td className="px-3 py-3">
                                <p className="text-white/50">{lead.campaign_name || '—'}</p>
                                {category && (
                                  <span className="bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full font-medium">{category}</span>
                                )}
                              </td>
                              <td className="px-3 py-3"><StatusBadge status={lead.status} /></td>
                              <td className="px-3 py-3">
                                <span className={`px-2 py-0.5 rounded-full font-semibold ${lead.is_locked ? 'bg-yellow-100 text-yellow-700' : 'bg-green-500/15 text-green-400'}`}>
                                  {lead.is_locked ? 'Bloqueado' : 'Libre'}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-red-400 font-medium">${lead.cost.toFixed(2)}</td>
                              <td className="px-3 py-3 text-blue-400 font-medium">${lead.amount_paid.toFixed(2)}</td>
                              <td className="px-3 py-3">
                                <span className={`font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  ${profit.toFixed(2)}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-white/30">
                                {new Date(lead.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })()}

          {activeTab === 'campaigns' && (
            <div className="p-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Campañas activas', value: campaignStats.filter(c => c.is_active).length },
                  { label: 'Leads generados', value: campaignStats.reduce((s, c) => s + c.total_leads, 0) },
                  { label: 'Ingresos totales', value: `$${campaignStats.reduce((s, c) => s + c.total_revenue, 0).toFixed(0)}` },
                  { label: 'Ganancia neta', value: `$${campaignStats.reduce((s, c) => s + c.profit, 0).toFixed(0)}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
                    <p className="text-xs text-white/30 mb-1">{label}</p>
                    <p className="text-xl font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>

              {/* Header + botón nueva campaña */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-white/65">Campañas ({campaigns.length})</p>
                <button
                  onClick={() => { setShowCampaignForm(s => !s); setCampaignForm(EMPTY_CAMPAIGN_FORM) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  <Plus size={13} /> {showCampaignForm ? 'Cancelar' : 'Nueva campaña'}
                </button>
              </div>

              {/* Formulario nueva campaña */}
              {showCampaignForm && (
                <form onSubmit={handleAddCampaign} className="bg-white/[0.03] border border-green-500/20 rounded-2xl p-5 mb-5">
                  <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-3">Nueva campaña</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-white/35 mb-1">Nombre (exacto)</label>
                      <input required value={campaignForm.name} onChange={e => setCampaignForm(p => ({ ...p, name: e.target.value }))} placeholder="Camp_Medicare_Q2" className="w-full px-3 py-2 border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:border-green-500/40 bg-white/[0.05]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/35 mb-1">Cliente</label>
                      <select required value={campaignForm.client_id} onChange={e => {
                          const clientId = e.target.value
                          const selectedClient = clients.find(c => c.id === clientId)
                          const firstCategory = selectedClient?.categories?.[0] || ''
                          setCampaignForm(p => ({ ...p, client_id: clientId, interest_category: firstCategory }))
                        }} className="w-full px-3 py-2 border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:border-green-500/40 bg-white/[0.05]">
                        <option value="">Seleccionar cliente</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.company_name !== '(sin nombre)' ? c.company_name : c.email}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/35 mb-1">Fuente</label>
                      <select value={campaignForm.source} onChange={e => setCampaignForm(p => ({ ...p, source: e.target.value }))} className="w-full px-3 py-2 border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:border-green-500/40 bg-white/[0.05]">
                        {['Meta Ads', 'Zapier', 'n8n', 'Make', 'GoHighLevel', 'Manual'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/35 mb-1">Costo por lead <span className="text-white/25">($)</span></label>
                      <input type="number" step="0.01" min="0" value={campaignForm.cost_per_lead} onChange={e => setCampaignForm(p => ({ ...p, cost_per_lead: e.target.value }))} placeholder="Ej. 5.00" className="w-full px-3 py-2 border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:border-green-500/40 bg-white/[0.05]" />
                      {campaignForm.cost_per_lead > 0 && (
                        <p className="text-xs text-green-600 mt-1">→ Precio al cliente: ${Math.max(Math.round(campaignForm.cost_per_lead * 3), 12)}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/35 mb-1">Meta Form ID</label>
                      <input value={campaignForm.meta_form_id} onChange={e => setCampaignForm(p => ({ ...p, meta_form_id: e.target.value }))} placeholder="1234567890123456" className="w-full px-3 py-2 border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:border-green-500/40 bg-white/[0.05]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/35 mb-1">Categoría</label>
                      <select value={campaignForm.interest_category} onChange={e => setCampaignForm(p => ({ ...p, interest_category: e.target.value }))} className="w-full px-3 py-2 border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:border-green-500/40 bg-white/[0.05]">
                        <option value="">Sin categoría</option>
                        {INITIAL_CATEGORIES.map(cat => <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/35 mb-1">Interés del lead</label>
                      <input value={campaignForm.lead_interest} onChange={e => setCampaignForm(p => ({ ...p, lead_interest: e.target.value }))} placeholder="Ej: Fondo de retiro, Plan de vida con ahorro..." className="w-full px-3 py-2 border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:border-green-500/40 bg-white/[0.05] placeholder-white/20" />
                    </div>
                  </div>
                  <button type="submit" disabled={campaignLoading} className="mt-3 px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl disabled:opacity-50">
                    {campaignLoading ? 'Guardando...' : '+ Crear campaña'}
                  </button>
                </form>
              )}

              {/* Lista de campañas */}
              {campaignStats.length === 0 ? (
                <div className="text-center py-12 text-white/30">
                  <Link size={28} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No hay campañas registradas aún.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaignStats.map(camp => (
                    <div key={camp.id} className={`rounded-2xl border overflow-hidden ${camp.is_active ? 'border-green-500/20' : 'border-white/[0.07]'}`}>
                      {editingCampaignId === camp.id ? (
                        <div className="p-4 bg-[#0c1018] space-y-3">
                          <p className="text-xs font-bold text-white/30 uppercase tracking-wide">Editar campaña</p>
                          <div className="grid sm:grid-cols-2 gap-2">
                            <div><label className="text-xs text-white/30 block mb-1">Nombre</label><input value={editCampaignForm.name || ''} onChange={e => setEditCampaignForm(p => ({ ...p, name: e.target.value }))} className="w-full px-2 py-1.5 text-xs border border-white/[0.1] rounded-lg focus:outline-none focus:border-green-500/40 bg-white/[0.05] text-white" /></div>
                            <div><label className="text-xs text-white/30 block mb-1">Cliente</label><select value={editCampaignForm.client_id || ''} onChange={e => setEditCampaignForm(p => ({ ...p, client_id: e.target.value }))} className="w-full px-2 py-1.5 text-xs border border-white/[0.1] rounded-lg focus:outline-none focus:border-green-500/40 bg-white/[0.05] text-white">{clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}</select></div>
                            <div><label className="text-xs text-white/30 block mb-1">Fuente</label><select value={editCampaignForm.source || 'Meta Ads'} onChange={e => setEditCampaignForm(p => ({ ...p, source: e.target.value }))} className="w-full px-2 py-1.5 text-xs border border-white/[0.1] rounded-lg focus:outline-none focus:border-green-500/40 bg-white/[0.05] text-white">{['Meta Ads', 'Zapier', 'n8n', 'Make', 'GoHighLevel', 'Manual'].map(s => <option key={s}>{s}</option>)}</select></div>
                            <div>
                              <label className="text-xs text-white/30 block mb-1">Costo por lead ($)</label>
                              <input type="number" step="0.01" min="0" value={editCampaignForm.cost_per_lead || ''} onChange={e => setEditCampaignForm(p => ({ ...p, cost_per_lead: e.target.value }))} placeholder="Ej. 5.00" className="w-full px-2 py-1.5 text-xs border border-white/[0.1] rounded-lg focus:outline-none focus:border-green-500/40 bg-white/[0.05] text-white" />
                              {editCampaignForm.cost_per_lead > 0 && <p className="text-xs text-green-600 mt-1">→ Precio cliente: ${Math.max(Math.round(editCampaignForm.cost_per_lead * 3), 12)}</p>}
                            </div>
                            <div><label className="text-xs text-white/30 block mb-1">Meta Form ID</label><input value={editCampaignForm.meta_form_id || ''} onChange={e => setEditCampaignForm(p => ({ ...p, meta_form_id: e.target.value }))} placeholder="1234567890123456" className="w-full px-2 py-1.5 text-xs border border-white/[0.1] rounded-lg focus:outline-none focus:border-green-500/40 bg-white/[0.05] text-white" /></div>
                            <div><label className="text-xs text-white/30 block mb-1">Categoría</label><select value={editCampaignForm.interest_category || ''} onChange={e => setEditCampaignForm(p => ({ ...p, interest_category: e.target.value }))} className="w-full px-2 py-1.5 text-xs border border-white/[0.1] rounded-lg focus:outline-none focus:border-green-500/40 bg-white/[0.05] text-white"><option value="">Sin categoría</option>{INITIAL_CATEGORIES.map(cat => <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>)}</select></div>
                            <div><label className="text-xs text-white/30 block mb-1">Interés del lead</label><input value={editCampaignForm.lead_interest || ''} onChange={e => setEditCampaignForm(p => ({ ...p, lead_interest: e.target.value }))} placeholder="Ej: Fondo de retiro..." className="w-full px-2 py-1.5 text-xs border border-white/[0.1] rounded-lg focus:outline-none focus:border-green-500/40 bg-white/[0.05] text-white placeholder-white/20" /></div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingCampaignId(null)} className="px-3 py-1.5 text-xs border border-white/[0.08] rounded-lg text-white/40 hover:bg-white/[0.05]">Cancelar</button>
                            <button onClick={() => handleSaveCampaign(camp.id)} className="px-3 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold">Guardar</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Header de la campaña */}
                          <div className={`flex items-center gap-3 px-4 py-3 ${camp.is_active ? 'bg-green-500/[0.07]' : 'bg-white/[0.02]'}`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-white text-sm">{camp.name}</p>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${camp.is_active ? 'bg-green-500/15 text-green-400' : 'bg-white/[0.06] text-white/30'}`}>{camp.is_active ? 'Activa' : 'Inactiva'}</span>
                                {camp.interest_category && <span className="text-xs bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full font-medium">{camp.interest_category}</span>}
                              </div>
                              <p className="text-xs text-white/35 mt-0.5">
                                {camp.client_name} · {camp.source}
                                {camp.meta_form_id ? ` · Form: ${camp.meta_form_id}` : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button onClick={() => handleToggleCampaign(camp.id, camp.is_active)} className="text-white/30 hover:text-green-500 transition-colors p-1">
                                {camp.is_active ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                              </button>
                              <button onClick={() => { setEditingCampaignId(camp.id); setEditCampaignForm({ name: camp.name, source: camp.source, meta_form_id: camp.meta_form_id || '', interest_category: camp.interest_category || '', lead_interest: camp.lead_interest || '', cost_per_lead: camp.cost_per_lead || '', client_id: camp.client_id }) }} className="text-white/30 hover:text-blue-400 transition-colors p-1">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleDeleteCampaign(camp.id)} className="text-white/30 hover:text-red-400 transition-colors p-1">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Métricas de la campaña */}
                          <div className="bg-white/[0.02] px-4 py-3 grid grid-cols-3 sm:grid-cols-6 gap-3 border-t border-white/[0.05]">
                            {[
                              { label: 'Costo/lead', value: camp.cost_per_lead > 0 ? `$${camp.cost_per_lead}` : '—', sub: camp.auto_price ? `→ cobra $${camp.auto_price}` : null, color: 'text-white/60' },
                              { label: 'Leads', value: camp.total_leads, color: 'text-white' },
                              { label: 'Desbloqueados', value: camp.unlocked_leads, color: 'text-green-400' },
                              { label: 'Conversión', value: `${camp.conversion_rate}%`, color: camp.conversion_rate >= 50 ? 'text-green-400' : 'text-white/60' },
                              { label: 'Ingresos', value: `$${camp.total_revenue.toFixed(0)}`, color: 'text-blue-400' },
                              { label: 'Ganancia', value: `$${camp.profit.toFixed(0)}`, color: camp.profit >= 0 ? 'text-green-400' : 'text-red-400' },
                            ].map(({ label, value, sub, color }) => (
                              <div key={label} className="text-center">
                                <p className="text-xs text-white/30">{label}</p>
                                <p className={`text-sm font-bold ${color}`}>{value}</p>
                                {sub && <p className="text-xs text-green-500">{sub}</p>}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'codes' && (
            <div className="p-6 max-w-3xl">
              <div className="mb-6">
                <h3 className="font-semibold text-white">Códigos de descuento</h3>
                <p className="text-sm text-white/35 mt-1">Crea códigos para dar descuento en la activación de $100.</p>
              </div>

              {/* Formulario nuevo código */}
              <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 mb-6">
                <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-4">Nuevo código</p>
                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-medium text-white/35 mb-1 block">Código</label>
                    <input
                      value={codeForm.code}
                      onChange={e => setCodeForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      placeholder="PROMO2026"
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-green-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/35 mb-1 block">Descuento (%)</label>
                    <input
                      type="number"
                      min="1" max="100"
                      value={codeForm.discount_pct}
                      onChange={e => setCodeForm(f => ({ ...f, discount_pct: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/35 mb-1 block">Máximo de usos <span className="text-white/25">(vacío = ilimitado)</span></label>
                    <input
                      type="number"
                      min="1"
                      value={codeForm.max_uses}
                      onChange={e => setCodeForm(f => ({ ...f, max_uses: e.target.value }))}
                      placeholder="Ej. 10"
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/35 mb-1 block">Vence el <span className="text-white/25">(opcional)</span></label>
                    <input
                      type="date"
                      value={codeForm.expires_at}
                      onChange={e => setCodeForm(f => ({ ...f, expires_at: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500/30"
                    />
                  </div>
                </div>
                {codeError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
                    <AlertCircle size={14} /> {codeError}
                  </div>
                )}
                <button
                  onClick={createCode}
                  disabled={codeLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  <Plus size={14} /> {codeLoading ? 'Creando…' : 'Crear código'}
                </button>
              </div>

              {/* Lista de códigos */}
              {codes.length === 0 ? (
                <div className="text-center text-white/25 text-sm py-12 bg-white/[0.02] border border-white/[0.07] rounded-2xl">
                  No hay códigos creados todavía.
                </div>
              ) : (
                <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl divide-y divide-white/[0.05]">
                  {codes.map(c => {
                    const expired = c.expires_at && new Date(c.expires_at) < new Date()
                    const exhausted = c.max_uses !== null && c.used_count >= c.max_uses
                    const effectivelyActive = c.active && !expired && !exhausted
                    return (
                      <div key={c.id} className="flex items-center gap-4 p-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${effectivelyActive ? 'bg-green-500/10' : 'bg-white/[0.05]'}`}>
                          <Tag size={16} className={effectivelyActive ? 'text-green-400' : 'text-white/30'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="font-bold text-white text-sm tracking-wide">{c.code}</code>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${effectivelyActive ? 'bg-green-500/15 text-green-400' : 'bg-white/[0.06] text-white/30'}`}>
                              {effectivelyActive ? 'Activo' : expired ? 'Vencido' : exhausted ? 'Agotado' : 'Inactivo'}
                            </span>
                          </div>
                          <p className="text-xs text-white/30 mt-0.5">
                            {c.discount_pct}% de descuento
                            {c.max_uses !== null ? ` · ${c.used_count}/${c.max_uses} usos` : ` · ${c.used_count} usos`}
                            {c.expires_at ? ` · vence ${new Date(c.expires_at).toLocaleDateString('es-MX', { dateStyle: 'medium' })}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCode(c.id, c.active)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${c.active ? 'border-orange-500/25 text-orange-400 hover:bg-orange-500/10' : 'border-green-500/25 text-green-400 hover:bg-green-500/10'}`}
                          >
                            {c.active ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => deleteCode(c.id)}
                            className="p-1.5 text-white/30 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'scripts' && (
            <div className="p-6 max-w-2xl">
              <div className="mb-6">
                <h3 className="font-semibold text-white">Guiones recomendados</h3>
                <p className="text-sm text-white/35 mt-1">Estos links aparecen en el detalle de cada lead para todos los clientes. Puedes poner hasta 3 links (Google Docs, PDF, Notion, etc.).</p>
              </div>
              <div className="space-y-4">
                {scriptLinks.map((link, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
                    <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-3">Link {i + 1}</p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-white/35 block mb-1">Título</label>
                        <input
                          value={link.title}
                          onChange={e => setScriptLinks(prev => prev.map((l, idx) => idx === i ? { ...l, title: e.target.value } : l))}
                          placeholder="Ej: Guion para Fondo de Retiro"
                          className="w-full px-3 py-2 border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:border-green-500/40 bg-white/[0.05] placeholder-white/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/35 block mb-1">URL del link</label>
                        <input
                          value={link.url}
                          onChange={e => setScriptLinks(prev => prev.map((l, idx) => idx === i ? { ...l, url: e.target.value } : l))}
                          placeholder="https://docs.google.com/..."
                          className="w-full px-3 py-2 border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:border-green-500/40 bg-white/[0.05] placeholder-white/20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={saveScriptLinks}
                disabled={scriptLinksSaving}
                className="mt-5 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors"
              >
                {scriptLinksSaving ? 'Guardando...' : scriptLinksSaved ? '¡Guardado!' : 'Guardar guiones'}
              </button>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-white">Nichos de leads disponibles</h3>
                  <p className="text-sm text-white/35 mt-1">Las categorías activas aparecen en el onboarding. Activa un nicho cuando tengas capacidad de correr esa campaña.</p>
                </div>
              </div>
              <div className="space-y-3">
                {categories.map(cat => (
                  <div key={cat.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${cat.is_active ? 'border-green-500/20 bg-green-500/[0.07]' : 'border-white/[0.07] bg-white/[0.02]'}`}>
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white text-sm">{cat.name}</p>
                        {cat.is_active
                          ? <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full font-semibold">Activa</span>
                          : <span className="text-xs bg-white/[0.06] text-white/30 px-2 py-0.5 rounded-full font-semibold">Inactiva</span>
                        }
                      </div>
                      <p className="text-xs text-white/35 mt-0.5">{cat.description}</p>
                    </div>
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${cat.is_active ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-white/[0.07] text-white/50 hover:bg-white/[0.12]'}`}
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
