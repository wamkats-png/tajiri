// ─── User & Auth ─────────────────────────────────────────────────────────────

export type Plan = 'free' | 'business'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  plan: Plan
  defaultCurrency: string
  createdAt: string
  updatedAt: string
}

// ─── Trackers ─────────────────────────────────────────────────────────────────

export type TrackerSlot = 'tracker1' | 'tracker2'

export interface Tracker {
  id: TrackerSlot
  name: string
  active: boolean
  currency: string
  color: string
  locked: boolean
  createdAt: string
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'utilities'
  | 'rent'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'shopping'
  | 'salary'
  | 'business'
  | 'savings'
  | 'other'

export type EntryMethod = 'manual' | 'receipt' | 'natural_language'

export interface Expense {
  id: string
  trackerId: TrackerSlot
  amount: number
  currency: string
  amountUSD?: number
  category: ExpenseCategory
  description: string
  date: string
  receiptUrl?: string
  entryMethod: EntryMethod
  aiParsed?: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

// ─── Budgets ──────────────────────────────────────────────────────────────────

export type BudgetPeriod = 'monthly' | 'weekly' | 'yearly'

export interface Budget {
  id: string
  trackerId: TrackerSlot
  category: ExpenseCategory
  amount: number
  currency: string
  period: BudgetPeriod
  createdAt: string
  updatedAt: string
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AIUsage {
  count: number
  resetDate: string
  limit: number
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export interface CurrencyRate {
  code: string
  name: string
  rate: number
}

export const SUPPORTED_CURRENCIES = [
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'Fr' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
] as const

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code']

// ─── Feature Gates ────────────────────────────────────────────────────────────

export type GatedFeature =
  | 'tracker2'
  | 'receipt_scan'
  | 'natural_language'
  | 'ai_chat_unlimited'
  | 'reports'
  | 'csv_export'
  | 'rename_tracker'
  | 'spending_insights'

export const FEATURE_GATES: Record<GatedFeature, Plan> = {
  tracker2: 'business',
  receipt_scan: 'business',
  natural_language: 'business',
  ai_chat_unlimited: 'business',
  reports: 'business',
  csv_export: 'business',
  rename_tracker: 'business',
  spending_insights: 'business',
}
