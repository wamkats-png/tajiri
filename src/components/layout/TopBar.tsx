import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAppStore } from '@/store'
import { AlertsBell } from '@/components/ui/AlertsBell'

interface TopBarProps {
  title?: string
  showBack?: boolean
  actions?: ReactNode
}

export function TopBar({ title, showBack, actions }: TopBarProps) {
  const navigate = useNavigate()
  const { user, tracker1, tracker2, activeTrackerSlot, getPlan } = useAppStore()
  const plan = getPlan()
  const activeTracker = activeTrackerSlot === 'tracker1' ? tracker1 : tracker2

  return (
    <header className="flex-shrink-0 flex items-center justify-between px-4 lg:px-6 h-14 border-b border-[#2a3145] bg-[#0d1117]/80 backdrop-blur-sm">

      {/* Left */}
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8892aa] hover:text-[#f0f4ff] hover:bg-[#1e2535] transition-all"
          >
            <ArrowLeft size={18} />
          </button>
        ) : (
          <div className="lg:hidden w-8 h-8 rounded-xl bg-[#0A7163] flex items-center justify-center shadow-md shadow-[#0A7163]/30">
            <span className="text-sm font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>T</span>
          </div>
        )}

        {title ? (
          <h1 className="text-sm font-semibold text-[#f0f4ff]" style={{ fontFamily: 'Syne, sans-serif' }}>
            {title}
          </h1>
        ) : activeTracker && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: activeTracker.color }} />
            <span className="text-sm font-medium text-[#f0f4ff] hidden sm:block" style={{ fontFamily: 'Syne, sans-serif' }}>
              {activeTracker.name}
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
              style={{
                background: `${activeTracker.color}20`,
                color: activeTracker.color,
                border: `1px solid ${activeTracker.color}30`,
              }}
            >
              {activeTracker.currency}
            </span>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {actions}

        {/* Live alerts bell — replaces static bell */}
        <AlertsBell />

        {/* Avatar (mobile) */}
        <button
          onClick={() => navigate('/settings')}
          className="lg:hidden w-8 h-8 rounded-full bg-[#0A7163]/20 border border-[#0A7163]/30 flex items-center justify-center"
        >
          {user?.photoURL
            ? <img src={user.photoURL} className="w-8 h-8 rounded-full object-cover" alt="" />
            : <span className="text-xs font-bold text-[#0D9B87]">{user?.displayName?.[0]?.toUpperCase() ?? 'U'}</span>
          }
        </button>
      </div>
    </header>
  )
}
