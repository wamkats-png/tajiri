import { useNavigate } from 'react-router-dom'
import { PlusCircle, TrendingUp, Wallet, Target, BarChart3 } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { StatCard } from '@/components/ui/StatCard'
import { TrackerCard } from '@/components/ui/TrackerCard'
import { ExpenseRow } from '@/components/ui/ExpenseRow'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { InsightsPanel } from '@/components/ai/InsightsPanel'
import { useAppStore } from '@/store'
import { useExpenses, useExpenseTotals } from '@/hooks/useExpenses'
import { useBudgets } from '@/hooks/useBudgets'
import { formatCurrency } from '@/utils'

export default function DashboardPage() {
  const navigate  = useNavigate()
  const { user, tracker1, tracker2 } = useAppStore()
  const firstName = user?.displayName?.split(' ')[0] ?? 'there'

  const { expenses, loading, deleteExpense } = useExpenses()
  const { budgets } = useBudgets()

  const t1Expenses = expenses.filter((e) => e.trackerId === 'tracker1')
  const t2Expenses = expenses.filter((e) => e.trackerId === 'tracker2')
  const t1Budgets  = budgets.filter((b) => b.trackerId === 'tracker1')
  const t2Budgets  = budgets.filter((b) => b.trackerId === 'tracker2')

  const t1Totals = useExpenseTotals(t1Expenses)
  const t2Totals = useExpenseTotals(t2Expenses)

  const t1BudgetTotal  = t1Budgets.reduce((s, b) => s + b.amount, 0)
  const t2BudgetTotal  = t2Budgets.reduce((s, b) => s + b.amount, 0)
  const grandTotal     = t1Totals.total + t2Totals.total
  const grandBudget    = t1BudgetTotal + t2BudgetTotal
  const recentExpenses = expenses.slice(0, 8)

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <AppShell>
      <div className="space-y-7 fade-up">

        {/* Greeting */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f4ff]" style={{ fontFamily: 'Syne, sans-serif' }}>
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-sm text-[#4a5568] mt-1">
              {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Button size="sm" onClick={() => navigate('/add-expense')} className="flex-shrink-0">
            <PlusCircle size={14} /> Add
          </Button>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="flex justify-center py-8"><Spinner size={28} /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Spent This Month"
              value={tracker1 ? formatCurrency(grandTotal, tracker1.currency) : '—'}
              sub="across all trackers"
              icon={<Wallet size={14} />}
              accentColor="#0A7163"
            />
            <StatCard
              label="Total Expenses"
              value={String(recentExpenses.length)}
              sub="this month"
              icon={<TrendingUp size={14} />}
              accentColor="#3B82F6"
            />
            <StatCard
              label="Budgeted"
              value={tracker1 ? formatCurrency(grandBudget, tracker1.currency) : '—'}
              sub="total budget"
              icon={<Target size={14} />}
              accentColor="#F59E0B"
            />
            <StatCard
              label="Remaining"
              value={tracker1 ? formatCurrency(Math.max(0, grandBudget - grandTotal), tracker1.currency) : '—'}
              sub={grandTotal > grandBudget ? '⚠️ Over budget' : 'budget left'}
              icon={<BarChart3 size={14} />}
              accentColor="#10B981"
            />
          </div>
        )}

        {/* Trackers */}
        <div>
          <h2 className="text-xs font-semibold text-[#4a5568] uppercase tracking-widest mb-3">Your Trackers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tracker1 && (
              <TrackerCard
                tracker={tracker1}
                totalSpent={t1Totals.total}
                totalBudget={t1BudgetTotal}
                expenseCount={t1Totals.count}
                onClick={() => navigate('/tracker/tracker1')}
              />
            )}
            {tracker2 && (
              <TrackerCard
                tracker={tracker2}
                totalSpent={t2Totals.total}
                totalBudget={t2BudgetTotal}
                expenseCount={t2Totals.count}
                onClick={() => navigate('/tracker/tracker2')}
              />
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-xs font-semibold text-[#4a5568] uppercase tracking-widest mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Add Expense', emoji: '➕', to: '/add-expense', color: '#0A7163' },
              { label: 'Budgets',     emoji: '🎯', to: '/budgets',     color: '#F59E0B' },
              { label: 'AI Chat',     emoji: '🤖', to: '/chat',        color: '#8B5CF6' },
              { label: 'Reports',     emoji: '📊', to: '/reports',     color: '#3B82F6' },
            ].map(({ label, emoji, to, color }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="flex flex-col items-center gap-2.5 rounded-xl border border-[#2a3145] bg-[#181d27] p-4 hover:border-[#3a4155] hover:bg-[#1e2535] transition-all duration-200 active:scale-[0.97] group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                  {emoji}
                </div>
                <span className="text-xs font-medium text-[#8892aa] group-hover:text-[#f0f4ff] transition-colors">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent expenses */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-[#4a5568] uppercase tracking-widest">Recent Expenses</h2>
            {expenses.length > 0 && (
              <button onClick={() => navigate('/tracker/tracker1')}
                className="text-xs text-[#0D9B87] hover:text-[#0A7163] transition-colors">
                View all →
              </button>
            )}
          </div>
          <div className="rounded-2xl border border-[#2a3145] bg-[#181d27] overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : recentExpenses.length === 0 ? (
              <EmptyState
                icon="📭"
                title="No expenses yet"
                description="Tap the + button to log your first expense"
                action={{ label: 'Add Expense', onClick: () => navigate('/add-expense') }}
              />
            ) : (
              <div className="divide-y divide-[#2a3145]/50 px-4">
                {recentExpenses.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    onDelete={deleteExpense}
                    showTracker
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Chat button */}
        <button
          onClick={() => navigate('/chat')}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 hover:bg-[#8B5CF6]/15 transition-all"
        >
          <span className="text-2xl">✨</span>
          <div className="text-left">
            <div className="text-sm font-semibold text-[#f0f4ff]">AI CFO Chat</div>
            <div className="text-xs text-[#8B5CF6]">Ask anything about your finances</div>
          </div>
        </button>

        {/* AI Insights */}
        <InsightsPanel />

      </div>
    </AppShell>
  )
}
