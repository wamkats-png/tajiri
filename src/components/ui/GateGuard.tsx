import type { ReactNode } from 'react'
import type { GatedFeature } from '@/types'

interface GateGuardProps {
  feature: GatedFeature
  children: ReactNode
  fallback?: ReactNode
  compact?: boolean
}

// All features are free — always render children
export function GateGuard({ children }: GateGuardProps) {
  return <>{children}</>
}
