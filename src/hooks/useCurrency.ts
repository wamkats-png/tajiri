import { useState, useEffect, useCallback } from 'react'
import { getExchangeRates, convert, formatWithSymbol } from '@/services/currency'

export function useCurrencyConverter() {
  const [rates, setRates]     = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getExchangeRates().then((r) => { setRates(r); setLoading(false) })
  }, [])

  const convertAmount = useCallback(
    async (amount: number, from: string, to: string) => convert(amount, from, to),
    []
  )

  return { rates, loading, convert: convertAmount, format: formatWithSymbol }
}

export function useLiveConvert(amount: number, from: string, to: string) {
  const [converted, setConverted] = useState<number | null>(null)
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    if (!amount || from === to) { setConverted(amount); return }
    setLoading(true)
    convert(amount, from, to)
      .then(setConverted)
      .finally(() => setLoading(false))
  }, [amount, from, to])

  return { converted, loading }
}
