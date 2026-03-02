import { useState, useRef } from 'react'
import { Loader2, Send, MessageCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { parseIntent, answerQuery } from '../lib/openai'
import { supabase } from '../lib/supabase'
import ConfirmCard from './ConfirmCard'

/** Fetch a live snapshot of all data to give Claude as query context */
async function fetchContext() {
  const now = new Date()
  const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000)
  const cutoffYear = sixtyDaysAgo.getFullYear()
  const cutoffMonth = sixtyDaysAgo.getMonth() + 1

  const [{ data: properties }, { data: units }, { data: tenants }, { data: leases }, { data: payments }] =
    await Promise.all([
      supabase.from('properties').select('*'),
      supabase.from('units').select('*'),
      supabase.from('tenants').select('*'),
      supabase.from('leases').select('*'),
      supabase.from('payments').select('*')
        .or(`year.gt.${cutoffYear},and(year.eq.${cutoffYear},month.gte.${cutoffMonth})`),
    ])

  return {
    properties: properties || [],
    units: units || [],
    tenants: tenants || [],
    leases: leases || [],
    payments: payments || [],
  }
}

export default function AIInput() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(null)   // parsed intent awaiting confirm
  const [answer, setAnswer] = useState(null)     // query answer string
  const inputRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() || loading) return

    setLoading(true)
    setAnswer(null)
    try {
      const intent = await parseIntent(text.trim())

      if (intent.intent === 'query') {
        // Fetch live data and answer directly — no confirm needed
        const ctx = await fetchContext()
        const response = await answerQuery(intent.question, ctx)
        setAnswer(response)
        setText('')
      } else {
        setPending({ intent, raw: text.trim() })
        setText('')
      }
    } catch (err) {
      console.error(err)
      toast.error('AI error: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  function handleDismiss() {
    setPending(null)
    setAnswer(null)
    inputRef.current?.focus()
  }

  return (
    <div>
      {/* Answer bubble (query response) */}
      {answer && (
        <div className="mb-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <MessageCircle size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Answer</p>
            <p className="text-sm text-slate-800 leading-relaxed">{answer}</p>
          </div>
          <button onClick={handleDismiss} className="text-blue-400 hover:text-blue-600 transition-colors">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Confirm card (action intents) */}
      {pending && (
        <div className="mb-3">
          <ConfirmCard parsed={pending.intent} raw={pending.raw} onDone={handleDismiss} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2.5">
          {loading
            ? <Loader2 size={16} className="text-slate-400 animate-spin flex-shrink-0" />
            : <span className="text-slate-400 text-sm flex-shrink-0">AI</span>
          }
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`e.g. "John paid 450k for March, MTN" or "who hasn't paid this month?"`}
            className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="p-2.5 bg-green-600 text-white rounded-xl disabled:opacity-40 hover:bg-green-700 transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
