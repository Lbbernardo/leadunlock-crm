import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, CreditCard, LogOut, Zap, Shield, DollarSign } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

const navItems = [
  { label: 'Leads', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Facturación', icon: CreditCard, href: '/dashboard/billing' },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const { profile, isAdmin, signOut } = useAuth()

  return (
    <aside className="w-64 bg-slate-950 flex flex-col h-full">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">LeadUnlock</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-green-500/10 text-green-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800',
            )}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="px-3 pt-3 pb-1">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Admin</p>
            </div>
            {[
              { label: 'Cuentas', href: '/admin', icon: Shield },
              { label: 'Finanzas', href: '/admin/finanzas', icon: DollarSign },
            ].map(item => (
              <Link
                key={item.href}
                to={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800',
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
            <span className="text-slate-300 text-xs font-semibold">
              {profile?.full_name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {profile?.full_name || profile?.email}
            </p>
            <p className="text-slate-500 text-xs truncate">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
