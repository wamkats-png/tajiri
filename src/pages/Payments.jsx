import { useEffect, useState } from 'react'
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function ugx(n) {
  return `UGX ${Number(n).toLocaleString()}`
}

export default function Payments() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [rows, setRows] = useState([])   // { tenant, unit, property, lease, payment }
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    // Fetch all active leases with joined data
    const { data: leases } = await supabase
      .from('leases')
      .select('id, monthly_rent_ugx, tenant_id, unit_id')
      .eq('status', 'active')

    if (!leases?.length) { setRows([]); setLoading(false); return }

    const leaseIds = leases.map(l => l.id)
    const tenantIds = [...new Set(leases.map(l => l.tenant_id))]
    const unitIds = [...new Set(leases.map(l => l.unit_id))]

    const [{ data: payments }, { data: tenants }, { data: units }, { data: properties }] = await Promise.all([
      supabase.from('payments').select('*').in('lease_id', leaseIds).eq('month', month).eq('year', year),
      supabase.from('tenants').select('*').in('id', tenantIds),
      supabase.from('units').select('*').in('id', unitIds),
      supabase.from('properties').select('*'),
    ])

    const result = leases.map(lease => {
      const tenant = tenants?.find(t => t.id === lease.tenant_id)
      const unit = units?.find(u => u.id === lease.unit_id)
      const property = properties?.find(p => p.id === unit?.property_id)
      const payment = payments?.find(p => p.lease_id === lease.id)
      return { lease, tenant, unit, property, payment }
    })

    result.sort((a, b) => {
      const pa = a.property?.name || ''
      const pb = b.property?.name || ''
      return pa.localeCompare(pb) || (a.unit?.unit_name || '').localeCompare(b.unit?.unit_name || '')
    })

    setRows(result)
    setLoading(false)
  }

  useEffect(() => {
    load()
    window.addEventListener('landlord:refresh', load)
    return () => window.removeEventListener('landlord:refresh', load)
  }, [month, year])

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const totalDue = rows.reduce((s, r) => s + (r.lease.monthly_rent_ugx || 0), 0)
  const totalPaid = rows.reduce((s, r) => s + (r.payment?.amount_ugx || 0), 0)
  const outstanding = totalDue - totalPaid

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Payments</h2>
          <p className="text-sm text-slate-500 mt-0.5">Use the AI bar to record payments</p>
        </div>
        <button onClick={load} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <RefreshCw size={16} className="text-slate-500" />
        </button>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg">
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-base font-semibold text-slate-700 w-40 text-center">
          {MONTHS[month]} {year}
        </h3>
        <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Total Due</p>
          <p className="text-lg font-bold text-slate-800">{ugx(totalDue)}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-xs text-green-600 mb-1">Collected</p>
          <p className="text-lg font-bold text-green-700">{ugx(totalPaid)}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-xs text-red-500 mb-1">Outstanding</p>
          <p className="text-lg font-bold text-red-600">{ugx(outstanding)}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="font-medium">No active leases found</p>
          <p className="text-sm mt-1">Assign tenants to units to start tracking payments</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3">Tenant</th>
                <th className="text-left px-5 py-3">Property / Unit</th>
                <th className="text-right px-5 py-3">Due</th>
                <th className="text-right px-5 py-3">Paid</th>
                <th className="text-left px-5 py-3">Method</th>
                <th className="text-right px-5 py-3">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ lease, tenant, unit, property, payment }) => {
                const paid = payment?.amount_ugx || 0
                const balance = lease.monthly_rent_ugx - paid
                const rowClass = balance === 0
                  ? 'bg-green-50'
                  : balance < lease.monthly_rent_ugx
                  ? 'bg-amber-50'
                  : ''
                return (
                  <tr key={lease.id} className={`border-b border-slate-100 ${rowClass}`}>
                    <td className="px-5 py-3 font-medium text-slate-800">{tenant?.name || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">
                      <span className="text-slate-500">{property?.name}</span>
                      {unit && <span className="text-slate-400"> · {unit.unit_name}</span>}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-700">{ugx(lease.monthly_rent_ugx)}</td>
                    <td className={`px-5 py-3 text-right font-medium ${paid > 0 ? 'text-green-700' : 'text-slate-300'}`}>
                      {paid > 0 ? ugx(paid) : '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      <span className="capitalize">{payment?.method || '—'}</span>
                      {payment?.paid_date && (
                        <p className="text-xs text-slate-400">{payment.paid_date}</p>
                      )}
                      {payment?.notes && (
                        <p className="text-xs text-slate-400 italic">{payment.notes}</p>
                      )}
                    </td>
                    <td className={`px-5 py-3 text-right font-semibold ${balance === 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {balance === 0 ? '✓' : ugx(balance)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
