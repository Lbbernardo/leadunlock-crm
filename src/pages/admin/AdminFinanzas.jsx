import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, TrendingUp, Users, Unlock, Pause, Play, Award, ChevronDown, RefreshCw } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Badge } from '../../components/ui/Badge'
import { supabase } from '../../lib/supabase'
import clsx from 'clsx'

const MIN_LEAD_PRICE = 12
const PROFIT_MULTIPLIER = 3
const CREDIT_THRESHOLD = 50

function calcLeadPrice(metaCostTotal, leadsTotal) {
  if (!leadsTotal) return MIN_LEAD_PRICE
  const costPerLead = metaCostTotal / leadsTotal
  return Math.max(MIN_LEAD_PRICE, Math.ceil(costPerLead * PROFIT_MULTIPLIER))
}

const STATUS_CONFIG = {
  active:  { label: 'Activo',    color: 'green',  dot: 'bg-green-500' },
  paused:  { label: 'Pausado',   color: 'yellow', dot: 'bg-yellow-500' },
  pending: { label: 'Pendiente', color: 'slate',  dot: 'bg-slate-500' },
}

function MetricCard({ label, value, sub, icon: Icon, color, highlight }) {
  return (
    <div className={clsx(
      'rounded-2xl p-5 border',
      highlight ? 'bg-green-500/10 border-green-500/30' : 'bg-white border-slate-200',
    )}>
      <div className="flex items-start justify-between mb-3">
        <p className={clsx('text-sm font-medium', highlight ? 'text-green-300' : 'text-slate-500')}>{label}</p>
        <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', color)}>
          <Icon size={18} />
        </div>
      </div>
      <p className={clsx('text-3xl font-extrabold', highlight ? 'text-green-400' : 'text-slate-900')}>{value}</p>
      {sub && <p className={clsx('text-xs mt-1', highlight ? 'text-green-500/70' : 'text-slate-400')}>{sub}</p>}
    </div>
  )
}

function CreditBar({ unlocked }) {
  const pct = Math.min((unlocked / CREDIT_THRESHOLD) * 100, 100)
  const remaining = Math.max(CREDIT_THRESHOLD - unlocked, 0)
  return (
    <div className="mt-1">
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      {remaining > 0 && (
        <p className="text-xs text-slate-400 mt-0.5">Faltan {remaining} leads para recuperar los $100</p>
      )}
    </div>
  )
}

export default function AdminFinanzas() {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)

  async function load() {
    setLoading(true)
    const [clientsRes, leadsRes, unlocksRes] = await Promise.all([
      supabase.from('clients').select('id, company_name, status, created_at'),
      supabase.from('leads').select('id, client_id, acquisition_cost, is_locked'),
      supabase.from('lead_unlocks').select('id, client_id, amount_paid'),
    ])

    const rawClients = clientsRes.data || []
    const rawLeads   = leadsRes.data   || []
    const rawUnlocks = unlocksRes.data || []

    const computed = rawClients.map((c) => {
      const leads    = rawLeads.filter((l) => l.client_id === c.id)
      const unlocks  = rawUnlocks.filter((u) => u.client_id === c.id)

      const leads_total    = leads.length
      const leads_unlocked = leads.filter((l) => !l.is_locked).length
      const revenue_leads  = unlocks.reduce((s, u) => s + (u.amount_paid || 0), 0)
      const meta_cost      = leads.reduce((s, l) => s + (l.acquisition_cost || 0), 0)
      const activation_paid    = c.status !== 'pending'
      const revenue_activation = activation_paid ? 100 : 0
      const credit_returned    = leads_unlocked >= CREDIT_THRESHOLD

      const avg_price = leads_unlocked > 0
        ? revenue_leads / leads_unlocked
        : MIN_LEAD_PRICE

      return {
        id: c.id,
        company: c.company_name,
        status: c.status || 'pending',
        activated_at: c.created_at,
        activation_paid,
        leads_total,
        leads_unlocked,
        lead_price: Math.round(avg_price),
        revenue_leads: Math.round(revenue_leads),
        revenue_activation,
        meta_cost: Math.round(meta_cost * 100) / 100,
        credit_returned,
      }
    })

    setClients(computed)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleStatus(id) {
    const client = clients.find((c) => c.id === id)
    if (!client) return
    const next = client.status === 'active' ? 'paused' : 'active'
    setToggling(id)
    const { error } = await supabase.from('clients').update({ status: next }).eq('id', id)
    if (!error) setClients((prev) => prev.map((c) => c.id === id ? { ...c, status: next } : c))
    setToggling(null)
  }

  const totalRevenue      = clients.reduce((s, c) => s + c.revenue_leads + c.revenue_activation, 0)
  const totalMetaCost     = clients.reduce((s, c) => s + c.meta_cost, 0)
  const totalProfit       = totalRevenue - totalMetaCost
  const activeClients     = clients.filter((c) => c.status === 'active').length
  const totalUnlocked     = clients.reduce((s, c) => s + c.leads_unlocked, 0)
  const totalLeads        = clients.reduce((s, c) => s + c.leads_total, 0)
  const activationRevenue = clients.filter((c) => c.activation_paid).length * 100
  const leadRevenue       = clients.reduce((s, c) => s + c.revenue_leads, 0)
  const creditsReturned   = clients.filter((c) => c.credit_returned).length

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Finanzas del negocio</h1>
            <p className="text-slate-500 mt-1">Ingresos reales de clientes vs costos de adquisición</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* KPIs principales */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                label="Ingreso total"
                value={`$${totalRevenue.toLocaleString()}`}
                sub="Leads + activaciones"
                icon={DollarSign}
                color="bg-green-50 text-green-600"
              />
              <MetricCard
                label="Costo adquisición"
                value={`$${totalMetaCost.toLocaleString()}`}
                sub={`${totalLeads} leads capturados`}
                icon={TrendingUp}
                color="bg-red-50 text-red-500"
              />
              <MetricCard
                label="Utilidad neta"
                value={`$${totalProfit.toLocaleString()}`}
                sub={`Margen: ${totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0}%`}
                icon={TrendingUp}
                color="bg-slate-900 text-green-400"
                highlight
              />
              <MetricCard
                label="Clientes activos"
                value={activeClients}
                sub={`${totalUnlocked} leads desbloqueados`}
                icon={Users}
                color="bg-blue-50 text-blue-600"
              />
            </div>

            {/* Resumen secundario */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Activaciones cobradas</p>
                <p className="text-2xl font-bold text-slate-900">${activationRevenue.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {clients.filter((c) => c.activation_paid).length} cuentas × $100
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Ingresos por leads</p>
                <p className="text-2xl font-bold text-slate-900">${leadRevenue.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {totalUnlocked} desbloqueos reales registrados
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Award size={14} className="text-yellow-500" />
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Créditos devueltos</p>
                </div>
                <p className="text-2xl font-bold text-slate-900">${creditsReturned * 100}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {creditsReturned} cliente(s) superaron {CREDIT_THRESHOLD} desbloqueos
                </p>
              </div>
            </div>

            {/* Tabla por cliente */}
            <div className="bg-white rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Detalle por cliente</h2>
                <span className="text-xs text-slate-400">{clients.length} cuentas</span>
              </div>

              {clients.length === 0 ? (
                <div className="text-center py-16 text-slate-400">No hay clientes registrados</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {clients.map((client) => {
                    const cfg = STATUS_CONFIG[client.status] ?? STATUS_CONFIG.pending
                    const revenueTotal = client.revenue_leads + client.revenue_activation
                    const profit = revenueTotal - client.meta_cost
                    const margin = revenueTotal > 0 ? Math.round((profit / revenueTotal) * 100) : 0
                    const isExpanded = expanded === client.id
                    const costPerLead = client.leads_total > 0 ? client.meta_cost / client.leads_total : 0
                    const suggested = calcLeadPrice(client.meta_cost, client.leads_total)
                    const isUnderpriced = client.lead_price < suggested && client.leads_total > 0

                    return (
                      <div key={client.id}>
                        <div
                          className="flex items-center gap-4 p-5 hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => setExpanded(isExpanded ? null : client.id)}
                        >
                          <div className={clsx('w-2.5 h-2.5 rounded-full flex-shrink-0', cfg.dot)} />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900 text-sm">{client.company}</p>
                              {client.credit_returned && (
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                  <Award size={10} /> Crédito devuelto
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">
                              {client.leads_total} leads · {client.leads_unlocked} desbloqueados
                            </p>
                          </div>

                          <div className="hidden md:grid grid-cols-4 gap-6 text-center">
                            <div>
                              <p className="text-xs text-slate-400">Ingreso</p>
                              <p className="font-semibold text-slate-900 text-sm">${revenueTotal}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Costo</p>
                              <p className="font-semibold text-red-500 text-sm">${client.meta_cost}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Utilidad</p>
                              <p className={clsx('font-semibold text-sm', profit >= 0 ? 'text-green-600' : 'text-red-500')}>
                                ${profit}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Margen</p>
                              <p className={clsx('font-semibold text-sm', margin >= 50 ? 'text-green-600' : 'text-yellow-600')}>
                                {margin}%
                              </p>
                            </div>
                          </div>

                          <Badge color={cfg.color}>{cfg.label}</Badge>
                          <ChevronDown
                            size={16}
                            className={clsx('text-slate-400 transition-transform', isExpanded && 'rotate-180')}
                          />
                        </div>

                        {isExpanded && (
                          <div className="bg-slate-50 border-t border-slate-100 p-5">
                            <div className="grid md:grid-cols-3 gap-6">

                              {/* Actividad */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Actividad</h4>
                                {[
                                  ['Activación cobrada', client.activation_paid ? '$100 ✓' : 'Pendiente'],
                                  ['Leads totales', client.leads_total],
                                  ['Leads desbloqueados', client.leads_unlocked],
                                  ['Leads bloqueados', client.leads_total - client.leads_unlocked],
                                  ['Tasa de desbloqueo', `${client.leads_total > 0 ? Math.round((client.leads_unlocked / client.leads_total) * 100) : 0}%`],
                                  ['Costo promedio por lead', costPerLead > 0 ? `$${costPerLead.toFixed(2)}` : '—'],
                                  ['Miembro desde', new Date(client.activated_at).toLocaleDateString('es-MX', { dateStyle: 'medium' })],
                                ].map(([label, val]) => (
                                  <div key={label} className="flex justify-between text-sm">
                                    <span className="text-slate-500">{label}</span>
                                    <span className="font-medium text-slate-900">{val}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Precio y rentabilidad */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Precio y rentabilidad</h4>

                                <div className={clsx(
                                  'rounded-xl p-3 border text-sm space-y-2',
                                  isUnderpriced ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                                )}>
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Fórmula de precio</p>
                                  <div className="space-y-1 text-xs text-slate-600">
                                    <div className="flex justify-between">
                                      <span>Costo por lead</span>
                                      <span className="font-medium">{costPerLead > 0 ? `$${costPerLead.toFixed(2)}` : '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>× {PROFIT_MULTIPLIER} (ganancia 3×)</span>
                                      <span className="font-medium">{costPerLead > 0 ? `$${(costPerLead * 3).toFixed(2)}` : '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Mínimo garantizado</span>
                                      <span className="font-medium">${MIN_LEAD_PRICE}</span>
                                    </div>
                                    <div className={clsx('flex justify-between font-bold border-t pt-1', isUnderpriced ? 'text-red-600' : 'text-green-700')}>
                                      <span>Precio recomendado</span>
                                      <span>${suggested}</span>
                                    </div>
                                  </div>
                                  <div className={clsx('flex justify-between text-xs font-semibold pt-1 border-t', isUnderpriced ? 'border-red-200 text-red-500' : 'border-green-200 text-green-600')}>
                                    <span>Precio promedio cobrado</span>
                                    <span>${client.lead_price} {client.leads_total > 0 ? (isUnderpriced ? '⚠️ bajo' : '✓ ok') : '—'}</span>
                                  </div>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Ingreso leads</span>
                                    <span className="text-slate-700">${client.revenue_leads}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Activación</span>
                                    <span className="text-slate-700">${client.revenue_activation}</span>
                                  </div>
                                  <div className="flex justify-between text-red-500">
                                    <span>Costo adquisición</span>
                                    <span>-${client.meta_cost}</span>
                                  </div>
                                  <div className="border-t border-slate-100 pt-1.5 flex justify-between font-bold">
                                    <span className="text-slate-900">Utilidad neta</span>
                                    <span className={profit >= 0 ? 'text-green-600' : 'text-red-500'}>${profit}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Acciones */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Acciones</h4>

                                {!client.credit_returned ? (
                                  <div className="bg-white border border-slate-200 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Award size={14} className="text-yellow-500" />
                                      <span className="text-xs font-semibold text-slate-700">Crédito de fidelidad</span>
                                    </div>
                                    <CreditBar unlocked={client.leads_unlocked} />
                                    <p className="text-xs text-slate-400 mt-1.5">
                                      {client.leads_unlocked >= CREDIT_THRESHOLD
                                        ? '¡Listo para devolver $100!'
                                        : `${CREDIT_THRESHOLD - client.leads_unlocked} leads más para devolver $100`}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700 flex items-center gap-2">
                                    <Award size={14} />
                                    Crédito de $100 ya devuelto a este cliente
                                  </div>
                                )}

                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleStatus(client.id) }}
                                  disabled={toggling === client.id}
                                  className={clsx(
                                    'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors border disabled:opacity-50',
                                    client.status === 'active'
                                      ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                                      : 'border-green-200 text-green-600 hover:bg-green-50',
                                  )}
                                >
                                  {client.status === 'active'
                                    ? <><Pause size={14} /> Pausar cuenta</>
                                    : <><Play size={14} /> Activar cuenta</>}
                                </button>

                                <button
                                  onClick={(e) => { e.stopPropagation(); navigate(`/admin?client=${client.id}`) }}
                                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                  <Unlock size={14} /> Ver leads del cliente
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
