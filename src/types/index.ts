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

export type TrackerSlot = 'tracker1' | 'tracker2'

export interface Tracker {
  id: TrackerSlot
  userId: string
  name: string
  color: string
  currency: string
  type: 'personal' | 'business' | 'savings' | 'other'
  createdAt: string
  updatedAt: string
}

export type ExpenseCategory =
  | 'food' | 'transport' | 'utilities' | 'rent' | 'health'
  | 'education' | 'entertainment' | 'shopping' | 'salary'
  | 'business' | 'savings' | 'other'

export type EntryMethod = 'manual' | 'receipt' | 'nl'

export interface Expense {
  id: string
  trackerId: TrackerSlot
  userId: string
  description: string
  amount: number
  currency: string
  category: ExpenseCategory
  date: string
  notes?: string
  entryMethod?: EntryMethod
  aiParsed?: boolean
  receiptUrl?: string
  createdAt: string
  updatedAt: string
}

export type BudgetPeriod = 'monthly' | 'weekly' | 'yearly'

export interface Budget {
  id: string
  trackerId: TrackerSlot
  userId: string
  category: ExpenseCategory
  amount: number
  currency: string
  period: BudgetPeriod
  createdAt: string
  updatedAt: string
}

export interface AIUsage {
  count: number
  limit: number
  resetAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export type GatedFeature =
  | 'tracker2'
  | 'receipt_scan'
  | 'natural_language'
  | 'ai_chat_unlimited'
  | 'reports'
  | 'csv_export'
  | 'rename_tracker'
  | 'spending_insights'

// ─── Auth token types ────────────────────────────────────────────────────────

export interface TokenState {
  /** Whether a valid token is currently held */
  isAuthenticated: boolean
  /** When the current token was issued */
  issuedAt: string | null
  /** When the current token expires */
  expiresAt: string | null
  /** Whether a rotation is currently in progress */
  isRotating: boolean
  /** How many times the token has been rotated this session */
  rotationCount: number
}

export const INITIAL_TOKEN_STATE: TokenState = {
  isAuthenticated: false,
  issuedAt: null,
  expiresAt: null,
  isRotating: false,
  rotationCount: 0,
}

// ALL features are free — no paywalls
export const FEATURE_GATES: Record<GatedFeature, Plan> = {
  tracker2:          'free',
  receipt_scan:      'free',
  natural_language:  'free',
  ai_chat_unlimited: 'free',
  reports:           'free',
  csv_export:        'free',
  rename_tracker:    'free',
  spending_insights: 'free',
}
