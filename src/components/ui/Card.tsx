import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  glow?: boolean
  onClick?: () => void
}

export function Card({ children, className = '', glow = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl border border-[#2a3145] bg-[#181d27] p-5
        ${glow ? 'shadow-lg shadow-[#0A7163]/10 border-[#0A7163]/20' : ''}
        ${onClick ? 'cursor-pointer hover:border-[#3a4155] transition-all duration-200 active:scale-[0.99]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
