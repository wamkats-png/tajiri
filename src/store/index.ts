import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  UserProfile,
  Tracker,
  Expense,
  Budget,
  ChatMessage,
  AIUsage,
  Plan,
  GatedFeature,
  TrackerSlot,
} from '@/types'
import { FEATURE_GATES } from '@/types'

interface AppState {
  // Auth
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void

  // Trackers
  tracker1: Tracker | null
  tracker2: Tracker | null
  setTracker: (slot: TrackerSlot, tracker: Tracker | null) => void
  activeTrackerSlot: TrackerSlot
  setActiveTrackerSlot: (slot: TrackerSlot) => void

  // Expenses (cached locally, source of truth is Firestore)
  expenses: Expense[]
  setExpenses: (expenses: Expense[]) => void
  addExpense: (expense: Expense) => void
  removeExpense: (id: string) => void

  // Budgets
  budgets: Budget[]
  setBudgets: (budgets: Budget[]) => void
  addBudget: (budget: Budget) => void
  removeBudget: (id: string) => void

  // AI Chat
  chatMessages: ChatMessage[]
  addChatMessage: (msg: ChatMessage) => void
  clearChat: () => void
  aiUsage: AIUsage
  setAIUsage: (usage: AIUsage) => void

  // UI State
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  // Feature Gating
  canAccess: (feature: GatedFeature) => boolean
  getPlan: () => Plan
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      setUser: (user) => set({ user }),

      // Trackers
      tracker1: null,
      tracker2: null,
      setTracker: (slot, tracker) =>
        set({ [slot]: tracker }),
      activeTrackerSlot: 'tracker1',
      setActiveTrackerSlot: (slot) => set({ activeTrackerSlot: slot }),

      // Expenses
      expenses: [],
      setExpenses: (expenses) => set({ expenses }),
      addExpense: (expense) =>
        set((s) => ({ expenses: [expense, ...s.expenses] })),
      removeExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      // Budgets
      budgets: [],
      setBudgets: (budgets) => set({ budgets }),
      addBudget: (budget) =>
        set((s) => ({ budgets: [budget, ...s.budgets] })),
      removeBudget: (id) =>
        set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) })),

      // AI Chat
      chatMessages: [],
      addChatMessage: (msg) =>
        set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      clearChat: () => set({ chatMessages: [] }),
      aiUsage: {
        count: 0,
        resetDate: new Date().toISOString(),
        limit: 10,
      },
      setAIUsage: (aiUsage) => set({ aiUsage }),

      // UI
      sidebarOpen: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      // Feature Gating
      getPlan: () => get().user?.plan ?? 'free',
      canAccess: (feature: GatedFeature) => {
        const plan = get().getPlan()
        const required = FEATURE_GATES[feature]
        if (required === 'free') return true
        if (required === 'business') return plan === 'business'
        return false
      },
    }),
    {
      name: 'tajiri-store',
      partialize: (state) => ({
        activeTrackerSlot: state.activeTrackerSlot,
        chatMessages: state.chatMessages,
        aiUsage: state.aiUsage,
      }),
    }
  )
)
