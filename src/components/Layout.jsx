import { NavLink } from 'react-router-dom'
import AIInput from './AIInput'

const nav = [
  { to: '/dashboard', label: 'Dashboard',  emoji: '📊' },
  { to: '/properties', label: 'Properties', emoji: '🏘️' },
  { to: '/tenants',    label: 'Tenants',    emoji: '👥' },
  { to: '/payments',   label: 'Payments',   emoji: '💸' },
]

export default function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-white border-r border-slate-200 shadow-sm">

        {/* Logo */}
        <div className="px-5 pt-7 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏡</span>
            <div>
              <h1 className="text-2xl font-black leading-none tracking-tight text-slate-800">
                Nyumbani<span className="text-green-600">!</span>
              </h1>
              <p className="text-xs font-semibold text-slate-400 mt-0.5 tracking-wide uppercase">
                Property Manager
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1.5">
          {nav.map(({ to, label, emoji }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <span className="text-xl">{emoji}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 mt-2 text-center">
          <p className="text-xs text-slate-400 font-medium">✨ Powered by Claude AI</p>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 pb-32">
          {children}
        </main>

        {/* Sticky AI input */}
        <div className="border-t-2 border-slate-200 bg-white px-6 py-3">
          <AIInput />
        </div>
      </div>

    </div>
  )
}
