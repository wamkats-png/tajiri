import { format, formatDistanceToNow, startOfMonth, endOfMonth } from 'date-fns'
import { CURRENCIES, EXPENSE_CATEGORIES } from './constants'
import type { ExpenseCategory } from '@/types'

// ─── Currency ─────────────────────────────────────────────────────────────────

export function getCurrencySymbol(code: string): string {
  const found = CURRENCIES.find((c) => c.code === code)
  return found?.symbol ?? code
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode)
  const isWhole = ['UGX', 'TZS', 'RWF'].includes(currencyCode)
  if (isWhole) return `${symbol} ${Math.round(amount).toLocaleString()}`
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Date ─────────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  try { return format(new Date(dateStr), 'MMM d, yyyy') } catch { return dateStr }
}

export function formatDateShort(dateStr: string): string {
  try { return format(new Date(dateStr), 'MMM d') } catch { return dateStr }
}

export function timeAgo(dateStr: string): string {
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }) } catch { return dateStr }
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function isCurrentMonth(dateStr: string): boolean {
  const d = new Date(dateStr), n = new Date()
  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function getCategoryMeta(category: string) {
  return EXPENSE_CATEGORIES.find((c) => c.id === category) ?? {
    id: 'other', label: 'Other', icon: '📦', color: '#94A3B8'
  }
}

// ─── IDs ──────────────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── Numbers ──────────────────────────────────────────────────────────────────

export function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val))
}

export function pct(part: number, total: number) {
  if (!total) return 0
  return clamp((part / total) * 100, 0, 100)
}
