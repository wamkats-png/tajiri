// ─── Plan Limits ──────────────────────────────────────────────────────────────

export const PLAN_LIMITS = {
  free: {
    trackers: 1,
    aiInteractionsPerMonth: 10,
    canRenameTrackers: false,
    canScanReceipts: false,
    canUseNaturalLanguage: false,
    canExportCSV: false,
    canAccessReports: false,
    canAccessInsights: false,
  },
  business: {
    trackers: 2,
    aiInteractionsPerMonth: Infinity,
    canRenameTrackers: true,
    canScanReceipts: true,
    canUseNaturalLanguage: true,
    canExportCSV: true,
    canAccessReports: true,
    canAccessInsights: true,
  },
} as const

// ─── Expense Categories ───────────────────────────────────────────────────────

export const EXPENSE_CATEGORIES = [
  { id: 'food',          label: 'Food & Dining',        icon: '🍽️', color: '#F59E0B' },
  { id: 'transport',     label: 'Transport & Fuel',      icon: '🚗', color: '#3B82F6' },
  { id: 'utilities',     label: 'Utilities & Bills',     icon: '⚡', color: '#8B5CF6' },
  { id: 'rent',          label: 'Housing & Rent',        icon: '🏠', color: '#EF4444' },
  { id: 'health',        label: 'Health & Medical',      icon: '💊', color: '#10B981' },
  { id: 'education',     label: 'Education',             icon: '📚', color: '#06B6D4' },
  { id: 'entertainment', label: 'Entertainment',         icon: '🎮', color: '#F97316' },
  { id: 'shopping',      label: 'Shopping',              icon: '🛍️', color: '#EC4899' },
  { id: 'salary',        label: 'Salary / Income',       icon: '💰', color: '#0A7163' },
  { id: 'business',      label: 'Business Operations',   icon: '💼', color: '#64748B' },
  { id: 'savings',       label: 'Savings & Investment',  icon: '🏦', color: '#0D9B87' },
  { id: 'other',         label: 'Other',                 icon: '📦', color: '#94A3B8' },
] as const

// ─── Currencies ───────────────────────────────────────────────────────────────

export const CURRENCIES = [
  { code: 'UGX', name: 'Ugandan Shilling',    symbol: 'USh', flag: '🇺🇬' },
  { code: 'KES', name: 'Kenyan Shilling',      symbol: 'KSh', flag: '🇰🇪' },
  { code: 'TZS', name: 'Tanzanian Shilling',   symbol: 'TSh', flag: '🇹🇿' },
  { code: 'RWF', name: 'Rwandan Franc',        symbol: 'Fr',  flag: '🇷🇼' },
  { code: 'USD', name: 'US Dollar',            symbol: '$',   flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro',                 symbol: '€',   flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound',        symbol: '£',   flag: '🇬🇧' },
  { code: 'ZAR', name: 'South African Rand',   symbol: 'R',   flag: '🇿🇦' },
  { code: 'NGN', name: 'Nigerian Naira',       symbol: '₦',   flag: '🇳🇬' },
  { code: 'GHS', name: 'Ghanaian Cedi',        symbol: '₵',   flag: '🇬🇭' },
]

// ─── Tracker Colors ───────────────────────────────────────────────────────────

export const TRACKER_COLORS = [
  '#0A7163', '#3B82F6', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#10B981', '#F97316',
]

// ─── Tracker Types ────────────────────────────────────────────────────────────

export const TRACKER_TYPES = [
  { id: 'personal',  label: 'Personal / Home', icon: '🏠' },
  { id: 'business',  label: 'Business',         icon: '💼' },
  { id: 'savings',   label: 'Savings Goal',     icon: '🎯' },
  { id: 'other',     label: 'Other',            icon: '📋' },
] as const

// ─── Routes ───────────────────────────────────────────────────────────────────

export const ROUTES = {
  LOGIN:       '/login',
  SIGNUP:      '/signup',
  ONBOARDING:  '/onboarding',
  DASHBOARD:   '/dashboard',
  TRACKER:     '/tracker/:slot',
  ADD_EXPENSE: '/add-expense',
  BUDGETS:     '/budgets',
  CHAT:        '/chat',
  REPORTS:     '/reports',
  SETTINGS:    '/settings',
  UPGRADE:     '/upgrade',
} as const
