import { type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: ReactNode
  title?: string
  showBack?: boolean
  actions?: ReactNode
}

export function AppShell({ children, title, showBack, actions }: AppShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0f1117]">

      {/* ── Sidebar (desktop only) ── */}
      <aside className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <TopBar title={title} showBack={showBack} actions={actions} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 pb-28 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* ── Bottom nav (mobile only) ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50">
        <BottomNav />
      </nav>
    </div>
  )
}
