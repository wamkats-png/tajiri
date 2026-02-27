interface ProgressBarProps {
  value: number        // 0–100
  color?: string
  height?: number
  showLabel?: boolean
  animated?: boolean
  className?: string
}

export function ProgressBar({
  value, color = '#0A7163', height = 6,
  showLabel = false, animated = true, className = ''
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const isOver  = value > 100
  const barColor = isOver ? '#EF4444' : color

  return (
    <div className={`w-full ${className}`}>
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, background: '#1e2535' }}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${animated ? '' : ''}`}
          style={{
            width: `${Math.min(clamped, 100)}%`,
            background: isOver
              ? '#EF4444'
              : `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 8px ${barColor}40`,
          }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-[10px]" style={{ color: barColor }}>
            {isOver ? 'Over budget' : `${Math.round(clamped)}%`}
          </span>
        </div>
      )}
    </div>
  )
}
