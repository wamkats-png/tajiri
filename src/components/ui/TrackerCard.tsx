import { type Tracker } from '@/types'
import { AmountDisplay } from './AmountDisplay'
import { ProgressBar } from './ProgressBar'
import { ArrowRight } from 'lucide-react'

interface TrackerCardProps {
  tracker: Tracker
  totalSpent: number
  totalBudget: number
  expenseCount: number
  onClick?: () => void
}

export function TrackerCard({ tracker, totalSpent, totalBudget, expenseCount, onClick }: TrackerCardProps) {
  const pct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  const remaining = totalBudget - totalSpent

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border bg-[#181d27] p-5 text-left transition-all duration-200 hover:shadow-lg active:scale-[0.99] group"
      style={{
        borderColor: `${tracker.color}30`,
        boxShadow: `0 0 0 0 ${tracker.color}00`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${tracker.color}20`
        ;(e.currentTarget as HTMLElement).style.borderColor = `${tracker.color}50`
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 ${tracker.color}00`
        ;(e.currentTarget as HTMLElement).style.borderColor = `${tracker.color}30`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${tracker.color}20`, border: `1.5px solid ${tracker.color}40` }}
          >
            <div className="w-3 h-3 rounded-full" style={{ background: tracker.color }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#f0f4ff]">{tracker.name}</div>
            <div className="text-xs text-[#4a5568]">{tracker.currency} · {expenseCount} expenses</div>
          </div>
        </div>
        <ArrowRight size={16} className="text-[#2a3145] group-hover:text-[#4a5568] transition-colors" />
      </div>

      {/* Amount */}
      <div className="mb-3">
        <AmountDisplay amount={totalSpent} currency={tracker.currency} size="lg" />
        {totalBudget > 0 && (
          <span className="text-xs text-[#4a5568] ml-2">
            of <AmountDisplay amount={totalBudget} currency={tracker.currency} size="sm" color="#4a5568" /> budgeted
          </span>
        )}
      </div>

      {/* Progress */}
      {totalBudget > 0 && (
        <>
          <ProgressBar value={pct} color={tracker.color} height={5} />
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-[#4a5568]">
              {pct > 100 ? '⚠️ Over budget' : `${Math.round(pct)}% used`}
            </span>
            <span className="text-[10px]" style={{ color: remaining < 0 ? '#EF4444' : '#4a5568' }}>
              {remaining < 0 ? '-' : ''}
              <AmountDisplay amount={Math.abs(remaining)} currency={tracker.currency} size="sm" color={remaining < 0 ? '#EF4444' : '#4a5568'} />
              {' '}{remaining < 0 ? 'over' : 'left'}
            </span>
          </div>
        </>
      )}
    </button>
  )
}
