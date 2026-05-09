import { useState } from 'react'
import { DollarSign, TrendingUp, Users, Unlock, Pause, Play, MoreVertical, ChevronDown, Award } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Badge } from '../../components/ui/Badge'
import clsx from 'clsx'

// Mock financiero — reemplazar con datos reales de Supabase
// Precio mínimo garantizado y multiplicador de ganancia
const MIN_LEAD_PRICE = 12
const PROFIT_MULTIPLIER = 3

function calcLeadPrice(metaCostTotal, leadsTotal) {
  if (!leadsTotal) return MIN_LEAD_PRICE
  const costPerLead = metaCostTotal / leadsTotal
  return Math.max(MIN_LEAD_PRICE, Math.ceil(costPerLead * PROFIT_MULTIPLIER))
}

const MOCK_CLIENTS = [
  {
    id: 'c1',
    company: 'García Insurance',
    industry: 'Productos financieros',
    city: 'Miami',
    status: 'active',
    activated_at: '2024-01-15',
    activation_paid: true,
    leads_total: 24,
    leads_unlocked: 8,
    lead_price: 20,
    revenue_leads: 160,
    revenue_activation: 100,
    meta_cost: 42,
    credit_returned: false,
  },
  {
    id: 'c2',
    company: 'López Benefits',
    industry: 'Gastos finales',
    city: 'Orlando',
    status: 'active',
    activated_at: '2024-02-01',
    activation_paid: true,
    leads_total: 15,
    leads_unlocked: 5,
    lead_price: 20,
    revenue_leads: 100,
    revenue_activation: 100,
    meta_cost: 27,
    credit_returned: false,
  },
  {
    id: 'c3',
    company: 'Miami Financial',
    industry: 'Productos financieros',
    city: 'Miami',
    status: 'active',
    activated_at: '2024-02-20',
    activation_paid: true,
    leads_total: 62,
    leads_unlocked: 51,
    lead_price: 20,
    revenue_leads: 1020,
    revenue_activation: 100,
    meta_cost: 289,
    credit_returned: true,
  },
  {
    id: 'c4',
    company: 'Tampa Insurance Group',
    industry: 'Gastos finales',
    city: 'Tampa',
    status: 'paused',
    activated_at: '2024-03-05',
    activation_paid: true,
    leads_total: 8,
    leads_unlocked: 2,
    lead_price: 20,
    revenue_leads: 40,
    revenue_activation: 100,
    meta_cost: 18,
    credit_returned: false,
  },
  {
    id: 'c5',
    company: 'Sunshine Benefits',
    industry: 'Productos financieros',
    city: 'Hialeah',
    status: 'pending',
    activated_at: '2024-04-10',
    activation_paid: false,
    leads_total: 0,
    leads_unlocked: 0,
    lead_price: 20,
    revenue_leads: 0,
    revenue_activation: 0,
    meta_cost: 0,
    credit_returned: false,
  },
]

const STATUS_CONFIG = {
  active: { label: 'Activo', color: 'green', dot: 'bg-green-500' },
  paused: { label: 'Pausado', color: 'yellow', dot: 'bg-yellow-500' },
  pending: { label: 'Pendiente', color: 'slate', dot: 'bg-slate-500' },
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

function CreditBar({ unlocked, threshold = 50 }) {
  const pct = Math.min((unlocked / threshold) * 100, 100)
  const remaining = Math.max(threshold - unlocked, 0)
  return (
    <div className="mt-1">
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      {remaining > 0 && (
        <p className="text-xs text-slate-400 mt-0.5">
          Le faltan {remaining} leads para recuperar los $100
        </p>
      )}
    </div>
  )
}

export default function AdminFinanzas() {
  const [clients, setClients] = useState(MOCK_CLIENTS)
  const [expanded, setExpanded] = useState(null)
  const [costInput, setCostInput] = useState({})

  const totalRevenue = clients.reduce((s, c) => s + c.revenue_leads + c.revenue_activation, 0)
  const totalMetaCost = clients.reduce((s, c) => s + c.meta_cost, 0)
  const totalProfit = totalRevenue - totalMetaCost
  const activeClients = clients.filter(c => c.status === 'active').length
  const totalLeadsUnlocked = clients.reduce((s, c) => s + c.leads_unlocked, 0)
  const creditsReturned = clients.filter(c => c.credit_returned).length * 100

  function toggleStatus(id) {
    setClients(prev => prev.map(c => {
      if (c.id !== id) return c
      const next = c.status === 'active' ? 'paused' : 'active'
      return { ...c, status: next }
    }))
  }

  function updateMetaCost(id, val) {
    setClients(prev => prev.map(c => c.id === id ? { ...c, meta_cost: Number(val) || 0 } : c))
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Finanzas del negocio</h1>
          <p className="text-slate-500 mt-1">Tu rentabilidad real: ingresos de clientes vs costos de Meta Ads</p>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Ingreso total"
            value={`$${totalRevenue.toLocaleString()}`}
            sub={`Leads + activaciones`}
            icon={DollarSign}
            color="bg-green-50 text-green-600"
          />
          <MetricCard
            label="Costo Meta Ads"
            value={`$${totalMetaCost.toLocaleString()}`}
            sub="Lo que pagaste en campañas"
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
            sub={`${totalLeadsUnlocked} leads desbloqueados`}
            icon={Users}
            color="bg-blue-50 text-blue-600"
          />
        </div>

        {/* Tarjetas de resumen secundarias */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Activaciones cobradas</p>
            <p className="text-2xl font-bold text-slate-900">
              ${clients.filter(c => c.activation_paid).length * 100}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {clients.filter(c => c.activation_paid).length} cuentas × $100
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Ingresos por leads</p>
            <p className="text-2xl font-bold text-slate-900">
              ${clients.reduce((s, c) => s + c.revenue_leads, 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">{totalLeadsUnlocked} leads × $20</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Award size={14} className="text-yellow-500" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Créditos devueltos</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">${creditsReturned}</p>
            <p className="text-xs text-slate-400 mt-1">
              {creditsReturned / 100} cliente(s) superaron $1,000 en leads
            </p>
          </div>
        </div>

        {/* Tabla de clientes */}
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Detalle por cliente</h2>
            <span className="text-xs text-slate-400">{clients.length} cuentas</span>
          </div>

          <div className="divide-y divide-slate-100">
            {clients.map((client) => {
              const cfg = STATUS_CONFIG[client.status]
              const revenueTotal = client.revenue_leads + client.revenue_activation
              const profit = revenueTotal - client.meta_cost
              const margin = revenueTotal > 0 ? Math.round((profit / revenueTotal) * 100) : 0
              const isExpanded = expanded === client.id
              const leadsToCredit = Math.max(50 - client.leads_unlocked, 0)

              return (
                <div key={client.id}>
                  <div
                    className="flex items-center gap-4 p-5 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : client.id)}
                  >
                    {/* Status dot */}
                    <div className={clsx('w-2.5 h-2.5 rounded-full flex-shrink-0', cfg.dot)} />

                    {/* Company */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 text-sm">{client.company}</p>
                        {client.credit_returned && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <Award size={10} /> Crédito devuelto
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{client.industry} · {client.city}</p>
                    </div>

                    {/* Metrics */}
                    <div className="hidden md:grid grid-cols-4 gap-6 text-center">
                      <div>
                        <p className="text-xs text-slate-400">Ingreso</p>
                        <p className="font-semibold text-slate-900 text-sm">${revenueTotal}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Costo Meta</p>
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

                    {/* Status badge */}
                    <Badge color={cfg.color}>{cfg.label}</Badge>

                    <ChevronDown
                      size={16}
                      className={clsx('text-slate-400 transition-transform', isExpanded && 'rotate-180')}
                    />
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-t border-slate-100 p-5">
                      <div className="grid md:grid-cols-3 gap-6">

                        {/* Stats */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Actividad</h4>
                          {[
                            ['Activación cobrada', client.activation_paid ? '$100 ✓' : 'Pendiente'],
                            ['Leads totales recibidos', client.leads_total],
                            ['Leads desbloqueados', client.leads_unlocked],
                            ['Leads bloqueados', client.leads_total - client.leads_unlocked],
                            ['Tasa de desbloqueo', `${client.leads_total > 0 ? Math.round((client.leads_unlocked / client.leads_total) * 100) : 0}%`],
                            ['Miembro desde', new Date(client.activated_at).toLocaleDateString('es-MX', { dateStyle: 'medium' })],
                          ].map(([label, val]) => (
                            <div key={label} className="flex justify-between text-sm">
                              <span className="text-slate-500">{label}</span>
                              <span className="font-medium text-slate-900">{val}</span>
                            </div>
                          ))}
                        </div>

                        {/* Precio + Rentabilidad */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Precio y rentabilidad</h4>

                          {/* Calculadora de precio */}
                          {(() => {
                            const costPerLead = client.leads_total > 0 ? (client.meta_cost / client.leads_total) : 0
                            const suggested = calcLeadPrice(client.meta_cost, client.leads_total)
                            const isUnderpriced = client.lead_price < suggested
                            return (
                              <div className={clsx(
                                'rounded-xl p-3 border text-sm space-y-2',
                                isUnderpriced ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                              )}>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Fórmula de precio</p>
                                <div className="space-y-1 text-xs text-slate-600">
                                  <div className="flex justify-between">
                                    <span>Costo Meta por lead</span>
                                    <span className="font-medium">${costPerLead > 0 ? costPerLead.toFixed(2) : '—'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>× {PROFIT_MULTIPLIER} (ganancia 3×)</span>
                                    <span className="font-medium">${costPerLead > 0 ? (costPerLead * 3).toFixed(2) : '—'}</span>
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
                                  <span>Precio actual cobrado</span>
                                  <span>${client.lead_price} {isUnderpriced ? '⚠️ bajo' : '✓ ok'}</span>
                                </div>
                              </div>
                            )
                          })()}

                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Costo Meta Ads total (editable)</label>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 text-sm">$</span>
                              <input
                                type="number"
                                value={costInput[client.id] ?? client.meta_cost}
                                onChange={e => setCostInput(prev => ({ ...prev, [client.id]: e.target.value }))}
                                onBlur={e => updateMetaCost(client.id, e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
                              />
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
                              <span>Costo Meta</span>
                              <span>-${client.meta_cost}</span>
                            </div>
                            <div className="border-t border-slate-100 pt-1.5 flex justify-between font-bold">
                              <span className="text-slate-900">Utilidad neta</span>
                              <span className={profit >= 0 ? 'text-green-600' : 'text-red-500'}>${profit}</span>
                            </div>
                          </div>
                        </div>

                        {/* Acciones + crédito */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Acciones</h4>

                          {/* Crédito de $100 */}
                          {!client.credit_returned ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Award size={14} className="text-yellow-500" />
                                <span className="text-xs font-semibold text-slate-700">Crédito de fidelidad</span>
                              </div>
                              <CreditBar unlocked={client.leads_unlocked} threshold={50} />
                              <p className="text-xs text-slate-400 mt-1.5">
                                {client.leads_unlocked >= 50
                                  ? '¡Listo para devolver $100!'
                                  : `${50 - client.leads_unlocked} leads más para devolver $100`}
                              </p>
                            </div>
                          ) : (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700 flex items-center gap-2">
                              <Award size={14} />
                              Crédito de $100 ya devuelto a este cliente
                            </div>
                          )}

                          {/* Botones */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleStatus(client.id) }}
                            className={clsx(
                              'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors border',
                              client.status === 'active'
                                ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                                : 'border-green-200 text-green-600 hover:bg-green-50',
                            )}
                          >
                            {client.status === 'active'
                              ? <><Pause size={14} /> Pausar cuenta</>
                              : <><Play size={14} /> Activar cuenta</>}
                          </button>

                          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
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
        </div>
      </div>
    </DashboardLayout>
  )
}
