import { EXPENSE_CATEGORIES } from '@/utils/constants'

interface CategoryIconProps {
  category: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function CategoryIcon({ category, size = 'md', showLabel = false }: CategoryIconProps) {
  const meta = EXPENSE_CATEGORIES.find((c) => c.id === category)
  const icon  = meta?.icon  ?? '📦'
  const color = meta?.color ?? '#94A3B8'
  const label = meta?.label ?? category

  const sizes = {
    sm: { outer: 'w-7 h-7', text: 'text-sm' },
    md: { outer: 'w-9 h-9', text: 'text-base' },
    lg: { outer: 'w-12 h-12', text: 'text-xl' },
  }

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${sizes[size].outer} rounded-xl flex items-center justify-center flex-shrink-0`}
        style={{ background: `${color}18`, border: `1.5px solid ${color}30` }}
      >
        <span className={sizes[size].text}>{icon}</span>
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-[#f0f4ff]">{label}</span>
      )}
    </div>
  )
}
