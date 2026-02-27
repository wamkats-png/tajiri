import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { CurrencyConverter } from '@/components/ui/CurrencyConverter'

import LoginPage      from '@/pages/LoginPage'
import SignupPage     from '@/pages/SignupPage'
import OnboardingPage from '@/pages/OnboardingPage'
import DashboardPage  from '@/pages/DashboardPage'
import TrackerPage    from '@/pages/TrackerPage'
import AddExpensePage from '@/pages/AddExpensePage'
import BudgetsPage    from '@/pages/BudgetsPage'
import SettingsPage   from '@/pages/SettingsPage'
import UpgradePage    from '@/pages/UpgradePage'
import ChatPage      from '@/pages/ChatPage'
import ReportsPage   from '@/pages/ReportsPage'

// Placeholder for prompts 12-20
function Soon({ name }: { name: string }) {
  return (
    <AppShell title={name}>
      <div className="space-y-6 fade-up">
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="text-5xl">🔨</div>
          <p className="text-sm font-medium text-[#f0f4ff]">/{name}</p>
          <p className="text-xs text-[#4a5568]">Building in next prompt batch</p>
        </div>
        {name === 'reports' && <CurrencyConverter />}
      </div>
    </AppShell>
  )
}

export default function App() {
  useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route path="/login"  element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Onboarding */}
      <Route path="/onboarding" element={
        <ProtectedRoute requiresOnboarding>
          <OnboardingPage />
        </ProtectedRoute>
      } />

      {/* Protected */}
      <Route path="/dashboard"     element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/tracker/:slot" element={<ProtectedRoute><TrackerPage /></ProtectedRoute>} />
      <Route path="/add-expense"   element={<ProtectedRoute><AddExpensePage /></ProtectedRoute>} />
      <Route path="/budgets"       element={<ProtectedRoute><BudgetsPage /></ProtectedRoute>} />
      <Route path="/settings"      element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/upgrade"       element={<ProtectedRoute><UpgradePage /></ProtectedRoute>} />

      {/* Coming soon */}
      <Route path="/chat"    element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
