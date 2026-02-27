import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppStore } from '@/store'

interface ProtectedRouteProps {
  children: ReactNode
  requiresOnboarding?: boolean
}

export function ProtectedRoute({ children, requiresOnboarding = false }: ProtectedRouteProps) {
  const { user, tracker1 } = useAppStore()

  // Not logged in → login
  if (!user) return <Navigate to="/login" replace />

  // Logged in but no tracker yet → onboarding (unless we're already on onboarding)
  if (!requiresOnboarding && !tracker1) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
