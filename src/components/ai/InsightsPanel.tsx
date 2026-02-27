import { useState, useEffect } from 'react'
import { Sparkles, RefreshCw, AlertTriangle, Lightbulb, Trophy, Info, Zap } from 'lucide-react'
import { generateInsights, type Insight } from '@/services/claude'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'

const TYPE_CONFIG = {
  warning:     { icon: AlertTriangle, color: '#EF4444', bg: '#EF4444' },
  tip:         { icon: Lightbulb,    color: '#F59E0B', bg: '#F59E0B' },
  achievement: { icon: Trophy,       color: '#10B981', bg: '#10B981' },
  info:        { icon: Info,         color: '#3B82F6', bg: '#3B82F6' },
}

export function InsightsPanel() {
  const navigate = useNavigate()
  const { tracker1, tracker2, expenses, budgets, getPlan } = useAppStore()
  const plan = getPlan()

  const [insights, setInsights]   = useState<Insight[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [lastRun, setLastRun]     = useState<Date | null>(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await generateInsights([tracker1, tracker2], expenses, budgets)
      setInsights(data)
      setLastRun(new Date())
    } catch (err: any) {
      setError(
        err.message?.includes('API key')
          ? 'Add your Anthropic API key to .env to enable insights.'
          : 'Failed to generate insights. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Auto-load if business plan and we have data
  useEffect(() => {
    if (plan === 'business' && expenses.length > 0 && insights.length === 0) {
      load()
    }
  }, [plan, expenses.length])

  if (plan === 'free') {
    return (
      <div className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center">
            <Sparkles size={16} className="text-[#8B5CF6]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#f0f4ff]">AI Spending Insights</div>
            <div className="text-xs text-[#8B5CF6]">Business plan</div>
          </div>
        </div>
        <p className="text-xs text-[#4a5568] leading-relaxed mb-4">
          Get personalised AI analysis of your spending patterns, budget warnings, and savings opportunities.
        </p>
        <Button size="sm" onClick={() => navigate('/upgrade')}>
          <Zap size={13} /> Upgrade to unlock
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#8B5CF6]" />
          <span className="text-xs font-semibold text-[#4a5568] uppercase tracking-widest">AI Insights</span>
        </div>
        <div className="flex items-center gap-2">
          {lastRun && (
            <span className="text-[10px] text-[#4a5568]">
              {lastRun.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-[#4a5568] hover:text-[#8892aa] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Analysing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 px-4 py-3 text-sm text-[#EF4444]">
          {error}
        </div>
      )}

      {loading && insights.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-[#2a3145] bg-[#181d27] p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1e2535]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#1e2535] rounded w-1/2" />
                  <div className="h-2 bg-[#1e2535] rounded w-full" />
                  <div className="h-2 bg-[#1e2535] rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const cfg = TYPE_CONFIG[insight.type] ?? TYPE_CONFIG.info
            const Icon = cfg.icon
            return (
              <div key={i} className="rounded-xl border border-[#2a3145] bg-[#181d27] p-4">
                <div className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${cfg.bg}15`, border: `1px solid ${cfg.bg}25` }}
                  >
                    <Icon size={14} style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#f0f4ff] mb-1">{insight.title}</p>
                    <p className="text-xs text-[#8892aa] leading-relaxed">{insight.body}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && insights.length === 0 && !error && expenses.length === 0 && (
        <div className="rounded-xl border border-[#2a3145] bg-[#181d27] p-5 text-center">
          <p className="text-xs text-[#4a5568]">Add some expenses first to get AI insights.</p>
        </div>
      )}
    </div>
  )
}
