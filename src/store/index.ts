import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  UserProfile, Tracker, TrackerSlot, Expense, Budget,
  AIUsage, ChatMessage, Plan, GatedFeature, TokenState,
} from '@/types'
import { INITIAL_TOKEN_STATE } from '@/types'

interface AppState {
  user: UserProfile | null
  tokenState: TokenState
  tracker1: Tracker | null
  tracker2: Tracker | null
  activeTrackerSlot: TrackerSlot
  expenses: Expense[]
  budgets: Budget[]
  aiUsage: AIUsage
  chatMessages: ChatMessage[]

  setUser: (user: UserProfile | null) => void
  setTokenState: (state: TokenState) => void
  setTracker: (slot: TrackerSlot, tracker: Tracker | null) => void
  setActiveTracker: (slot: TrackerSlot) => void
  setExpenses: (expenses: Expense[]) => void
  setBudgets: (budgets: Budget[]) => void
  setAIUsage: (usage: AIUsage) => void
  addChatMessage: (msg: ChatMessage) => void
  clearChat: () => void
  addExpense: (e: Expense) => void
  removeExpense: (id: string) => void
  addBudget: (b: Budget) => void
  removeBudget: (id: string) => void

  // Always returns 'business' — all features unlocked
  getPlan: () => Plan
  // Always returns true — no gates
  canAccess: (feature: GatedFeature) => boolean
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      tokenState: INITIAL_TOKEN_STATE,
      tracker1: null,
      tracker2: null,
      activeTrackerSlot: 'tracker1',
      expenses: [],
      budgets: [],
      aiUsage: { count: 0, limit: 999999, resetAt: '' },
      chatMessages: [],

      setUser:          (user) => set({ user }),
      setTokenState:    (tokenState) => set({ tokenState }),
      setTracker:       (slot, tracker) => set({ [slot]: tracker }),
      setActiveTracker: (slot) => set({ activeTrackerSlot: slot }),
      setExpenses:      (expenses) => set({ expenses }),
      setBudgets:       (budgets) => set({ budgets }),
      setAIUsage:       (aiUsage) => set({ aiUsage }),
      addChatMessage:   (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      clearChat:        () => set({ chatMessages: [] }),
      addExpense:       (e) => set((s) => ({ expenses: [e, ...s.expenses] })),
      removeExpense:    (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),
      addBudget:        (b) => set((s) => ({ budgets: [...s.budgets, b] })),
      removeBudget:     (id) => set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) })),

      // Always business — all features free
      getPlan:    () => 'business',
      canAccess:  () => true,
    }),
    {
      name: 'tajiri-store',
      partialize: (s) => ({
        user: s.user,
        tracker1: s.tracker1,
        tracker2: s.tracker2,
        activeTrackerSlot: s.activeTrackerSlot,
        aiUsage: s.aiUsage,
        chatMessages: s.chatMessages,
      }),
    }
  )
)
