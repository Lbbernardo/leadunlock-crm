import { Search } from 'lucide-react'
import { statusOptions } from '../ui/Badge'

export default function LeadFilters({ filters, onChange }) {
  const selectCls = 'px-3 py-2.5 text-sm bg-white/[0.05] border border-white/[0.08] text-white/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 transition-colors'
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-52">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
        <input
          type="text"
          placeholder="Buscar por nombre, ciudad o campaña..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 transition-colors"
        />
      </div>

      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className={selectCls}
      >
        <option value="">Todos los estados</option>
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <select
        value={filters.locked}
        onChange={(e) => onChange({ ...filters, locked: e.target.value })}
        className={selectCls}
      >
        <option value="">Bloqueados y desbloqueados</option>
        <option value="locked">Solo bloqueados</option>
        <option value="unlocked">Solo desbloqueados</option>
      </select>
    </div>
  )
}
