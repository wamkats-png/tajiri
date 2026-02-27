import { type Expense } from '@/types'
import { CategoryIcon } from './CategoryIcon'
import { AmountDisplay } from './AmountDisplay'
import { formatDate } from '@/utils'
import { Trash2 } from 'lucide-react'

interface ExpenseRowProps {
  expense: Expense
  onDelete?: (id: string) => void
  showTracker?: boolean
}

export function ExpenseRow({ expense, onDelete, showTracker }: ExpenseRowProps) {
  return (
    <div className="flex items-center gap-3 py-3 px-1 group">
      <CategoryIcon category={expense.category} size="md" />

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#f0f4ff] truncate">{expense.description}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-[#4a5568]">{formatDate(expense.date)}</span>
          {expense.aiParsed && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#0A7163]/10 text-[#0D9B87] border border-[#0A7163]/20">
              AI
            </span>
          )}
          {expense.entryMethod === 'receipt' && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
              📷 Receipt
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <AmountDisplay amount={expense.amount} currency={expense.currency} size="sm" />
        {onDelete && (
          <button
            onClick={() => onDelete(expense.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-[#4a5568] hover:text-[#EF4444] hover:bg-[#EF4444]/10"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}
