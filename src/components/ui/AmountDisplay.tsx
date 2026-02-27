import { getCurrencySymbol } from '@/utils'

interface AmountDisplayProps {
  amount: number
  currency: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  className?: string
  showSign?: boolean
}

export function AmountDisplay({ amount, currency, size = 'md', color, className = '', showSign }: AmountDisplayProps) {
  const symbol = getCurrencySymbol(currency)
  const isLarge = ['UGX', 'TZS', 'RWF'].includes(currency)

  const formatted = isLarge
    ? Math.round(amount).toLocaleString()
    : amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
  }

  const fontStyles = size === 'xl' || size === 'lg'
    ? { fontFamily: 'Syne, sans-serif', fontWeight: 700 }
    : {}

  return (
    <span
      className={`font-semibold ${sizes[size]} ${className}`}
      style={{ color: color ?? '#f0f4ff', ...fontStyles }}
    >
      {showSign && amount > 0 && '+'}
      {symbol}{formatted}
    </span>
  )
}
