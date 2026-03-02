import { useState, useRef } from 'react'
import { Loader2, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { parseIntent } from '../lib/openai'
import ConfirmCard from './ConfirmCard'

export default function AIInput() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(null)  // parsed intent awaiting confirm
  const inputRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() || loading) return

    setLoading(true)
    try {
      const intent = await parseIntent(text.trim())
      setPending({ intent, raw: text.trim() })
      setText('')
    } catch (err) {
      console.error(err)
      toast.error('AI error: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  function handleDismiss() {
    setPending(null)
    inputRef.current?.focus()
  }

  return (
    <div>
      {/* Confirm card floats above input */}
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
            placeholder='e.g. "John paid 450k for March, MTN" or "Add unit 3 to Nakawa Flats"'
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
