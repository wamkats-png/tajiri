import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { ReceiptScanner } from '@/components/expense/ReceiptScanner'
import { NLExpenseInput } from '@/components/expense/NLExpenseInput'
import { useAppStore } from '@/store'
import { useExpenses } from '@/hooks/useExpenses'
import { EXPENSE_CATEGORIES, CURRENCIES } from '@/utils/constants'
import { todayISO } from '@/utils'
import type { TrackerSlot, ExpenseCategory, EntryMethod } from '@/types'
import type { ParsedExpense } from '@/services/claude'

type Mode = 'manual' | 'receipt' | 'nl'

export default function AddExpensePage() {
  const navigate  = useNavigate()
  const { user, tracker1, tracker2, activeTrackerSlot } = useAppStore()
  const { addExpense } = useExpenses()

  const [mode, setMode]         = useState<Mode>('manual')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [showCats, setShowCats] = useState(false)

  const [trackerId, setTrackerId]     = useState<TrackerSlot>(activeTrackerSlot)
  const [description, setDescription] = useState('')
  const [amount, setAmount]           = useState('')
  const [currency, setCurrency]       = useState(tracker1?.currency ?? 'UGX')
  const [category, setCategory]       = useState<ExpenseCategory>('other')
  const [date, setDate]               = useState(todayISO())
  const [notes, setNotes]             = useState('')

  const activeTracker = trackerId === 'tracker1' ? tracker1 : tracker2

  function applyParsed(data: ParsedExpense) {
    if (data.description) setDescription(data.description)
    if (data.amount)      setAmount(String(data.amount))
    if (data.currency)    setCurrency(data.currency)
    if (data.category)    setCategory(data.category as ExpenseCategory)
    if (data.date)        setDate(data.date)
    if (data.notes)       setNotes(data.notes)
    setMode('manual')
  }

  async function handleSave() {
    if (!description.trim() || !amount || parseFloat(amount) <= 0) {
      setError('Please fill in description and amount.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await addExpense({
        trackerId,
        userId: user?.uid ?? '',
        description: description.trim(),
        amount: parseFloat(amount),
        currency,
        category,
        date,
        notes: notes.trim() || undefined,
        entryMethod: mode as EntryMethod,
        aiParsed: mode !== 'manual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      navigate(-1)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell title="Add Expense" showBack>
      <div className="space-y-5 fade-up">

        {/* Mode tabs — all unlocked */}
        <div className="flex rounded-xl border border-[#2a3145] bg-[#181d27] p-1 gap-1">
          <ModeTab active={mode === 'manual'}  onClick={() => setMode('manual')}  label="✏️ Manual" />
          <ModeTab active={mode === 'receipt'} onClick={() => setMode('receipt')} label="📷 Receipt" />
          <ModeTab active={mode === 'nl'}      onClick={() => setMode('nl')}      label="✨ AI Parse" />
        </div>

        {/* Tracker selector */}
        <div className="flex gap-2">
          {tracker1 && (
            <TrackerPill tracker={tracker1} active={trackerId === 'tracker1'}
              onClick={() => { setTrackerId('tracker1'); setCurrency(tracker1.currency) }} />
          )}
          {tracker2 && (
            <TrackerPill tracker={tracker2} active={trackerId === 'tracker2'}
              onClick={() => { setTrackerId('tracker2'); setCurrency(tracker2.currency) }} />
          )}
        </div>

        {/* NL mode */}
        {mode === 'nl' && (
          <Card>
            <NLExpenseInput
              defaultCurrency={activeTracker?.currency ?? 'UGX'}
              onParsed={applyParsed}
              onError={setError}
            />
          </Card>
        )}

        {/* Receipt mode */}
        {mode === 'receipt' && (
          <Card>
            <ReceiptScanner
              defaultCurrency={activeTracker?.currency ?? 'UGX'}
              onParsed={applyParsed}
              onError={setError}
            />
          </Card>
        )}

        {/* Manual form */}
        <Card>
          <div className="space-y-4">
            <Input label="Description" placeholder="What did you spend on?"
              value={description} onChange={(e) => setDescription(e.target.value)} />

            <div className="flex gap-3">
              <div className="flex-1">
                <Input label="Amount" type="number" placeholder="0"
                  value={amount} onChange={(e) => setAmount(e.target.value)} step="any" min="0" />
              </div>
              <div className="w-28">
                <label className="text-sm font-medium text-[#8892aa] block mb-1.5">Currency</label>
                <select
                  className="w-full rounded-xl border border-[#2a3145] bg-[#181d27] text-[#f0f4ff] px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A7163]/40"
                  value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#8892aa] block mb-1.5">Category</label>
              <button onClick={() => setShowCats(!showCats)}
                className="w-full flex items-center gap-3 rounded-xl border border-[#2a3145] bg-[#181d27] px-4 py-3 hover:border-[#3a4155] transition-all">
                <CategoryIcon category={category} size="sm" />
                <span className="flex-1 text-left text-sm text-[#f0f4ff]">
                  {EXPENSE_CATEGORIES.find((c) => c.id === category)?.label ?? 'Other'}
                </span>
                <ChevronDown size={15} className={`text-[#4a5568] transition-transform ${showCats ? 'rotate-180' : ''}`} />
              </button>
              {showCats && (
                <div className="mt-2 rounded-xl border border-[#2a3145] bg-[#181d27] overflow-hidden grid grid-cols-2 gap-px bg-[#2a3145]">
                  {EXPENSE_CATEGORIES.map((c) => (
                    <button key={c.id} onClick={() => { setCategory(c.id as ExpenseCategory); setShowCats(false) }}
                      className={`flex items-center gap-2 px-3 py-2.5 text-left transition-all bg-[#181d27] hover:bg-[#1e2535] ${category === c.id ? 'bg-[#0A7163]/10' : ''}`}>
                      <span className="text-base">{c.icon}</span>
                      <span className="text-xs text-[#f0f4ff]">{c.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input label="Notes (optional)" placeholder="Any extra details..."
              value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </Card>

        {error && (
          <div className="rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 px-4 py-3 text-sm text-[#EF4444]">{error}</div>
        )}

        <div className="flex gap-3 pb-4">
          <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button fullWidth loading={saving} onClick={handleSave}>Save Expense</Button>
        </div>
      </div>
    </AppShell>
  )
}

function ModeTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
        active ? 'bg-[#0A7163] text-white' : 'text-[#4a5568] hover:text-[#8892aa]'
      }`}>
      {label}
    </button>
  )
}

function TrackerPill({ tracker, active, onClick }: { tracker: any; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
        active ? 'text-white' : 'border-[#2a3145] bg-[#181d27] text-[#4a5568] hover:text-[#8892aa]'
      }`}
      style={active ? { background: tracker.color, borderColor: tracker.color } : {}}>
      <div className="w-2 h-2 rounded-full" style={{ background: active ? 'white' : tracker.color }} />
      {tracker.name}
    </button>
  )
}
