import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Wallet, PlusCircle, Target,
  MessageSquare, BarChart3, Settings, LogOut, Zap,
} from 'lucide-react'
import { logOut } from '@/services/auth'
import { useAppStore } from '@/store'

const NAV_ITEMS = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tracker/tracker1', icon: Wallet,     label: 'Tracker 1' },
  { to: '/add-expense', icon: PlusCircle,      label: 'Add Expense' },
  { to: '/budgets',     icon: Target,          label: 'Budgets' },
  { to: '/chat',        icon: MessageSquare,   label: 'AI Chat' },
  { to: '/reports',     icon: BarChart3,       label: 'Reports' },
]

export function Sidebar() {
  const navigate  = useNavigate()
  const { user, tracker1, tracker2, getPlan, setUser } = useAppStore()
  const plan      = getPlan()

  async function handleLogout() {
    await logOut()
    setUser(null)
    navigate('/login')
  }

  return (
    <div className="w-64 h-full flex flex-col border-r border-[#2a3145] bg-[#0d1117]">

      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3 border-b border-[#2a3145]">
        <div className="w-9 h-9 rounded-xl bg-[#0A7163] flex items-center justify-center shadow-lg shadow-[#0A7163]/30 flex-shrink-0">
          <span className="text-base font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>T</span>
        </div>
        <div>
          <div className="text-sm font-bold text-[#f0f4ff]" style={{ fontFamily: 'Syne, sans-serif' }}>Tajiri</div>
          <div className="text-[10px] text-[#4a5568]">Smart Money</div>
        </div>
      </div>

      {/* Tracker switcher */}
      <div className="px-4 py-4 border-b border-[#2a3145] space-y-1.5">
        <p className="text-[10px] font-semibold text-[#4a5568] uppercase tracking-widest px-2 mb-2">Trackers</p>

        <TrackerButton
          slot="tracker1"
          name={tracker1?.name ?? 'Tracker 1'}
          color={tracker1?.color ?? '#0A7163'}
          active={!!tracker1}
        />

        {plan === 'business' ? (
          <TrackerButton
            slot="tracker2"
            name={tracker2?.name ?? 'Tracker 2'}
            color={tracker2?.color ?? '#3B82F6'}
            active={!!tracker2}
          />
        ) : (
          <button
            onClick={() => navigate('/upgrade')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-dashed border-[#2a3145] hover:border-[#F59E0B]/40 hover:bg-[#F59E0B]/5 transition-all duration-200 group"
          >
            <div className="w-6 h-6 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
              <Zap size={12} className="text-[#F59E0B]" />
            </div>
            <span className="text-xs text-[#4a5568] group-hover:text-[#F59E0B] transition-colors">Unlock Tracker 2</span>
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200
              ${isActive
                ? 'bg-[#0A7163]/15 text-[#0D9B87] border border-[#0A7163]/20'
                : 'text-[#8892aa] hover:text-[#f0f4ff] hover:bg-[#1e2535]'}
            `}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 border-t border-[#2a3145] space-y-0.5">
        {/* Upgrade banner (free plan) */}
        {plan === 'free' && (
          <button
            onClick={() => navigate('/upgrade')}
            className="w-full mb-3 rounded-xl bg-gradient-to-r from-[#F59E0B]/10 to-[#F59E0B]/5 border border-[#F59E0B]/20 px-3 py-3 text-left hover:border-[#F59E0B]/40 transition-all duration-200 group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap size={13} className="text-[#F59E0B]" />
              <span className="text-xs font-semibold text-[#F59E0B]">Upgrade to Business</span>
            </div>
            <p className="text-[10px] text-[#4a5568]">Unlock AI features, 2 trackers & more</p>
          </button>
        )}

        <NavLink
          to="/settings"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            transition-all duration-200
            ${isActive ? 'bg-[#0A7163]/15 text-[#0D9B87]' : 'text-[#8892aa] hover:text-[#f0f4ff] hover:bg-[#1e2535]'}
          `}
        >
          <Settings size={17} />
          Settings
        </NavLink>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <div className="w-8 h-8 rounded-full bg-[#0A7163]/20 border border-[#0A7163]/30 flex items-center justify-center flex-shrink-0">
            {user?.photoURL
              ? <img src={user.photoURL} className="w-8 h-8 rounded-full object-cover" alt="" />
              : <span className="text-xs font-bold text-[#0D9B87]">
                  {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
                </span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-[#f0f4ff] truncate">{user?.displayName}</div>
            <div className="text-[10px] text-[#4a5568] capitalize">{plan} plan</div>
          </div>
          <button
            onClick={handleLogout}
            className="text-[#4a5568] hover:text-[#EF4444] transition-colors p-1 rounded-lg hover:bg-[#EF4444]/10"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

function TrackerButton({ slot, name, color, active }: {
  slot: string; name: string; color: string; active: boolean
}) {
  const navigate = useNavigate()
  const { activeTrackerSlot, setActiveTrackerSlot } = useAppStore()
  const isActive = activeTrackerSlot === slot

  return (
    <button
      onClick={() => {
        if (active) {
          setActiveTrackerSlot(slot as any)
          navigate(`/tracker/${slot}`)
        }
      }}
      className={`
        w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left
        transition-all duration-200
        ${isActive
          ? 'bg-[#1e2535] border border-[#2a3145]'
          : 'hover:bg-[#1a1f2e]'}
        ${!active ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div
        className="w-6 h-6 rounded-lg flex-shrink-0"
        style={{ background: `${color}25`, border: `1.5px solid ${color}50` }}
      >
        <div className="w-full h-full rounded-lg flex items-center justify-center">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        </div>
      </div>
      <span className="text-xs font-medium text-[#f0f4ff] truncate">{name}</span>
      {isActive && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0A7163]" />
      )}
    </button>
  )
}
