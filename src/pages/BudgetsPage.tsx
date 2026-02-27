import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Trash2, Target } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { AmountDisplay } from '@/components/ui/AmountDisplay'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { useAppStore } from '@/store'
import { useBudgets, useBudgetProgress } from '@/hooks/useBudgets'
import { useExpenses, useExpenseTotals } from '@/hooks/useExpenses'
import { EXPENSE_CATEGORIES, CURRENCIES } from '@/utils/constants'
import { getCategoryMeta } from '@/utils'
import type { TrackerSlot, ExpenseCategory, BudgetPeriod } from '@/types'

export default function BudgetsPage() {
  const navigate   = useNavigate()
  const { tracker1, tracker2, user, activeTrackerSlot } = useAppStore()

  const [trackerId, setTrackerId] = useState<TrackerSlot>(activeTrackerSlot)
  const [showModal, setShowModal] = useState(false)

  const tracker = trackerId === 'tracker1' ? tracker1 : tracker2
  const { budgets, loading, saveBudget, deleteBudget } = useBudgets(trackerId)
  const { expenses } = useExpenses(trackerId)
  const totals  = useExpenseTotals(expenses)
  const budgetProgress = useBudgetProgress(budgets, totals.thisMonth, tracker?.currency ?? 'UGX')

  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent    = totals.total
  const overallPct    = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0

  // New budget form
  const [category, setCategory] = useState<ExpenseCategory>('food')
  const [amount, setAmount]     = useState('')
  const [currency, setCurrency] = useState(tracker?.currency ?? 'UGX')
  const [period, setPeriod]     = useState<BudgetPeriod>('monthly')
  const [saving, setSaving]     = useState(false)
  const [formError, setFormError] = useState('')

  async function handleSave() {
    if (!amount || parseFloat(amount) <= 0) { setFormError('Enter a valid amount.'); return }
    if (!user) return
    setSaving(true)
    setFormError('')
    try {
      await saveBudget({
        trackerId,
        userId: user?.uid ?? '',
        category,
        amount: parseFloat(amount),
        currency: currency || tracker?.currency || 'UGX',
        period,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      setShowModal(false)
      setAmount('')
    } catch {
      setFormError('Failed to save budget.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell title="Budgets">
      <div className="space-y-6 fade-up">

        {/* ── Tracker tabs ── */}
        <div className="flex gap-2">
          {tracker1 && (
            <TrackerTab tracker={tracker1} active={trackerId === 'tracker1'} onClick={() => setTrackerId('tracker1')} />
          )}
          {tracker2 && (
            <TrackerTab tracker={tracker2} active={trackerId === 'tracker2'} onClick={() => setTrackerId('tracker2')} />
          )}
        </div>

        {/* ── Overall summary ── */}
        {budgets.length > 0 && tracker && (
          <div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${tracker.color}18 0%, ${tracker.color}06 100%)`, border: `1px solid ${tracker.color}25` }}
          >
            <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: tracker.color }}>
              Overall Budget · {new Date().toLocaleString('en', { month: 'long' })}
            </p>
            <div className="flex items-end justify-between mb-3">
              <AmountDisplay amount={totalSpent} currency={tracker.currency} size="lg" />
              <span className="text-sm text-[#4a5568]">
                of <AmountDisplay amount={totalBudgeted} currency={tracker.currency} size="sm" color="#4a5568" />
              </span>
            </div>
            <ProgressBar value={overallPct} color={tracker.color} height={8} />
            <div className="flex justify-between mt-2 text-xs text-[#4a5568]">
              <span>{Math.round(overallPct)}% used</span>
              <span>
                {totalBudgeted - totalSpent >= 0 ? (
                  <><AmountDisplay amount={totalBudgeted - totalSpent} currency={tracker.currency} size="sm" color="#10B981" /> remaining</>
                ) : (
                  <span className="text-[#EF4444]">⚠️ Over budget</span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* ── Budget list ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-[#4a5568] uppercase tracking-widest">Category Budgets</h2>
            <Button size="sm" onClick={() => setShowModal(true)}>
              <PlusCircle size={13} /> Add
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : budgetProgress.length === 0 ? (
            <EmptyState
              icon="🎯"
              title="No budgets yet"
              description={`Set spending limits for ${tracker?.name ?? 'this tracker'} by category.`}
              action={{ label: 'Add Budget', onClick: () => setShowModal(true) }}
            />
          ) : (
            <div className="space-y-3">
              {budgetProgress.map((b) => {
                const meta  = getCategoryMeta(b.category)
                const isOver = b.pct > 100
                return (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-[#2a3145] bg-[#181d27] p-4 group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <CategoryIcon category={b.category} size="md" />
                        <div>
                          <div className="text-sm font-medium text-[#f0f4ff]">{meta.label}</div>
                          <div className="text-xs text-[#4a5568] capitalize">{b.period}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <AmountDisplay amount={b.spent} currency={b.currency} size="sm" color={isOver ? '#EF4444' : '#f0f4ff'} />
                          <div className="text-[10px] text-[#4a5568]">
                            of <AmountDisplay amount={b.amount} currency={b.currency} size="sm" color="#4a5568" />
                          </div>
                        </div>
                        <button
                          onClick={() => deleteBudget(b.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-[#4a5568] hover:text-[#EF4444] hover:bg-[#EF4444]/10"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <ProgressBar value={b.pct} color={meta.color} height={6} showLabel />
                    {isOver && (
                      <p className="text-xs text-[#EF4444] mt-2">
                        ⚠️ Over by <AmountDisplay amount={Math.abs(b.remaining)} currency={b.currency} size="sm" color="#EF4444" />
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Unbudgeted categories ── */}
        {budgets.length > 0 && Object.keys(totals.byCategory).filter(cat => !budgets.find(b => b.category === cat)).length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-[#4a5568] uppercase tracking-widest mb-3">Unbudgeted Spending</h2>
            <Card>
              <div className="divide-y divide-[#2a3145]/50">
                {Object.entries(totals.byCategory)
                  .filter(([cat]) => !budgets.find(b => b.category === cat))
                  .map(([cat, amount]) => {
                    const meta = getCategoryMeta(cat)
                    return (
                      <div key={cat} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2">
                          <CategoryIcon category={cat} size="sm" />
                          <span className="text-sm text-[#8892aa]">{meta.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AmountDisplay amount={amount as number} currency={tracker?.currency ?? 'UGX'} size="sm" />
                          <button
                            onClick={() => { setCategory(cat as ExpenseCategory); setShowModal(true) }}
                            className="text-[10px] text-[#0D9B87] hover:text-[#0A7163] transition-colors"
                          >
                            + Set budget
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </Card>
          </div>
        )}

      </div>

      {/* ── Add Budget Modal ── */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Budget">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#8892aa] block mb-2">Category</label>
            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {EXPENSE_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id as ExpenseCategory)}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all ${
                    category === c.id ? 'border-[#0A7163] bg-[#0A7163]/10' : 'border-[#2a3145] bg-[#1e2535] hover:border-[#3a4155]'
                  }`}
                >
                  <span className="text-lg">{c.icon}</span>
                  <span className="text-xs text-[#f0f4ff]">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Input
              label="Amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
            />
            <div>
              <label className="text-sm font-medium text-[#8892aa] block mb-1.5">Currency</label>
              <select
                className="rounded-xl border border-[#2a3145] bg-[#181d27] text-[#f0f4ff] px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A7163]/40 w-24"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#8892aa] block mb-2">Period</label>
            <div className="flex gap-2">
              {(['monthly', 'weekly', 'yearly'] as BudgetPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                    period === p ? 'bg-[#0A7163] text-white' : 'bg-[#1e2535] text-[#4a5568] hover:text-[#8892aa]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {formError && <p className="text-xs text-[#EF4444]">{formError}</p>}

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" fullWidth onClick={() => setShowModal(false)}>Cancel</Button>
            <Button fullWidth loading={saving} onClick={handleSave}>Save Budget</Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  )
}

function TrackerTab({ tracker, active, onClick }: { tracker: any; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
        active ? 'text-white' : 'border-[#2a3145] bg-[#181d27] text-[#4a5568] hover:text-[#8892aa]'
      }`}
      style={active ? { background: tracker.color, borderColor: tracker.color } : {}}
    >
      <div className="w-2 h-2 rounded-full" style={{ background: active ? 'white' : tracker.color }} />
      {tracker.name}
    </button>
  )
}
