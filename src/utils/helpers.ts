import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { CURRENCIES } from './constants'

// ─── Tailwind class merger ────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Currency formatting ──────────────────────────────────────────────────────

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode)
  const symbol = currency?.symbol ?? currencyCode

  if (currencyCode === 'UGX' || currencyCode === 'TZS' || currencyCode === 'RWF') {
    return `${symbol} ${Math.round(amount).toLocaleString()}`
  }

  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCIES.find(c => c.code === currencyCode)?.symbol ?? currencyCode
}

export function getCurrencyFlag(currencyCode: string): string {
  return CURRENCIES.find(c => c.code === currencyCode)?.flag ?? '💱'
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-UG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateShort(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-UG', {
    day: 'numeric',
    month: 'short',
  })
}

export function getCurrentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-UG', { month: 'long', year: 'numeric' })
}

export function startOfMonth(date = new Date()): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime()
}

export function endOfMonth(date = new Date()): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).getTime()
}

// ─── Number helpers ───────────────────────────────────────────────────────────

export function parseAmount(raw: string): number {
  // Handle "45k" => 45000, "1.5m" => 1500000
  const cleaned = raw.trim().toLowerCase()
  const multipliers: Record<string, number> = { k: 1000, m: 1000000, b: 1000000000 }
  const match = cleaned.match(/^([\d.,]+)([kmb]?)$/)
  if (!match) return parseFloat(cleaned.replace(/,/g, '')) || 0
  const base = parseFloat(match[1].replace(/,/g, ''))
  const mult = multipliers[match[2]] ?? 1
  return base * mult
}

export function clampPercent(value: number, total: number): number {
  if (total === 0) return 0
  return Math.min(100, Math.round((value / total) * 100))
}

// ─── ID generator ─────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── Plan check ───────────────────────────────────────────────────────────────

export function isPlanFeature(plan: string, feature: string): boolean {
  const { PLAN_LIMITS } = require('./constants')
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]
  if (!limits) return false
  return !!(limits as Record<string, unknown>)[feature]
}

// ─── String helpers ───────────────────────────────────────────────────────────

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '…' : str
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}
