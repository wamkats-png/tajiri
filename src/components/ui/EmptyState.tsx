import { type ReactNode } from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: { label: string; onClick: () => void }
  children?: ReactNode
}

export function EmptyState({ icon, title, description, action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-[#f0f4ff] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
        {title}
      </h3>
      <p className="text-sm text-[#4a5568] max-w-xs leading-relaxed mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
      {children}
    </div>
  )
}
