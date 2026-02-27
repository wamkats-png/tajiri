import { useNavigate } from 'react-router-dom'
import { Check, Zap, ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store'

const FREE_FEATURES = [
  '1 tracker (locked name)',
  'Manual expense entry',
  'Basic budget tracking',
  '10 AI interactions / month',
  'Multi-currency support',
]

const BUSINESS_FEATURES = [
  'Everything in Free',
  '2 trackers (names locked after setup)',
  'Receipt photo scanning (AI)',
  'Natural language expense entry',
  'Unlimited AI CFO Chat',
  'Full reports & charts',
  'CSV export',
  'Spending insights & alerts',
  'Rename trackers',
  'Priority support',
]

export default function UpgradePage() {
  const navigate = useNavigate()
  const { getPlan } = useAppStore()
  const plan = getPlan()

  return (
    <AppShell title="Upgrade" showBack>
      <div className="space-y-6 fade-up max-w-lg mx-auto">

        {/* Hero */}
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-2xl bg-[#F59E0B]/15 border border-[#F59E0B]/25 flex items-center justify-center mx-auto mb-4">
            <Zap size={28} className="text-[#F59E0B]" />
          </div>
          <h1 className="text-2xl font-bold text-[#f0f4ff] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Unlock the full Tajiri
          </h1>
          <p className="text-sm text-[#4a5568]">
            AI-powered finance tracking for people who mean business.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Free */}
          <div className={`rounded-2xl border p-5 ${plan === 'free' ? 'border-[#0A7163]/40 bg-[#0A7163]/5' : 'border-[#2a3145] bg-[#181d27]'}`}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-[#f0f4ff]" style={{ fontFamily: 'Syne, sans-serif' }}>Free</h2>
              {plan === 'free' && <span className="text-[10px] font-semibold text-[#0D9B87] bg-[#0A7163]/15 px-2 py-0.5 rounded-md">CURRENT</span>}
            </div>
            <div className="text-2xl font-bold text-[#f0f4ff] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              $0 <span className="text-sm font-normal text-[#4a5568]">/ month</span>
            </div>
            <ul className="space-y-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-[#8892aa]">
                  <Check size={13} className="text-[#0A7163] flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Business */}
          <div className={`rounded-2xl border p-5 relative overflow-hidden ${plan === 'business' ? 'border-[#F59E0B]/40 bg-[#F59E0B]/5' : 'border-[#F59E0B]/30 bg-gradient-to-b from-[#F59E0B]/8 to-[#181d27]'}`}>
            {plan !== 'business' && (
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-bold text-white bg-[#F59E0B] px-2 py-0.5 rounded-md">RECOMMENDED</span>
              </div>
            )}
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-[#f0f4ff]" style={{ fontFamily: 'Syne, sans-serif' }}>Business</h2>
              {plan === 'business' && <span className="text-[10px] font-semibold text-[#F59E0B] bg-[#F59E0B]/15 px-2 py-0.5 rounded-md">CURRENT</span>}
            </div>
            <div className="text-2xl font-bold text-[#f0f4ff] mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
              Coming Soon
            </div>
            <p className="text-xs text-[#4a5568] mb-4">Pricing will be announced shortly.</p>
            <ul className="space-y-2">
              {BUSINESS_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-[#8892aa]">
                  <Check size={13} className="text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        {plan === 'free' && (
          <div className="rounded-2xl border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-5 text-center">
            <p className="text-sm text-[#8892aa] mb-4">
              Interested in the Business plan? Leave your email and we'll notify you when it launches.
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 rounded-xl border border-[#2a3145] bg-[#181d27] text-[#f0f4ff] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/40 placeholder:text-[#4a5568]"
              />
              <Button onClick={() => {}}>
                <Zap size={14} /> Notify Me
              </Button>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#4a5568] hover:text-[#8892aa] transition-colors mx-auto"
        >
          <ArrowLeft size={14} /> Back to app
        </button>

      </div>
    </AppShell>
  )
}
