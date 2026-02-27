import { useState } from 'react'
import { ArrowLeftRight, RefreshCw } from 'lucide-react'
import { Input } from './Input'
import { useLiveConvert } from '@/hooks/useCurrency'
import { CURRENCIES } from '@/utils/constants'
import { getCurrencyInfo } from '@/services/currency'

export function CurrencyConverter() {
  const [amount, setAmount]   = useState('1000')
  const [from, setFrom]       = useState('UGX')
  const [to, setTo]           = useState('USD')

  const { converted, loading } = useLiveConvert(parseFloat(amount) || 0, from, to)

  const fromInfo = getCurrencyInfo(from)
  const toInfo   = getCurrencyInfo(to)

  function swap() {
    const tmp = from; setFrom(to); setTo(tmp)
  }

  return (
    <div className="rounded-2xl border border-[#2a3145] bg-[#181d27] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#f0f4ff]" style={{ fontFamily: 'Syne, sans-serif' }}>
          Currency Converter
        </h3>
        {loading && <RefreshCw size={13} className="text-[#4a5568] animate-spin" />}
      </div>

      <div className="space-y-3">
        {/* From */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              label={`Amount (${fromInfo.flag} ${from})`}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#8892aa] block mb-1.5">From</label>
            <select
              className="rounded-xl border border-[#2a3145] bg-[#181d27] text-[#f0f4ff] px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A7163]/40 w-24"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            >
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
          </div>
        </div>

        {/* Swap */}
        <div className="flex justify-center">
          <button
            onClick={swap}
            className="w-9 h-9 rounded-xl border border-[#2a3145] bg-[#1e2535] flex items-center justify-center text-[#4a5568] hover:text-[#f0f4ff] hover:bg-[#2a3145] transition-all"
          >
            <ArrowLeftRight size={15} />
          </button>
        </div>

        {/* Result */}
        <div className="rounded-xl border border-[#0A7163]/20 bg-[#0A7163]/5 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#4a5568] mb-1">{toInfo.flag} {to} equivalent</p>
              <p className="text-2xl font-bold text-[#0D9B87]" style={{ fontFamily: 'Syne, sans-serif' }}>
                {loading ? '...' : converted !== null
                  ? `${toInfo.symbol}${['UGX','TZS','RWF'].includes(to) ? Math.round(converted).toLocaleString() : converted.toFixed(2)}`
                  : '—'
                }
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#8892aa] block mb-1.5">To</label>
              <select
                className="rounded-xl border border-[#2a3145] bg-[#181d27] text-[#f0f4ff] px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A7163]/40 w-24"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              >
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
