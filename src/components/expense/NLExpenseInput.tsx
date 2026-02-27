import { useState } from 'react'
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { parseNaturalLanguageExpense, type ParsedExpense } from '@/services/claude'

const EXAMPLES = [
  'Lunch at Café Javas, 35k',
  'Paid electricity bill 180,000',
  'Fuel for car $45',
  'School fees 2.5M UGX',
  'Groceries 95,000 this morning',
]

interface NLExpenseInputProps {
  defaultCurrency: string
  onParsed: (data: ParsedExpense) => void
  onError?: (msg: string) => void
}

export function NLExpenseInput({ defaultCurrency, onParsed, onError }: NLExpenseInputProps) {
  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(false)

  async function handleParse() {
    if (!text.trim()) return
    setLoading(true)
    try {
      const parsed = await parseNaturalLanguageExpense(text, defaultCurrency)
      onParsed(parsed)
      setText('')
    } catch (err: any) {
      onError?.(
        err.message?.includes('API key')
          ? 'Add your Anthropic API key to .env to enable AI parsing.'
          : 'Could not parse that. Try: "spent 45k on fuel" or use manual entry.'
      )
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleParse() }
  }

  return (
    <div className="space-y-3">
      {/* Input */}
      <div className="relative">
        <div className="absolute left-4 top-4 text-[#4a5568]">
          <Sparkles size={16} className="text-[#8B5CF6]" />
        </div>
        <textarea
          className="w-full rounded-xl border border-[#2a3145] bg-[#181d27] text-[#f0f4ff] pl-10 pr-4 pt-3.5 pb-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30 focus:border-[#8B5CF6]/40 placeholder:text-[#4a5568] transition-all"
          rows={3}
          placeholder="Describe your expense naturally..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        {text.trim() && !loading && (
          <button
            onClick={handleParse}
            className="absolute right-3 bottom-3 w-8 h-8 rounded-lg bg-[#8B5CF6] flex items-center justify-center hover:bg-[#7C3AED] transition-colors active:scale-95"
          >
            <ArrowRight size={15} className="text-white" />
          </button>
        )}
        {loading && (
          <div className="absolute right-3 bottom-3 w-8 h-8 flex items-center justify-center">
            <Loader2 size={15} className="text-[#8B5CF6] animate-spin" />
          </div>
        )}
      </div>

      {/* Examples */}
      <div>
        <p className="text-[10px] text-[#4a5568] mb-2 uppercase tracking-widest">Try saying:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setText(ex)}
              className="text-xs px-2.5 py-1 rounded-lg border border-[#2a3145] bg-[#1e2535] text-[#4a5568] hover:text-[#8892aa] hover:border-[#3a4155] transition-all"
            >
              "{ex}"
            </button>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-[#4a5568]">
        Press <kbd className="px-1 py-0.5 rounded border border-[#2a3145] bg-[#1e2535] text-[10px]">Enter</kbd> to parse · AI will auto-fill the form below
      </p>
    </div>
  )
}
