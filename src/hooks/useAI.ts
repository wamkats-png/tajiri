import { useCallback } from 'react'
import { useAppStore } from '@/store'
import { claudeRequest, buildFinancialContext } from '@/services/claude'
import type { ChatMessage } from '@/types'

export function useAIUsage() {
  return {
    canUseAI: true,
    remaining: Infinity,
    trackUsage: async () => {},
    plan: 'free' as const,
  }
}

export function useCFOChat() {
  const { user, tracker1, tracker2, expenses, budgets, chatMessages, addChatMessage } = useAppStore()

  const sendMessage = useCallback(async (text: string): Promise<void> => {
    if (!user) return

    const userMsg: ChatMessage = {
      id: `${Date.now()}-u`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }
    addChatMessage(userMsg)

    const context = buildFinancialContext(
      [tracker1, tracker2],
      expenses,
      budgets
    )

    const history = chatMessages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }))
    history.push({ role: 'user', content: text })

    try {
      const reply = await claudeRequest(
        history,
        `You are a personal AI financial advisor embedded in Tajiri, a smart budgeting app.
You have access to the user's real financial data below. Be concise, friendly, and actionable.
Never make up numbers — only reference the data provided.

${context}`,
        1024
      )

      const assistantMsg: ChatMessage = {
        id: `${Date.now()}-a`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      }
      addChatMessage(assistantMsg)
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `${Date.now()}-e`,
        role: 'assistant',
        content: err.message?.includes('API key')
          ? '⚠️ Anthropic API key not configured. Add VITE_ANTHROPIC_API_KEY to your environment variables.'
          : '⚠️ Something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
      }
      addChatMessage(errMsg)
    }
  }, [user, tracker1, tracker2, expenses, budgets, chatMessages])

  return { sendMessage, messages: chatMessages }
}
