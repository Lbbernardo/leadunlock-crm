import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { DollarSign, Users, Unlock, Pause, Play, Award, ChevronDown, RefreshCw, Wallet } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Badge } from '../../components/ui/Badge'
import { supabase } from '../../lib/supabase'
import clsx from 'clsx'

const CREDIT_THRESHOLD = 50

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
        <p className="text-xs text-slate-400 mt-0.5">Faltan {remaining} leads para devolver los $100</p>
      )}
    </div>
  )
}

export default function AdminFinanzas() {
  const navigate = useNavigate()
  const { user: adminUser } = useAuth()
  const [clients, setClients] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)

  async function load() {
    setLoading(true)
    const [clientsRes, leadsRes, unlocksRes, adminRes] = await Promise.all([
      supabase.from('clients').select('id, company_name, status, balance, lead_price, created_at, user_id'),
      supabase.from('leads').select('id, client_id, is_locked'),
      supabase.from('lead_unlocks').select('id, client_id, amount_paid'),
      supabase.from('users').select('id').eq('role', 'admin'),
    ])

    const adminIds = new Set((adminRes.data || []).map(u => u.id))
    if (adminUser?.id) adminIds.add(adminUser.id)
    const rawClients = (clientsRes.data || []).filter(c => !adminIds.has(c.user_id))
    const rawLeads   = leadsRes.data   || []
    const rawUnlocks = unlocksRes.data || []

    const computed = rawClients.map((c) => {
      const leads    = rawLeads.filter((l) => l.client_id === c.id)
      const unlocks  = rawUnlocks.filter((u) => u.client_id === c.id)

      const leads_total    = leads.length
      const leads_unlocked = unlocks.length
      const revenue_leads  = unlocks.reduce((s, u) => s + (u.amount_paid || 0), 0)

      return {
        id: c.id,
        company: c.company_name,
        status: c.status || 'pending',
        activated_at: c.created_at,
        balance: c.balance || 0,
        lead_price: c.lead_price || 20,
        leads_total,
        leads_unlocked,
        revenue_leads: Math.round(revenue_leads),
        credit_returned: leads_unlocked >= CREDIT_THRESHOLD,
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

  const leadRevenue      = clients.reduce((s, c) => s + c.revenue_leads, 0)
  const totalBalance     = clients.reduce((s, c) => s + c.balance, 0)
  const activeClients    = clients.filter((c) => c.status === 'active').length
  const totalUnlocked      = clients.reduce((s, c) => s + c.leads_unlocked, 0)
  const totalLeads         = clients.reduce((s, c) => s + c.leads_total, 0)
  const creditsReturned    = clients.filter((c) => c.credit_returned).length
  const activatedClients   = clients.filter((c) => c.status !== 'pending').length
  const activationRevenue  = activatedClients * 100
  const totalRevenue       = leadRevenue + activationRevenue

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Finanzas del negocio</h1>
            <p className="text-slate-500 mt-1">Datos reales de clientes y desbloqueos</p>
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
            {/* KPIs — solo datos reales de Supabase */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <MetricCard
                label="Ingreso total"
                value={`$${totalRevenue.toLocaleString()}`}
                sub="Activaciones + leads"
                icon={DollarSign}
                color="bg-green-50 text-green-600"
                highlight
              />
              <MetricCard
                label="Activaciones cobradas"
                value={`$${activationRevenue.toLocaleString()}`}
                sub={`${activatedClients} cuenta(s) × $100`}
                icon={DollarSign}
                color="bg-emerald-50 text-emerald-600"
              />
              <MetricCard
                label="Crédito en cuentas"
                value={`$${totalBalance.toLocaleString()}`}
                sub="Saldo total de todos los clientes"
                icon={Wallet}
                color="bg-blue-50 text-blue-600"
              />
              <MetricCard
                label="Clientes activos"
                value={activeClients}
                sub={`de ${clients.length} cuentas totales`}
                icon={Users}
                color="bg-slate-100 text-slate-600"
              />
              <MetricCard
                label="Leads capturados"
                value={totalLeads}
                sub={`${totalUnlocked} desbloqueados`}
                icon={Unlock}
                color="bg-emerald-50 text-emerald-600"
              />
            </div>

            {/* Resumen secundario */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Ingresos por leads</p>
                <p className="text-2xl font-bold text-slate-900">${leadRevenue.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">Suma real de lead_unlocks</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Crédito disponible total</p>
                <p className="text-2xl font-bold text-slate-900">${totalBalance.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Saldo acumulado de {clients.length} cuenta(s)
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Award size={14} className="text-yellow-500" />
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Créditos devueltos</p>
                </div>
                <p className="text-2xl font-bold text-slate-900">${creditsReturned * 100}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {creditsReturned} cliente(s) con {CREDIT_THRESHOLD}+ desbloqueos
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
                    const isExpanded = expanded === client.id
                    const unlockRate = client.leads_total > 0
                      ? Math.round((client.leads_unlocked / client.leads_total) * 100)
                      : 0

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
                              {client.leads_total} leads · {client.leads_unlocked} desbloqueados · ${client.lead_price}/lead
                            </p>
                          </div>

                          <div className="hidden md:grid grid-cols-3 gap-6 text-center">
                            <div>
                              <p className="text-xs text-slate-400">Ingresos leads</p>
                              <p className="font-semibold text-green-600 text-sm">${client.revenue_leads}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Saldo</p>
                              <p className="font-semibold text-blue-600 text-sm">${client.balance.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Desbloqueo</p>
                              <p className={clsx('font-semibold text-sm', unlockRate >= 50 ? 'text-green-600' : 'text-slate-500')}>
                                {unlockRate}%
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
                                  ['Leads capturados', client.leads_total],
                                  ['Leads desbloqueados', client.leads_unlocked],
                                  ['Leads bloqueados', client.leads_total - client.leads_unlocked],
                                  ['Tasa de desbloqueo', `${unlockRate}%`],
                                  ['Precio por lead', `$${client.lead_price}`],
                                  ['Miembro desde', new Date(client.activated_at).toLocaleDateString('es-MX', { dateStyle: 'medium' })],
                                ].map(([label, val]) => (
                                  <div key={label} className="flex justify-between text-sm">
                                    <span className="text-slate-500">{label}</span>
                                    <span className="font-medium text-slate-900">{val}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Finanzas */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Finanzas de cuenta</h4>
                                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Ingresos por leads</span>
                                    <span className="font-semibold text-green-600">${client.revenue_leads}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Precio por lead</span>
                                    <span className="font-semibold text-slate-900">${client.lead_price}</span>
                                  </div>
                                  <div className="border-t border-slate-100 pt-2 flex justify-between">
                                    <span className="text-slate-500">Saldo disponible</span>
                                    <span className="font-bold text-blue-600">${client.balance.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-xs text-slate-400">
                                    <span>Leads que puede desbloquear</span>
                                    <span>{Math.floor(client.balance / client.lead_price)}</span>
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
                                        : `${CREDIT_THRESHOLD - client.leads_unlocked} leads más`}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700 flex items-center gap-2">
                                    <Award size={14} />
                                    Crédito de $100 ya devuelto
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
