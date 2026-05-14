import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap, LayoutDashboard, CreditCard, HelpCircle, User, LogOut,
  Lock, Unlock, MapPin, Tag, Phone, Mail, Calendar, ChevronRight,
  Users, DollarSign, TrendingUp, Search, ArrowRight, X, Check,
  Rocket, CheckCircle2, AlertTriangle
} from 'lucide-react'
import clsx from 'clsx'

const DEMO_LEADS = [
  { id: '1', full_name: 'Carlos Mendoza', phone: '+1 305 123 4567', email: 'carlos@ejemplo.com', city: 'Miami', state: 'FL', product_interest: 'Final Expense', campaign_name: 'Camp_FE_Miami', is_unlocked: true, status: 'interested', price: 12, created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: '2', full_name: 'María López García', phone: '+1 407 987 6543', email: 'maria.lg@ejemplo.com', city: 'Orlando', state: 'FL', product_interest: 'Medicare', campaign_name: 'Camp_Medicare_FL', is_unlocked: false, status: 'new', price: 15, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: '3', full_name: 'Roberto Sánchez', phone: '+1 713 555 6666', email: 'roberto.s@ejemplo.com', city: 'Houston', state: 'TX', product_interest: 'Whole Life', campaign_name: 'Camp_WL_TX', is_unlocked: false, status: 'new', price: 12, created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: '4', full_name: 'Ana Flores Ramos', phone: '+1 305 222 3333', email: 'ana.fr@ejemplo.com', city: 'Miami', state: 'FL', product_interest: 'Anualidades', campaign_name: 'Camp_FE_Miami', is_unlocked: true, status: 'contacted', price: 18, created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: '5', full_name: 'Luis Torres Vega', phone: '+1 619 111 2222', email: 'luis.tv@ejemplo.com', city: 'San Diego', state: 'CA', product_interest: 'Final Expense', campaign_name: 'Camp_FE_CA', is_unlocked: false, status: 'new', price: 12, created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: '6', full_name: 'Patricia Herrera', phone: '+1 832 444 5555', email: 'pati.h@ejemplo.com', city: 'Houston', state: 'TX', product_interest: 'Medicare', campaign_name: 'Camp_Medicare_TX', is_unlocked: false, status: 'new', price: 15, created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
]

const STATUS_MAP = {
  new: { label: 'Nuevo', cls: 'bg-blue-500/15 text-blue-400' },
  interested: { label: 'Interesado', cls: 'bg-green-500/15 text-green-400' },
  contacted: { label: 'Contactado', cls: 'bg-purple-500/15 text-purple-400' },
  closed: { label: 'Cerrado', cls: 'bg-emerald-500/15 text-emerald-400' },
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function maskName(name) {
  const parts = name.split(' ').filter(p => p.length > 0)
  return parts.map((p, i) => i === 0 ? p[0] + '•'.repeat(p.length - 1) : p[0] + '•'.repeat(p.length - 1)).join(' ')
}

function LeadCard({ lead, onUnlock }) {
  const u = lead.is_unlocked
  const s = STATUS_MAP[lead.status] || STATUS_MAP.new
  return (
    <div className={clsx(
      'rounded-2xl border transition-all duration-200',
      u ? 'bg-[#0c1018] border-white/[0.07] hover:border-green-500/25' : 'bg-[#0c1018] border-white/[0.05] hover:border-orange-500/20',
    )}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              u ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/[0.04] border border-white/[0.07]')}>
              {u ? <Unlock size={17} className="text-green-400" /> : <Lock size={17} className="text-white/25" />}
            </div>
            <div>
              <p className={clsx('font-semibold text-sm', u ? 'text-white' : 'text-white/25')}>
                {u ? lead.full_name : maskName(lead.full_name)}
              </p>
              <p className="text-xs text-white/25 mt-0.5">{lead.campaign_name}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${s.cls}`}>{s.label}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { icon: MapPin, text: `${lead.city}, ${lead.state}` },
            { icon: Tag, text: lead.product_interest },
            { icon: Phone, text: u ? lead.phone : '+1 ••• •••••••', blur: !u },
            { icon: Mail, text: u ? lead.email : 'correo@••••.com', blur: !u, truncate: true },
          ].map(({ icon: Icon, text, blur, truncate }, i) => (
            <div key={i} className="flex items-center gap-2">
              <Icon size={13} className="text-white/20 flex-shrink-0" />
              <span className={clsx('text-xs', blur ? 'text-white/15 select-none blur-sm' : 'text-white/50', truncate && 'truncate')}>{text}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-1.5 text-xs text-white/20">
            <Calendar size={11} />
            {formatDate(lead.created_at)}
          </div>
          {u ? (
            <span className="flex items-center gap-1 text-xs text-green-400 font-semibold">
              <Check size={12} /> Desbloqueado
            </span>
          ) : (
            <button
              onClick={() => onUnlock(lead)}
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-green-500/20"
            >
              <Lock size={11} /> Desbloquear ${lead.price}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function UnlockModal({ lead, onClose, onConfirm }) {
  if (!lead) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0c1018] border border-white/[0.1] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60">
          <X size={18} />
        </button>
        <div className="w-12 h-12 bg-green-500/15 rounded-2xl flex items-center justify-center mb-4">
          <Unlock size={22} className="text-green-400" />
        </div>
        <h3 className="text-white font-bold text-lg mb-1">Desbloquear lead</h3>
        <p className="text-white/40 text-sm mb-5">
          Al desbloquear obtienes teléfono y email completos de este prospecto.
        </p>
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/50 text-sm">{lead.full_name}</span>
            <span className="text-green-400 font-bold">${lead.price}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <MapPin size={11} />{lead.city}, {lead.state}
            <Tag size={11} className="ml-2" />{lead.product_interest}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/[0.08] border border-amber-500/20 rounded-xl px-3 py-2.5 mb-5">
          <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
          <p className="text-amber-300/80 text-xs">Esto es una demo — no se realiza ningún cobro real.</p>
        </div>
        <button
          onClick={() => onConfirm(lead.id)}
          className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-500/25"
        >
          Simular desbloqueo
        </button>
      </div>
    </div>
  )
}

export default function DemoPage() {
  const [leads, setLeads] = useState(DEMO_LEADS)
  const [search, setSearch] = useState('')
  const [selectedLead, setSelectedLead] = useState(null)
  const [justUnlocked, setJustUnlocked] = useState(null)

  const filtered = leads.filter(l => {
    if (!search) return true
    const q = search.toLowerCase()
    return l.full_name.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || l.campaign_name.toLowerCase().includes(q)
  })

  const unlocked = leads.filter(l => l.is_unlocked).length
  const locked = leads.filter(l => !l.is_unlocked).length
  const spent = leads.filter(l => l.is_unlocked).reduce((s, l) => s + l.price, 0)

  function handleConfirm(id) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, is_unlocked: true } : l))
    setJustUnlocked(id)
    setSelectedLead(null)
    setTimeout(() => setJustUnlocked(null), 3000)
  }

  const navItems = [
    { label: 'Leads', icon: LayoutDashboard, active: true },
    { label: 'Facturación', icon: CreditCard, active: false },
    { label: 'Perfil', icon: User, active: false },
    { label: 'Ayuda', icon: HelpCircle, active: false },
  ]

  return (
    <div className="flex h-screen bg-[#070b10] overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-[#050810] border-r border-white/[0.06] flex flex-col h-full flex-shrink-0">
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25">
              <Zap size={14} className="text-white" />
            </div>
            <div>
              <span className="font-black text-white text-base tracking-tight block leading-tight">LeadUnlock</span>
              <span className="text-[9px] text-white/25 font-medium tracking-wide uppercase">Para agentes de seguros</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <div key={item.label} className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-default',
              item.active
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'text-white/40 border border-transparent',
            )}>
              <item.icon size={17} />
              {item.label}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="w-8 h-8 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-400 text-xs font-black">D</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-sm font-semibold truncate leading-tight">Agente Demo</p>
              <p className="text-white/25 text-xs truncate leading-tight">demo@ejemplo.com</p>
            </div>
          </div>
          <Link to="/register"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white bg-green-500 hover:bg-green-400 transition-all mt-2">
            <Zap size={14} /> Activar cuenta real
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        {/* Demo banner */}
        <div className="bg-amber-500/[0.08] border-b border-amber-500/20 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
            <p className="text-amber-300 text-xs font-medium">
              Estás viendo una demo — los leads y datos son de ejemplo. No hay cobros reales.
            </p>
          </div>
          <Link to="/register"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-green-500 hover:bg-green-400 px-4 py-1.5 rounded-lg transition-all flex-shrink-0 shadow-lg shadow-green-500/20">
            Activar mi cuenta — $100 <ArrowRight size={12} />
          </Link>
        </div>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-semibold uppercase tracking-widest">En vivo</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Dashboard de Leads</h1>
            <p className="text-white/35 mt-1 text-sm">Así se ve tu dashboard cuando tus leads empiezan a llegar</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[
              { icon: Users, label: 'Total leads', value: leads.length, sub: 'recibidos' },
              { icon: Unlock, label: 'Desbloqueados', value: unlocked, sub: `${Math.round(unlocked / leads.length * 100)}% conversión`, accent: true },
              { icon: Lock, label: 'Bloqueados', value: locked, sub: 'disponibles' },
              { icon: DollarSign, label: 'Total gastado', value: `$${spent}`, sub: 'en leads' },
            ].map(({ icon: Icon, label, value, sub, accent }) => (
              <div key={label} className={clsx(
                'rounded-2xl border p-5 transition-all',
                accent ? 'bg-green-500/[0.07] border-green-500/25' : 'bg-white/[0.03] border-white/[0.07]',
              )}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-medium text-white/40 uppercase tracking-wide">{label}</p>
                  <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center', accent ? 'bg-green-500/20' : 'bg-white/[0.05]')}>
                    <Icon size={16} className={accent ? 'text-green-400' : 'text-white/30'} />
                  </div>
                </div>
                <p className="text-2xl font-black text-white tracking-tight">{value}</p>
                {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
              </div>
            ))}
          </div>

          {/* Campaign pill */}
          <div className="mb-6">
            <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-3">Campañas activas</p>
            <div className="flex flex-wrap gap-3">
              {['Camp_FE_Miami', 'Camp_Medicare_FL'].map(name => (
                <div key={name} className="flex items-center gap-3 bg-green-500/[0.07] border border-green-500/20 rounded-2xl px-4 py-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Rocket size={14} className="text-green-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-white">{name}</p>
                      <CheckCircle2 size={12} className="text-green-400" />
                    </div>
                    <p className="text-xs text-green-400/70 font-medium">Final Expense</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="mb-5">
            <div className="relative max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                type="text"
                placeholder="Buscar por nombre, ciudad o campaña..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 transition-colors"
              />
            </div>
          </div>

          {/* Lead grid */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(lead => (
              <div key={lead.id} className={clsx(lead.id === justUnlocked && 'ring-2 ring-green-500/40 rounded-2xl')}>
                <LeadCard lead={lead} onUnlock={l => setSelectedLead(l)} />
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 bg-green-500/[0.07] border border-green-500/20 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap size={22} className="text-green-400" />
            </div>
            <h3 className="text-white font-black text-xl mb-2">¿Listo para tus leads reales?</h3>
            <p className="text-white/40 text-sm mb-6 max-w-md mx-auto">
              Activa tu cuenta por $100, creamos tu campaña personalizada y los leads empiezan a llegar solos.
            </p>
            <Link to="/register"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-black px-8 py-3.5 rounded-xl transition-all shadow-2xl shadow-green-500/30 hover:-translate-y-0.5">
              Activar mi cuenta — $100 <ArrowRight size={16} />
            </Link>
            <p className="text-white/20 text-xs mt-3">Sin mensualidades · $100 reembolsable al llegar a $1,000 en leads</p>
          </div>
        </div>
      </div>

      <UnlockModal lead={selectedLead} onClose={() => setSelectedLead(null)} onConfirm={handleConfirm} />
    </div>
  )
}
