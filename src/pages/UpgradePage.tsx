import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'

const ALL_FEATURES = [
  '2 trackers with custom names & colors',
  'Manual expense entry',
  'Receipt photo scanning (AI)',
  'Natural language expense entry (AI)',
  'Unlimited AI CFO Chat',
  'Budget tracking with progress alerts',
  'Full reports & charts',
  'CSV export',
  'Spending insights & alerts',
  'Multi-currency support',
  'Currency converter',
]

export default function UpgradePage() {
  const navigate = useNavigate()

  return (
    <AppShell title="Plan" showBack>
      <div className="space-y-6 fade-up max-w-lg mx-auto">

        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-2xl bg-[#0A7163]/15 border border-[#0A7163]/25 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-[#f0f4ff] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            All Features Unlocked
          </h1>
          <p className="text-sm text-[#4a5568]">
            Everything is free. No plans, no paywalls, no limits.
          </p>
        </div>

        <div className="rounded-2xl border border-[#0A7163]/30 bg-[#0A7163]/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#f0f4ff]" style={{ fontFamily: 'Syne, sans-serif' }}>Tajiri Free</h2>
            <span className="text-xs font-bold text-[#0D9B87] bg-[#0A7163]/15 px-2.5 py-1 rounded-md">ACTIVE</span>
          </div>
          <div className="text-3xl font-bold text-[#f0f4ff] mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>
            $0 <span className="text-sm font-normal text-[#4a5568]">forever</span>
          </div>
          <ul className="space-y-2.5">
            {ALL_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-[#8892aa]">
                <Check size={15} className="text-[#0D9B87] flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="w-full text-sm text-[#4a5568] hover:text-[#8892aa] transition-colors py-2"
        >
          ← Back to app
        </button>
      </div>
    </AppShell>
  )
}
