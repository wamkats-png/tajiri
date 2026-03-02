import { useEffect, useState } from 'react'
import { Building2, Users, DoorOpen, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

function ugx(n) {
  return `UGX ${Number(n).toLocaleString()}`
}

function StatCard({ icon: Icon, label, value, sub, color = 'slate' }) {
  const colors = {
    slate: 'bg-white border-slate-200 text-slate-800',
    green: 'bg-green-50 border-green-100 text-green-800',
    red:   'bg-red-50 border-red-100 text-red-700',
    blue:  'bg-blue-50 border-blue-100 text-blue-800',
  }
  return (
    <div className={`border rounded-xl p-5 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="opacity-60" />
        <p className="text-xs font-medium opacity-60 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [unpaid, setUnpaid] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  async function load() {
    setLoading(true)
    const [{ data: units }, { data: leases }, { data: payments }, { data: tenants }] = await Promise.all([
      supabase.from('units').select('id, status'),
      supabase.from('leases').select('id, monthly_rent_ugx, tenant_id').eq('status', 'active'),
      supabase.from('payments').select('lease_id, amount_ugx').eq('month', month).eq('year', year),
      supabase.from('tenants').select('id, name'),
    ])

    const totalUnits = units?.length || 0
    const occupied = units?.filter(u => u.status === 'occupied').length || 0
    const vacant = totalUnits - occupied

    const totalDue = leases?.reduce((s, l) => s + l.monthly_rent_ugx, 0) || 0
    const totalPaid = payments?.reduce((s, p) => s + p.amount_ugx, 0) || 0
    const outstanding = totalDue - totalPaid

    // Unpaid tenants this month
    const paidLeaseIds = new Set(payments?.map(p => p.lease_id))
    const unpaidLeases = leases?.filter(l => !paidLeaseIds.has(l.id)) || []
    const unpaidWithNames = unpaidLeases.map(l => ({
      ...l,
      tenantName: tenants?.find(t => t.id === l.tenant_id)?.name || 'Unknown',
    }))

    setStats({ totalUnits, occupied, vacant, totalDue, totalPaid, outstanding })
    setUnpaid(unpaidWithNames)
    setLoading(false)
  }

  useEffect(() => {
    load()
    window.addEventListener('landlord:refresh', load)
    return () => window.removeEventListener('landlord:refresh', load)
  }, [])

  if (loading) return <div className="text-slate-400 text-sm p-4">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {now.toLocaleString('en-UG', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={load} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <RefreshCw size={16} className="text-slate-500" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-3">
        <StatCard icon={Building2} label="Total Units" value={stats.totalUnits} />
        <StatCard icon={DoorOpen}  label="Occupied"   value={stats.occupied}   color="green" />
        <StatCard icon={DoorOpen}  label="Vacant"     value={stats.vacant}     />
        <StatCard icon={TrendingUp} label="Rent Due"  value={ugx(stats.totalDue)}  sub="this month" />
        <StatCard icon={TrendingUp} label="Collected" value={ugx(stats.totalPaid)} color="green" sub="this month" />
        <StatCard icon={AlertCircle} label="Outstanding" value={ugx(stats.outstanding)} color={stats.outstanding > 0 ? 'red' : 'green'} />
      </div>

      {/* Unpaid tenants */}
      {unpaid.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <AlertCircle size={15} className="text-red-500" />
            Unpaid this month ({unpaid.length})
          </h3>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {unpaid.map(l => (
              <div
                key={l.id}
                className="flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-red-50 cursor-pointer transition-colors"
                onClick={() => navigate('/payments')}
              >
                <p className="text-sm font-medium text-slate-800">{l.tenantName}</p>
                <p className="text-sm text-red-600 font-semibold">{ugx(l.monthly_rent_ugx)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {unpaid.length === 0 && stats.totalUnits > 0 && (
        <div className="text-center py-10 bg-green-50 border border-green-100 rounded-xl">
          <p className="text-green-700 font-semibold">All tenants paid this month!</p>
        </div>
      )}

      {stats.totalUnits === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Building2 size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">No data yet</p>
          <p className="text-sm mt-1">Start by adding a property in the AI bar below</p>
        </div>
      )}
    </div>
  )
}
