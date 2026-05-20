import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, CreditCard, LogOut, Shield, DollarSign, HelpCircle, User, BookOpen, Zap, X, BookOpenCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

const clientNavItems = [
  { label: 'Leads', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Cómo funciona', icon: BookOpenCheck, href: '/dashboard/how-it-works' },
  { label: 'Facturación', icon: CreditCard, href: '/dashboard/billing' },
  { label: 'Perfil', icon: User, href: '/dashboard/profile' },
  { label: 'Ayuda', icon: HelpCircle, href: '/dashboard/help' },
]

const adminNavItems = [
  { label: 'Perfil', icon: User, href: '/dashboard/profile' },
]

export default function Sidebar({ onClose }) {
  const { pathname } = useLocation()
  const { profile, isAdmin, signOut } = useAuth()
  const navItems = isAdmin ? adminNavItems : clientNavItems

  return (
    <aside className="w-64 bg-[#050810] border-r border-white/[0.06] flex flex-col h-full flex-shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25">
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <span className="font-black text-white text-base tracking-tight block leading-tight">LeadUnlock</span>
            <span className="text-[9px] text-white/25 font-medium tracking-wide uppercase">Para agentes de seguros</span>
          </div>
        </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-white/30 hover:text-white p-1 rounded-lg">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={onClose}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              pathname === item.href
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05] border border-transparent',
            )}
          >
            <item.icon size={17} />
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="px-3 pt-5 pb-2">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Admin</p>
            </div>
            {[
              { label: 'Cuentas', href: '/admin', icon: Shield },
              { label: 'Finanzas', href: '/admin/finanzas', icon: DollarSign },
              { label: 'Manual', href: '/admin/manual', icon: BookOpen },
            ].map(item => (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  pathname === item.href
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05] border border-transparent',
                )}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div className="w-8 h-8 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-green-400 text-xs font-black">
              {profile?.full_name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-sm font-semibold truncate leading-tight">
              {profile?.full_name || profile?.email}
            </p>
            <p className="text-white/25 text-xs truncate leading-tight">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
