import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { saveTracker } from '@/services/firestore'
import { useAppStore } from '@/store'
import { CURRENCIES, TRACKER_COLORS, TRACKER_TYPES } from '@/utils/constants'
import type { Tracker } from '@/types'

const STEPS = ['Welcome', 'Name your tracker', 'Currency', 'Done']

export default function OnboardingPage() {
  const navigate  = useNavigate()
  const { user, setTracker } = useAppStore()

  const [step, setStep]       = useState(0)
  const [name, setName]       = useState('')
  const [type, setType]       = useState('personal')
  const [currency, setCurrency] = useState('UGX')
  const [color, setColor]     = useState(TRACKER_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function finish() {
    if (!user) return
    setError('')
    setLoading(true)
    try {
      const tracker: Tracker = {
        id: 'tracker1',
        userId: user.uid,
        type: type as any,
        updatedAt: new Date().toISOString(),
        name: name.trim() || 'My Tracker',
        
        currency,
        color,
        
        createdAt: new Date().toISOString(),
      }
      await saveTracker(user.uid, tracker)
      setTracker('tracker1', tracker)
      navigate('/dashboard')
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #0A7163 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg">

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                transition-all duration-300
                ${i < step ? 'bg-[#0A7163] text-white' :
                  i === step ? 'bg-[#0A7163]/20 text-[#0D9B87] border border-[#0A7163]' :
                  'bg-[#1e2535] text-[#4a5568]'}
              `}>
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px transition-all duration-300 ${i < step ? 'bg-[#0A7163]' : 'bg-[#2a3145]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <div className="fade-up text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#0A7163] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#0A7163]/30">
              <span className="text-3xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>T</span>
            </div>
            <h1 className="text-3xl font-bold text-[#f0f4ff] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
              Welcome to Tajiri
            </h1>
            <p className="text-[#8892aa] mb-2 text-base leading-relaxed">
              Hi {user?.displayName?.split(' ')[0] || 'there'} 👋
            </p>
            <p className="text-[#4a5568] mb-10 text-sm leading-relaxed">
              Let's set up your first budget tracker. Takes less than a minute.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { icon: '📊', label: 'Budget tracking' },
                { icon: '🤖', label: 'AI-powered insights' },
                { icon: '🌍', label: 'Multi-currency' },
              ].map(({ icon, label }) => (
                <div key={label} className="rounded-xl border border-[#2a3145] bg-[#181d27] p-4 text-center">
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="text-xs text-[#8892aa]">{label}</div>
                </div>
              ))}
            </div>

            <Button fullWidth size="lg" onClick={() => setStep(1)}>
              Get Started →
            </Button>
          </div>
        )}

        {/* Step 1 — Name tracker */}
        {step === 1 && (
          <div className="fade-up">
            <div className="rounded-2xl border border-[#2a3145] bg-[#181d27] p-8">
              <h2 className="text-2xl font-bold text-[#f0f4ff] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                Name your tracker
              </h2>
              <p className="text-sm text-[#4a5568] mb-8">
                This could be your household, a business, savings goal — anything you want to track.
              </p>

              {/* Type selector */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {TRACKER_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setType(t.id); setName(t.label) }}
                    className={`
                      rounded-xl border p-4 text-left transition-all duration-200
                      ${type === t.id
                        ? 'border-[#0A7163] bg-[#0A7163]/10'
                        : 'border-[#2a3145] bg-[#1e2535] hover:border-[#3a4155]'}
                    `}
                  >
                    <div className="text-xl mb-1">{t.icon}</div>
                    <div className="text-sm font-medium text-[#f0f4ff]">{t.label}</div>
                  </button>
                ))}
              </div>

              <Input
                label="Tracker Name"
                placeholder="e.g. Home Budget, Kampala Bakery..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                hint="You won't be able to rename this on the Free plan."
              />

              {/* Color picker */}
              <div className="mt-5">
                <label className="text-sm font-medium text-[#8892aa] block mb-3">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {TRACKER_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className="w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center"
                      style={{ background: c, boxShadow: color === c ? `0 0 0 2px #0f1117, 0 0 0 4px ${c}` : 'none' }}
                    >
                      {color === c && <Check size={12} className="text-white" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
                <Button
                  fullWidth
                  onClick={() => name.trim() ? setStep(2) : setError('Please enter a tracker name.')}
                >
                  Continue →
                </Button>
              </div>
              {error && <p className="text-xs text-[#EF4444] mt-2">{error}</p>}
            </div>
          </div>
        )}

        {/* Step 2 — Currency */}
        {step === 2 && (
          <div className="fade-up">
            <div className="rounded-2xl border border-[#2a3145] bg-[#181d27] p-8">
              <h2 className="text-2xl font-bold text-[#f0f4ff] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                Default currency
              </h2>
              <p className="text-sm text-[#4a5568] mb-6">
                You can log expenses in any currency — this is just your default.
              </p>

              <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setCurrency(c.code)}
                    className={`
                      flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-200
                      ${currency === c.code
                        ? 'border-[#0A7163] bg-[#0A7163]/10'
                        : 'border-[#2a3145] bg-[#1e2535] hover:border-[#3a4155]'}
                    `}
                  >
                    <span className="text-xl">{c.flag}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#f0f4ff]">{c.name}</div>
                      <div className="text-xs text-[#4a5568]">{c.code} · {c.symbol}</div>
                    </div>
                    {currency === c.code && (
                      <div className="w-5 h-5 rounded-full bg-[#0A7163] flex items-center justify-center">
                        <Check size={11} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button fullWidth onClick={() => setStep(3)}>Continue →</Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Done */}
        {step === 3 && (
          <div className="fade-up text-center">
            <div className="rounded-2xl border border-[#2a3145] bg-[#181d27] p-8">
              {/* Preview card */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg"
                style={{ background: `${color}20`, border: `2px solid ${color}40` }}
              >
                {TRACKER_TYPES.find((t) => t.id === type)?.icon || '📊'}
              </div>

              <h2 className="text-2xl font-bold text-[#f0f4ff] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                You're all set!
              </h2>
              <p className="text-[#4a5568] text-sm mb-6">
                Your tracker is ready to go.
              </p>

              <div className="rounded-xl border border-[#2a3145] bg-[#1e2535] p-4 text-left mb-8 space-y-3">
                <Row label="Tracker name" value={name} />
                <Row label="Currency" value={`${CURRENCIES.find(c => c.code === currency)?.flag} ${currency}`} />
                <Row label="Plan" value="Free" />
                <Row label="Trackers" value="1 of 2 active" />
              </div>

              {error && (
                <div className="rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 px-3 py-2.5 text-sm text-[#EF4444] mb-4">
                  {error}
                </div>
              )}

              <Button fullWidth size="lg" loading={loading} onClick={finish}>
                Open Tajiri →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-[#4a5568]">{label}</span>
      <span className="text-sm font-medium text-[#f0f4ff]">{value}</span>
    </div>
  )
}
