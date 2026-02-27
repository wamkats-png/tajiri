import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, PlusCircle,
  MessageSquare, BarChart3, Settings,
} from 'lucide-react'
import { useAppStore } from '@/store'

const NAV_ITEMS = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Home' },
  { to: '/budgets',     icon: BarChart3,        label: 'Budgets' },
  { to: '/add-expense', icon: PlusCircle,       label: 'Add',    isCenter: true },
  { to: '/chat',        icon: MessageSquare,    label: 'AI Chat' },
  { to: '/settings',    icon: Settings,         label: 'Settings' },
]

export function BottomNav() {
  const navigate = useNavigate()

  return (
    <div
      className="flex items-center justify-around px-2 py-2 border-t border-[#2a3145]"
      style={{
        background: 'rgba(13,17,23,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {NAV_ITEMS.map(({ to, icon: Icon, label, isCenter }) =>
        isCenter ? (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="flex flex-col items-center justify-center -mt-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#0A7163] flex items-center justify-center shadow-lg shadow-[#0A7163]/40 active:scale-95 transition-transform">
              <Icon size={24} className="text-white" strokeWidth={2} />
            </div>
            <span className="text-[9px] text-[#4a5568] mt-1">{label}</span>
          </button>
        ) : (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl
              transition-all duration-200 min-w-[52px]
              ${isActive ? 'text-[#0D9B87]' : 'text-[#4a5568]'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`
                  p-1.5 rounded-xl transition-all duration-200
                  ${isActive ? 'bg-[#0A7163]/15' : ''}
                `}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[9px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        )
      )}
    </div>
  )
}
