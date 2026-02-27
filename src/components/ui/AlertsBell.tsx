import { useState, useMemo } from 'react'
import { Bell, X, AlertTriangle, Info, CheckCircle, Zap, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store'
import { useBudgets } from '@/hooks/useBudgets'
import { useExpenses } from '@/hooks/useExpenses'
import { generateAlerts, type Alert, type AlertSeverity } from '@/services/alerts'
import { useNavigate } from 'react-router-dom'

const SEV: Record<AlertSeverity, { icon: any; color: string; bg: string }> = {
  critical: { icon: AlertTriangle, color: '#EF4444', bg: '#EF4444' },
  warning:  { icon: Zap,           color: '#F59E0B', bg: '#F59E0B' },
  info:     { icon: Info,          color: '#3B82F6', bg: '#3B82F6' },
  success:  { icon: CheckCircle,   color: '#10B981', bg: '#10B981' },
}

export function AlertsBell() {
  const navigate  = useNavigate()
  const [open, setOpen]   = useState(false)
  const [read, setRead]   = useState<Set<string>>(new Set())

  const { tracker1, tracker2 } = useAppStore()
  const { expenses }  = useExpenses()
  const { budgets }   = useBudgets()

  const trackerNames: Record<string, string> = {
    tracker1: tracker1?.name ?? 'Tracker 1',
    tracker2: tracker2?.name ?? 'Tracker 2',
  }

  const alerts = useMemo(
    () => generateAlerts(expenses, budgets, trackerNames),
    [expenses, budgets, tracker1, tracker2]
  )

  const unread = alerts.filter(a => !read.has(a.id)).length

  function markAllRead() {
    setRead(new Set(alerts.map(a => a.id)))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#4a5568] hover:text-[#f0f4ff] hover:bg-[#1e2535] transition-all relative"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#EF4444] text-[9px] font-bold text-white flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-[#2a3145] bg-[#181d27] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a3145]">
              <h3 className="text-sm font-semibold text-[#f0f4ff]" style={{ fontFamily: 'Syne, sans-serif' }}>
                Alerts {unread > 0 && <span className="text-xs text-[#EF4444] ml-1">({unread} new)</span>}
              </h3>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-[#0D9B87] hover:text-[#0A7163] transition-colors">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-[#4a5568] hover:text-[#f0f4ff] transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-2xl mb-2">✅</p>
                  <p className="text-xs text-[#4a5568]">No alerts. You're on track!</p>
                </div>
              ) : (
                alerts.map((alert) => {
                  const cfg  = SEV[alert.severity]
                  const Icon = cfg.icon
                  const isNew = !read.has(alert.id)
                  return (
                    <div
                      key={alert.id}
                      className={`px-4 py-3 border-b border-[#2a3145]/50 hover:bg-[#1e2535] transition-colors cursor-pointer ${isNew ? 'bg-[#1a1f2e]' : ''}`}
                      onClick={() => {
                        setRead(prev => new Set([...prev, alert.id]))
                        if (alert.trackerId) navigate(`/tracker/${alert.trackerId}`)
                        setOpen(false)
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: `${cfg.bg}15`, border: `1px solid ${cfg.bg}25` }}>
                          <Icon size={13} style={{ color: cfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-xs font-semibold text-[#f0f4ff] leading-tight">{alert.title}</p>
                            {isNew && <div className="w-1.5 h-1.5 rounded-full bg-[#0A7163] flex-shrink-0 mt-1" />}
                          </div>
                          <p className="text-[10px] text-[#4a5568] mt-0.5 leading-relaxed line-clamp-2">{alert.body}</p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-[#2a3145]">
              <button onClick={() => { navigate('/budgets'); setOpen(false) }}
                className="flex items-center gap-1 text-xs text-[#4a5568] hover:text-[#0D9B87] transition-colors">
                Manage budgets <ChevronRight size={11} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
