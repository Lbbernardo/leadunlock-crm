import { Lock, Unlock, Phone, Mail, MapPin, Tag, Calendar, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../ui/Badge'
import Button from '../ui/Button'
import clsx from 'clsx'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function maskName(name) {
  if (!name) return '•••••• ••••••'
  const parts = name.split(' ')
  return parts.map((p, i) => i === 0 ? p : p[0] + '•'.repeat(p.length - 1)).join(' ')
}

export default function LeadCard({ lead, onUnlock }) {
  const isUnlocked = !lead.is_locked || lead.is_unlocked

  return (
    <div className={clsx(
      'bg-white rounded-2xl border transition-all duration-200',
      isUnlocked
        ? 'border-slate-200 hover:border-slate-300 hover:shadow-md'
        : 'border-slate-200 hover:border-orange-200',
    )}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              isUnlocked ? 'bg-green-50' : 'bg-slate-100',
            )}>
              {isUnlocked
                ? <Unlock size={18} className="text-green-500" />
                : <Lock size={18} className="text-slate-400" />}
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {isUnlocked ? lead.full_name : maskName(lead.full_name)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{lead.source || lead.campaign_name || 'Meta Ads'}</p>
            </div>
          </div>
          <StatusBadge status={lead.status} />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={14} className="text-slate-400" />
            <span>{lead.city}{lead.state ? `, ${lead.state}` : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Tag size={14} className="text-slate-400" />
            <span className="truncate">{lead.product_interest || 'General'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone size={14} className="text-slate-400" />
            {isUnlocked && lead.phone
              ? <span>{lead.phone}</span>
              : <span className="blur-sensitive select-none">+52 55 ••••••••</span>}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail size={14} className="text-slate-400" />
            {isUnlocked && lead.email
              ? <span className="truncate">{lead.email}</span>
              : <span className="blur-sensitive select-none">correo@••••.com</span>}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar size={12} />
            {formatDate(lead.created_at)}
          </div>

          {isUnlocked ? (
            <Link
              to={`/dashboard/leads/${lead.id}`}
              className="flex items-center gap-1 text-sm text-green-600 font-medium hover:text-green-500 transition-colors"
            >
              Ver detalle <ChevronRight size={14} />
            </Link>
          ) : (
            <Button
              size="sm"
              onClick={() => onUnlock(lead)}
              className="bg-slate-900 hover:bg-slate-700 text-white text-xs px-3 py-1.5"
            >
              <Lock size={12} />
              Desbloquear $20
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
