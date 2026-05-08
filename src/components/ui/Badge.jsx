import clsx from 'clsx'

const statusConfig = {
  new: { label: 'Nuevo', className: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'Contactado', className: 'bg-yellow-100 text-yellow-700' },
  interested: { label: 'Interesado', className: 'bg-green-100 text-green-700' },
  closed: { label: 'Cerrado', className: 'bg-slate-100 text-slate-600' },
  not_interested: { label: 'No interesado', className: 'bg-red-100 text-red-600' },
}

export function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.new
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.className)}>
      {config.label}
    </span>
  )
}

export function Badge({ children, color = 'slate', className }) {
  const colors = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-700',
  }
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colors[color], className)}>
      {children}
    </span>
  )
}

export const statusOptions = Object.entries(statusConfig).map(([value, { label }]) => ({ value, label }))
