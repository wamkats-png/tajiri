import { CURRENCIES } from '@/utils/constants'

// Fallback static rates relative to USD (updated periodically)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  UGX: 3700,
  KES: 130,
  TZS: 2600,
  RWF: 1350,
  EUR: 0.92,
  GBP: 0.79,
  ZAR: 18.5,
  NGN: 1600,
  GHS: 15.5,
}

interface RateCache {
  rates: Record<string, number>
  timestamp: number
}

let cache: RateCache | null = null
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

export async function getExchangeRates(): Promise<Record<string, number>> {
  // Return cached if fresh
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.rates
  }

  const apiKey = import.meta.env.VITE_EXCHANGE_RATES_API_KEY
  if (!apiKey) return FALLBACK_RATES

  try {
    const res = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${apiKey}&base=USD`)
    if (!res.ok) throw new Error('Rate fetch failed')
    const data = await res.json()
    const rates = data.rates as Record<string, number>
    cache = { rates, timestamp: Date.now() }
    // Persist to localStorage
    localStorage.setItem('tajiri_rates', JSON.stringify(cache))
    return rates
  } catch {
    // Try localStorage cache
    const stored = localStorage.getItem('tajiri_rates')
    if (stored) {
      const parsed = JSON.parse(stored) as RateCache
      cache = parsed
      return parsed.rates
    }
    return FALLBACK_RATES
  }
}

export async function convert(amount: number, from: string, to: string): Promise<number> {
  if (from === to) return amount
  const rates = await getExchangeRates()
  const fromRate = rates[from] ?? FALLBACK_RATES[from] ?? 1
  const toRate   = rates[to]   ?? FALLBACK_RATES[to]   ?? 1
  // Convert via USD
  const usd = amount / fromRate
  return usd * toRate
}

export async function toUSD(amount: number, currency: string): Promise<number> {
  return convert(amount, currency, 'USD')
}

export function getCurrencyInfo(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? { code, name: code, symbol: code, flag: '🌍' }
}

export function formatWithSymbol(amount: number, currency: string): string {
  const info  = getCurrencyInfo(currency)
  const whole = ['UGX', 'TZS', 'RWF'].includes(currency)
  const num   = whole
    ? Math.round(amount).toLocaleString()
    : amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${info.symbol}${num}`
}
