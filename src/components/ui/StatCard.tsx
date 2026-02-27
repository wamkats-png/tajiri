import { type ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  trend?: number // positive = up, negative = down, 0 = flat
  icon?: ReactNode
  accentColor?: string
  className?: string
}

export function StatCard({ label, value, sub, trend, icon, accentColor = '#0A7163', className = '' }: StatCardProps) {
  const trendColor = trend === undefined ? '' : trend > 0 ? '#EF4444' : trend < 0 ? '#10B981' : '#4a5568'
  const TrendIcon  = trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus

  return (
    <div className={`rounded-2xl border border-[#2a3145] bg-[#181d27] p-4 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-[#4a5568] font-medium">{label}</span>
        {icon && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}25` }}
          >
            <span style={{ color: accentColor }}>{icon}</span>
          </div>
        )}
      </div>

      <div className="text-xl font-bold text-[#f0f4ff] mb-1 truncate" style={{ fontFamily: 'Syne, sans-serif' }}>
        {value}
      </div>

      <div className="flex items-center gap-1.5">
        {TrendIcon && trend !== undefined && (
          <div className="flex items-center gap-1" style={{ color: trendColor }}>
            <TrendIcon size={11} />
            <span className="text-[10px] font-semibold">{Math.abs(trend)}%</span>
          </div>
        )}
        {sub && <span className="text-[10px] text-[#4a5568]">{sub}</span>}
      </div>
    </div>
  )
}
