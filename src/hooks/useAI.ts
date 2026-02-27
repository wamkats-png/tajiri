import { useCallback } from 'react'
import { useAppStore } from '@/store'
import { fetchAIUsage, incrementAIUsage } from '@/services/firestore'
import { claudeRequest, buildFinancialContext } from '@/services/claude'
import type { ChatMessage } from '@/types'

export function useAIUsage() {
  const { user, aiUsage, setAIUsage, getPlan } = useAppStore()
  const plan = getPlan()

  const canUseAI = plan === 'business' || aiUsage.count < aiUsage.limit

  async function trackUsage() {
    if (!user) return
    const updated = await incrementAIUsage(user.uid, aiUsage)
    setAIUsage(updated)
  }

  const remaining = plan === 'business'
    ? Infinity
    : Math.max(0, aiUsage.limit - aiUsage.count)

  return { canUseAI, remaining, trackUsage, plan }
}

export function useCFOChat() {
  const { user, tracker1, tracker2, expenses, budgets, chatMessages, addChatMessage } = useAppStore()
  const { canUseAI, trackUsage } = useAIUsage()

  const sendMessage = useCallback(async (text: string): Promise<void> => {
    if (!user || !canUseAI) return

    // Add user message
    const userMsg: ChatMessage = {
      id: `${Date.now()}-u`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }
    addChatMessage(userMsg)

    // Build context
    const context = buildFinancialContext(
      [tracker1, tracker2],
      expenses,
      budgets
    )

    // Build message history for Claude (last 10 messages)
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
      await trackUsage()
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `${Date.now()}-e`,
        role: 'assistant',
        content: err.message?.includes('API key')
          ? '⚠️ API key not configured. Add your Anthropic key to .env to enable AI features.'
          : '⚠️ Something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
      }
      addChatMessage(errMsg)
    }
  }, [user, canUseAI, tracker1, tracker2, expenses, budgets, chatMessages])

  return { sendMessage, messages: chatMessages }
}
