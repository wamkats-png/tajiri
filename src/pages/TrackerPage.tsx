import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { PlusCircle, Settings, TrendingDown, Calendar, Filter } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { StatCard } from '@/components/ui/StatCard'
import { ExpenseRow } from '@/components/ui/ExpenseRow'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { AmountDisplay } from '@/components/ui/AmountDisplay'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store'
import { useExpenses, useExpenseTotals } from '@/hooks/useExpenses'
import { useBudgets, useBudgetProgress } from '@/hooks/useBudgets'
import { formatCurrency, getCategoryMeta } from '@/utils'
import type { TrackerSlot } from '@/types'

const FILTERS = ['All', 'This Month', 'Last Month', 'This Year'] as const
type Filter = typeof FILTERS[number]

export default function TrackerPage() {
  const { slot } = useParams<{ slot: string }>()
  const navigate  = useNavigate()
  const trackerId = (slot === 'tracker2' ? 'tracker2' : 'tracker1') as TrackerSlot

  const { tracker1, tracker2 } = useAppStore()
  const tracker = trackerId === 'tracker1' ? tracker1 : tracker2

  const [filter, setFilter]   = useState<Filter>('This Month')
  const [view, setView]       = useState<'list' | 'category'>('list')

  const { expenses, loading, deleteExpense } = useExpenses(trackerId)
  const { budgets } = useBudgets(trackerId)

  // Apply date filter
  const filtered = expenses.filter((e) => {
    const d = new Date(e.date)
    const now = new Date()
    if (filter === 'This Month')
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    if (filter === 'Last Month') {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
    }
    if (filter === 'This Year') return d.getFullYear() === now.getFullYear()
    return true
  })

  const totals  = useExpenseTotals(expenses)
  const budgetProgress = useBudgetProgress(budgets, totals.thisMonth, tracker?.currency ?? 'UGX')
  const totalBudget    = budgets.reduce((s, b) => s + b.amount, 0)

  // Category breakdown
  const categoryBreakdown = Object.entries(totals.byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)

  if (!tracker) {
    return (
      <AppShell title="Tracker">
        <EmptyState icon="🔒" title="Tracker not set up" description="This tracker slot is not active yet." />
      </AppShell>
    )
  }

  return (
    <AppShell
      title={tracker.name}
      actions={
        <button
          onClick={() => navigate('/settings')}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#4a5568] hover:text-[#f0f4ff] hover:bg-[#1e2535] transition-all"
        >
          <Settings size={16} />
        </button>
      }
    >
      <div className="space-y-6 fade-up">

        {/* ── Hero spending card ── */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${tracker.color}20 0%, ${tracker.color}08 100%)`,
            border: `1px solid ${tracker.color}30`,
          }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
            style={{ background: tracker.color, transform: 'translate(30%, -30%)' }} />
          <p className="text-xs font-medium mb-1" style={{ color: tracker.color }}>
            SPENT THIS MONTH
          </p>
          <AmountDisplay amount={totals.total} currency={tracker.currency} size="xl" />
          {totalBudget > 0 && (
            <div className="mt-4">
              <ProgressBar
                value={(totals.total / totalBudget) * 100}
                color={tracker.color}
                height={6}
              />
              <div className="flex justify-between mt-2 text-xs text-[#4a5568]">
                <span>{Math.round((totals.total / totalBudget) * 100)}% of budget used</span>
                <AmountDisplay amount={Math.max(0, totalBudget - totals.total)} currency={tracker.currency} size="sm" color="#4a5568" />
                <span>remaining</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Stat row ── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Transactions"
            value={String(totals.count)}
            sub="this month"
            icon={<TrendingDown size={14} />}
            accentColor={tracker.color}
          />
          <StatCard
            label="Avg / Day"
            value={formatCurrency(totals.count > 0 ? totals.total / new Date().getDate() : 0, tracker.currency)}
            sub="daily spend"
            icon={<Calendar size={14} />}
            accentColor={tracker.color}
          />
          <StatCard
            label="Categories"
            value={String(Object.keys(totals.byCategory).length)}
            sub="active"
            icon={<Filter size={14} />}
            accentColor={tracker.color}
          />
        </div>

        {/* ── Budget progress ── */}
        {budgetProgress.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-[#4a5568] uppercase tracking-widest">Budget Progress</h2>
              <button onClick={() => navigate('/budgets')} className="text-xs text-[#0D9B87] hover:text-[#0A7163] transition-colors">
                Manage →
              </button>
            </div>
            <div className="rounded-2xl border border-[#2a3145] bg-[#181d27] divide-y divide-[#2a3145]/50">
              {budgetProgress.map((b) => {
                const meta = getCategoryMeta(b.category)
                return (
                  <div key={b.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={b.category} size="sm" />
                        <span className="text-sm text-[#f0f4ff]">{meta.label}</span>
                      </div>
                      <div className="text-right">
                        <AmountDisplay amount={b.spent} currency={tracker.currency} size="sm" />
                        <span className="text-xs text-[#4a5568]"> / </span>
                        <AmountDisplay amount={b.amount} currency={tracker.currency} size="sm" color="#4a5568" />
                      </div>
                    </div>
                    <ProgressBar value={b.pct} color={meta.color} height={4} />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Category breakdown ── */}
        {categoryBreakdown.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-[#4a5568] uppercase tracking-widest mb-3">Top Categories</h2>
            <div className="grid grid-cols-2 gap-3">
              {categoryBreakdown.map(([cat, amount]) => {
                const meta = getCategoryMeta(cat)
                const catPct = totals.total > 0 ? (amount / totals.total) * 100 : 0
                return (
                  <div key={cat} className="rounded-xl border border-[#2a3145] bg-[#181d27] p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CategoryIcon category={cat} size="sm" />
                      <span className="text-xs text-[#8892aa] truncate">{meta.label}</span>
                    </div>
                    <AmountDisplay amount={amount} currency={tracker.currency} size="sm" />
                    <ProgressBar value={catPct} color={meta.color} height={3} className="mt-2" />
                    <span className="text-[10px] text-[#4a5568]">{Math.round(catPct)}% of spend</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Expense list ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-[#4a5568] uppercase tracking-widest">Expenses</h2>
            <Button size="sm" onClick={() => navigate('/add-expense')}>
              <PlusCircle size={13} /> Add
            </Button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                  ${filter === f
                    ? 'text-white'
                    : 'bg-[#1e2535] text-[#4a5568] hover:text-[#8892aa]'}
                `}
                style={filter === f ? { background: tracker.color } : {}}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-[#2a3145] bg-[#181d27] overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="📭"
                title="No expenses"
                description="No expenses found for this period."
                action={{ label: 'Add Expense', onClick: () => navigate('/add-expense') }}
              />
            ) : (
              <div className="divide-y divide-[#2a3145]/50 px-4">
                {filtered.map((expense) => (
                  <ExpenseRow key={expense.id} expense={expense} onDelete={deleteExpense} />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </AppShell>
  )
}
