import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Sparkles, Zap, RotateCcw } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useAppStore } from '@/store'
import { useCFOChat, useAIUsage } from '@/hooks/useAI'

const STARTERS = [
  'How much have I spent this month?',
  'Which category am I overspending on?',
  'Am I on track with my budget?',
  'What are my top 3 expenses this month?',
  'Give me tips to reduce my spending.',
  'Compare my spending to last month.',
]

function ChatBubble({ role, content, timestamp }: { role: string; content: string; timestamp: string }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2.5`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles size={14} className="text-[#8B5CF6]" />
        </div>
      )}
      <div className={`max-w-[82%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-[#0A7163] text-white rounded-tr-sm'
          : 'bg-[#1e2535] border border-[#2a3145] text-[#f0f4ff] rounded-tl-sm'
      }`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        <p className={`text-[10px] mt-1.5 ${isUser ? 'text-[#0D9B87]/70' : 'text-[#4a5568]'}`}>
          {new Date(timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 flex items-center justify-center flex-shrink-0">
        <Sparkles size={14} className="text-[#8B5CF6]" />
      </div>
      <div className="bg-[#1e2535] border border-[#2a3145] rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#4a5568] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ChatUI() {
  const [input, setInput]     = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  const { sendMessage, messages } = useCFOChat()
  const { remaining, plan, canUseAI } = useAIUsage()
  const { clearChat } = useAppStore()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || thinking) return
    setInput('')
    setThinking(true)
    try {
      await sendMessage(msg)
    } finally {
      setThinking(false)
    }
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-xs text-[#4a5568]">AI Financial Advisor · Online</span>
        </div>
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button onClick={clearChat}
              className="flex items-center gap-1.5 text-xs text-[#4a5568] hover:text-[#8892aa] transition-colors">
              <RotateCcw size={11} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center">
              <Sparkles size={28} className="text-[#8B5CF6]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#f0f4ff] mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                Your AI Financial Advisor
              </p>
              <p className="text-xs text-[#4a5568] max-w-xs">
                Ask me anything about your spending, budgets, or savings goals.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => handleSend(s)}
                  className="text-left text-xs px-3 py-2.5 rounded-xl border border-[#2a3145] bg-[#181d27] text-[#8892aa] hover:text-[#f0f4ff] hover:border-[#3a4155] hover:bg-[#1e2535] transition-all leading-relaxed">
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <ChatBubble key={m.id} role={m.role} content={m.content} timestamp={m.timestamp} />
            ))}
            {thinking && <TypingIndicator />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 pt-3 border-t border-[#2a3145]">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Ask about your finances..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={thinking}
              className="flex-1 rounded-xl border border-[#2a3145] bg-[#181d27] text-[#f0f4ff] px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30 focus:border-[#8B5CF6]/40 placeholder:text-[#4a5568] transition-all max-h-32"
              style={{ fieldSizing: 'content' } as any}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || thinking}
              className="w-11 h-11 rounded-xl bg-[#8B5CF6] flex items-center justify-center hover:bg-[#7C3AED] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0"
            >
              {thinking ? <Spinner size={16} color="white" /> : <Send size={16} className="text-white" />}
            </button>
          </div>
        <p className="text-[10px] text-[#2a3145] text-center mt-2">
          AI responses are for informational purposes only.
        </p>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <AppShell title="AI Advisor">
      <ChatUI />
    </AppShell>
  )
}
