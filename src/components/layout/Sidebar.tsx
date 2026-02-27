import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, Target, MessageSquare, BarChart3, Settings, LogOut, X, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store'
import { logOut } from '@/services/auth'

const NAV = [
  { label: 'Dashboard',    icon: LayoutDashboard, to: '/' },
  { label: 'Add Expense',  icon: PlusCircle,      to: '/add-expense' },
  { label: 'Budgets',      icon: Target,           to: '/budgets' },
  { label: 'AI Chat',      icon: MessageSquare,    to: '/chat' },
  { label: 'Reports',      icon: BarChart3,        to: '/reports' },
  { label: 'Settings',     icon: Settings,         to: '/settings' },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, tracker1, tracker2, setUser } = useAppStore()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await logOut()
    setUser(null)
    navigate('/login')
  }

  function go(to: string) {
    navigate(to)
    onClose?.()
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-50 w-64 bg-[#0d1117] border-r border-[#2a3145] flex flex-col
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex
      `}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#2a3145]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0A7163] flex items-center justify-center shadow-lg shadow-[#0A7163]/30">
              <span className="text-sm font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>T</span>
            </div>
            <span className="text-base font-bold text-[#f0f4ff]" style={{ fontFamily: 'Syne, sans-serif' }}>Tajiri</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-[#4a5568] hover:text-[#f0f4ff] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-b border-[#2a3145]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0A7163]/20 border border-[#0A7163]/30 flex items-center justify-center flex-shrink-0">
              {user?.photoURL
                ? <img src={user.photoURL} className="w-9 h-9 rounded-xl object-cover" alt="" />
                : <span className="text-sm font-bold text-[#0D9B87]">{user?.displayName?.[0]?.toUpperCase() ?? 'U'}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#f0f4ff] truncate">{user?.displayName}</p>
              <p className="text-[10px] text-[#4a5568] truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ label, icon: Icon, to }) => {
            const active = location.pathname === to
            return (
              <button key={to} onClick={() => go(to)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-[#0A7163]/15 text-[#0D9B87] border border-[#0A7163]/20'
                    : 'text-[#4a5568] hover:text-[#f0f4ff] hover:bg-[#1e2535]'
                }`}>
                <Icon size={16} className={active ? 'text-[#0D9B87]' : ''} />
                {label}
              </button>
            )
          })}

          {/* Trackers section */}
          {(tracker1 || tracker2) && (
            <div className="pt-4">
              <p className="text-[10px] font-semibold text-[#2a3145] uppercase tracking-widest px-3 mb-2">Trackers</p>
              <div className="space-y-0.5">
                {tracker1 && (
                  <button onClick={() => go('/tracker/tracker1')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#1e2535] transition-all group">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: tracker1.color }} />
                    <span className="text-sm text-[#8892aa] group-hover:text-[#f0f4ff] truncate flex-1 text-left">{tracker1.name}</span>
                    <ChevronRight size={12} className="text-[#2a3145] group-hover:text-[#4a5568]" />
                  </button>
                )}
                {tracker2 && (
                  <button onClick={() => go('/tracker/tracker2')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#1e2535] transition-all group">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: tracker2.color }} />
                    <span className="text-sm text-[#8892aa] group-hover:text-[#f0f4ff] truncate flex-1 text-left">{tracker2.name}</span>
                    <ChevronRight size={12} className="text-[#2a3145] group-hover:text-[#4a5568]" />
                  </button>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-[#2a3145]">
          <button onClick={handleLogout} disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#4a5568] hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-all duration-150 disabled:opacity-50">
            <LogOut size={16} />
            {loggingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      </aside>
    </>
  )
}
