import { type ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  color?: string
  variant?: 'solid' | 'soft'
  size?: 'sm' | 'md'
}

export function Badge({ children, color = '#0A7163', variant = 'soft', size = 'sm' }: BadgeProps) {
  const sizes = { sm: 'px-2 py-0.5 text-[10px]', md: 'px-2.5 py-1 text-xs' }

  if (variant === 'solid') {
    return (
      <span
        className={`inline-flex items-center rounded-md font-semibold ${sizes[size]}`}
        style={{ background: color, color: '#fff' }}
      >
        {children}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold ${sizes[size]}`}
      style={{
        background: `${color}18`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {children}
    </span>
  )
}
