import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import { Download, TrendingUp, TrendingDown, Zap } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { AmountDisplay } from '@/components/ui/AmountDisplay'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { CurrencyConverter } from '@/components/ui/CurrencyConverter'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAppStore } from '@/store'
import { useExpenses, useExpenseTotals } from '@/hooks/useExpenses'
import { useBudgets } from '@/hooks/useBudgets'
import { getCategoryMeta, formatCurrency } from '@/utils'
import { EXPENSE_CATEGORIES } from '@/utils/constants'

const CHART_COLORS = ['#0A7163','#3B82F6','#F59E0B','#8B5CF6','#EF4444','#10B981','#EC4899','#14B8A6']

type Period = 'week' | 'month' | '3months' | 'year'

function CustomTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[#2a3145] bg-[#181d27] px-3 py-2 shadow-xl">
      <p className="text-xs text-[#4a5568] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-sm font-semibold" style={{ color: p.color }}>
          {formatCurrency(p.value, currency)}
        </p>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const navigate = useNavigate()
  const { tracker1, tracker2, activeTrackerSlot, getPlan } = useAppStore()
  const plan = getPlan()

  const [period, setPeriod]       = useState<Period>('month')
  const [trackerId, setTrackerId] = useState(activeTrackerSlot)

  const tracker = trackerId === 'tracker1' ? tracker1 : tracker2
  const { expenses } = useExpenses(trackerId as any)
  const { budgets }  = useBudgets(trackerId as any)

  // Filter by period
  const filtered = useMemo(() => {
    const now = new Date()
    return expenses.filter((e) => {
      const d = new Date(e.date)
      if (period === 'week') {
        const week = new Date(now); week.setDate(now.getDate() - 7)
        return d >= week
      }
      if (period === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }
      if (period === '3months') {
        const m3 = new Date(now); m3.setMonth(now.getMonth() - 3)
        return d >= m3
      }
      if (period === 'year') return d.getFullYear() === now.getFullYear()
      return true
    })
  }, [expenses, period])

  const totals = useExpenseTotals(expenses)
  const totalSpent = filtered.reduce((s, e) => s + e.amount, 0)
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)

  // Category breakdown for pie
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {}
    filtered.forEach((e) => { map[e.category] = (map[e.category] ?? 0) + e.amount })
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, value], i) => ({
        cat, value,
        name: getCategoryMeta(cat).label,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }))
  }, [filtered])

  // Daily spend for line/bar chart (last 30 days)
  const dailyData = useMemo(() => {
    const days: { date: string; label: string; amount: number }[] = []
    const count = period === 'week' ? 7 : period === 'month' ? 30 : period === '3months' ? 90 : 365
    const step  = count > 60 ? 7 : 1  // group by week for long periods
    for (let i = count - 1; i >= 0; i -= step) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const key   = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString('en', step === 1
        ? { month: 'short', day: 'numeric' }
        : { month: 'short', day: 'numeric' }
      )
      const amount = expenses
        .filter((e) => e.date.slice(0, 10) === key)
        .reduce((s, e) => s + e.amount, 0)
      days.push({ date: key, label, amount })
    }
    return days.filter((_, i, arr) => i % Math.max(1, Math.floor(arr.length / 12)) === 0 || i === arr.length - 1)
  }, [expenses, period])

  // Month-over-month
  const now = new Date()
  const thisMonthExp = expenses.filter((e) => {
    const d = new Date(e.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const lastMonthExp = expenses.filter((e) => {
    const d = new Date(e.date)
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
  })
  const thisTotal = thisMonthExp.reduce((s, e) => s + e.amount, 0)
  const lastTotal = lastMonthExp.reduce((s, e) => s + e.amount, 0)
  const momChange = lastTotal > 0 ? Math.round(((thisTotal - lastTotal) / lastTotal) * 100) : 0

  // CSV export
  function exportCSV() {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Currency', 'Entry Method']
    const rows = filtered.map((e) => [
      e.date, `"${e.description}"`,
      getCategoryMeta(e.category).label,
      e.amount, e.currency, e.entryMethod ?? 'manual'
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `tajiri-${trackerId}-${period}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const currency = tracker?.currency ?? 'UGX'

  return (
    <AppShell title="Reports"
      actions={
        <Button size="sm" variant="secondary" onClick={exportCSV}>
          <Download size={13} /> Export CSV
        </Button>
      }
    >
      <div className="space-y-6 fade-up">

        {/* Tracker + Period selectors */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            {tracker1 && <TrackerTab tracker={tracker1} active={trackerId === 'tracker1'} onClick={() => setTrackerId('tracker1')} />}
            {tracker2 && plan === 'business' && <TrackerTab tracker={tracker2} active={trackerId === 'tracker2'} onClick={() => setTrackerId('tracker2')} />}
          </div>
          <div className="flex gap-1.5 rounded-xl border border-[#2a3145] bg-[#181d27] p-1">
            {(['week','month','3months','year'] as Period[]).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p ? 'bg-[#0A7163] text-white' : 'text-[#4a5568] hover:text-[#8892aa]'}`}>
                {p === 'week' ? '7D' : p === 'month' ? '1M' : p === '3months' ? '3M' : '1Y'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Spent" value={formatCurrency(totalSpent, currency)} sub={period} accentColor={tracker?.color ?? '#0A7163'} icon={<TrendingDown size={14} />} />
          <StatCard label="Transactions" value={String(filtered.length)} sub="expenses" accentColor="#3B82F6" />
          <StatCard label="Avg / Expense" value={filtered.length > 0 ? formatCurrency(totalSpent / filtered.length, currency) : '—'} sub="per entry" accentColor="#F59E0B" />
          <StatCard label="vs Last Month" value={`${momChange > 0 ? '+' : ''}${momChange}%`} sub={momChange < 0 ? '💚 Less spending' : momChange > 0 ? '🔴 More spending' : 'No change'} icon={momChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} accentColor={momChange < 0 ? '#10B981' : '#EF4444'} />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="📊" title="No data for this period" description="Add some expenses to see your reports." action={{ label: 'Add Expense', onClick: () => navigate('/add-expense') }} />
        ) : (
          <>
            {/* Spending over time */}
            <Card>
              <h3 className="text-sm font-semibold text-[#f0f4ff] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                Spending Over Time
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3145" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#4a5568', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
                  <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: '#1e2535' }} />
                  <Bar dataKey="amount" fill={tracker?.color ?? '#0A7163'} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Category breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pie */}
              <Card>
                <h3 className="text-sm font-semibold text-[#f0f4ff] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                  By Category
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {byCategory.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => formatCurrency(val, currency)} contentStyle={{ background: '#181d27', border: '1px solid #2a3145', borderRadius: 12 }} itemStyle={{ color: '#f0f4ff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              {/* Category list */}
              <Card>
                <h3 className="text-sm font-semibold text-[#f0f4ff] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Breakdown
                </h3>
                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {byCategory.map(({ cat, value, name, color }) => {
                    const pct = totalSpent > 0 ? Math.round((value / totalSpent) * 100) : 0
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <CategoryIcon category={cat} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-[#8892aa] truncate">{name}</span>
                            <span className="text-xs text-[#4a5568] flex-shrink-0 ml-2">{pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[#1e2535] overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                          </div>
                        </div>
                        <AmountDisplay amount={value} currency={currency} size="sm" color="#f0f4ff" />
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>

            {/* Top expenses table */}
            <Card>
              <h3 className="text-sm font-semibold text-[#f0f4ff] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                Top Expenses
              </h3>
              <div className="space-y-0 divide-y divide-[#2a3145]/50">
                {[...filtered].sort((a, b) => b.amount - a.amount).slice(0, 8).map((e) => (
                  <div key={e.id} className="flex items-center gap-3 py-2.5">
                    <CategoryIcon category={e.category} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#f0f4ff] truncate">{e.description}</p>
                      <p className="text-[10px] text-[#4a5568]">{e.date.slice(0, 10)}</p>
                    </div>
                    <AmountDisplay amount={e.amount} currency={e.currency} size="sm" />
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* Currency converter */}
        <CurrencyConverter />

      </div>
    </AppShell>
  )
}

function TrackerTab({ tracker, active, onClick }: { tracker: any; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
        active ? 'text-white' : 'border-[#2a3145] bg-[#181d27] text-[#4a5568] hover:text-[#8892aa]'
      }`}
      style={active ? { background: tracker.color, borderColor: tracker.color } : {}}>
      <div className="w-2 h-2 rounded-full" style={{ background: active ? 'white' : tracker.color }} />
      {tracker.name}
    </button>
  )
}
