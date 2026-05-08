import { Search } from 'lucide-react'
import { statusOptions } from '../ui/Badge'

export default function LeadFilters({ filters, onChange }) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-52">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, ciudad o campaña..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
        />
      </div>

      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 text-slate-700"
      >
        <option value="">Todos los estados</option>
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <select
        value={filters.locked}
        onChange={(e) => onChange({ ...filters, locked: e.target.value })}
        className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 text-slate-700"
      >
        <option value="">Bloqueados y desbloqueados</option>
        <option value="locked">Solo bloqueados</option>
        <option value="unlocked">Solo desbloqueados</option>
      </select>
    </div>
  )
}
