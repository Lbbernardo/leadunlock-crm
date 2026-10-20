import { Lock, Unlock, Phone, Mail, MapPin, Tag, Calendar, ChevronRight, Clock, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../ui/Badge'
import Button from '../ui/Button'
import clsx from 'clsx'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function timeAgo(dateStr) {
  const mins = Math.floor((Date.now() - new Date(dateStr)) / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `hace ${days} día${days === 1 ? '' : 's'}`
}

function maskName(name) {
  if (!name) return '•••••• ••••••'
  const parts = name.split(' ').filter(p => p.length > 0)
  return parts.map((p, i) => i === 0 ? p : p[0] + '•'.repeat(Math.max(0, p.length - 1))).join(' ')
}

export default function LeadCard({ lead, onUnlock }) {
  const isUnlocked = lead.is_unlocked
  const discounted = !isUnlocked && Date.now() - new Date(lead.created_at) > 86400000

  return (
    <div className={clsx(
      'rounded-2xl border transition-all duration-200',
      isUnlocked
        ? 'bg-[#0c1018] border-white/[0.07] hover:border-green-500/25 hover:bg-white/[0.05]'
        : 'bg-[#0c1018] border-white/[0.05] hover:border-orange-500/20',
    )}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              isUnlocked ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/[0.04] border border-white/[0.07]',
            )}>
              {isUnlocked
                ? <Unlock size={17} className="text-green-400" />
                : <Lock size={17} className="text-white/25" />}
            </div>
            <div>
              <p className={clsx('font-semibold text-sm', isUnlocked ? 'text-white' : 'text-white/25')}>
                {isUnlocked ? lead.full_name : maskName(lead.full_name)}
              </p>
              <p className="text-xs text-white/25 mt-0.5">{lead.category || lead.source || 'Meta Ads'}</p>
            </div>
          </div>
          {isUnlocked ? (
            <StatusBadge status={lead.status} />
          ) : discounted ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              <TrendingDown size={11} /> Rebajado
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-green-300 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
              <Clock size={11} /> {timeAgo(lead.created_at)}
            </span>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { icon: MapPin, text: [lead.city, lead.state].filter(Boolean).join(', ') || '—' },
            { icon: Tag, text: lead.product_interest || lead.category || 'General' },
            {
              icon: Phone,
              text: isUnlocked && lead.phone ? lead.phone : '+1 ••• •••••••',
              blur: !isUnlocked,
            },
            {
              icon: Mail,
              text: isUnlocked && lead.email ? lead.email : 'correo@••••.com',
              blur: !isUnlocked,
              truncate: true,
            },
          ].map(({ icon: Icon, text, blur, truncate }, i) => (
            <div key={i} className="flex items-center gap-2">
              <Icon size={13} className="text-white/20 flex-shrink-0" />
              <span className={clsx(
                'text-xs',
                blur ? 'text-white/15 select-none blur-sm' : 'text-white/50',
                truncate && 'truncate',
              )}>
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-1.5 text-xs text-white/20">
            <Calendar size={11} />
            {isUnlocked ? formatDate(lead.claimed_at || lead.created_at) : timeAgo(lead.created_at)}
          </div>

          {isUnlocked ? (
            <Link
              to={`/dashboard/leads/${lead.id}`}
              className="flex items-center gap-1 text-xs text-green-400 font-semibold hover:text-green-300 transition-colors"
            >
              Ver detalle <ChevronRight size={13} />
            </Link>
          ) : (
            <button
              onClick={() => onUnlock(lead)}
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-green-500/20"
            >
              <Lock size={11} />
              Desbloquear ${lead.price ?? '—'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
