import { useState } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function ugx(n) {
  return `UGX ${Number(n).toLocaleString()}`
}

/** Build a human-readable summary of the parsed intent */
function summary(p) {
  switch (p.intent) {
    case 'add_property':
      return `Add property "${p.name}"${p.address ? ` at ${p.address}` : ''}`
    case 'add_unit':
      return `Add unit "${p.unit_name}" to property "${p.property_name}"`
    case 'add_tenant':
      return `Add tenant "${p.name}"${p.phone ? ` (${p.phone})` : ''}`
    case 'assign_tenant':
      return `Assign ${p.tenant_name} to unit ${p.unit_name} in ${p.property_name} — ${ugx(p.monthly_rent_ugx)}/month from ${p.start_date}`
    case 'record_payment':
      return `Record payment of ${ugx(p.amount_ugx)} from ${p.tenant_name} for ${MONTHS[p.month]} ${p.year}${p.method ? ` via ${p.method.toUpperCase()}` : ''}`
    case 'query':
      return `Query: ${p.question}`
    default:
      return p.message || 'Unknown action'
  }
}

/** Execute the confirmed action against Supabase */
async function executeIntent(parsed) {
  const p = parsed

  if (p.intent === 'add_property') {
    const { error } = await supabase.from('properties').insert({ name: p.name, address: p.address })
    if (error) throw error
    return `Property "${p.name}" added`
  }

  if (p.intent === 'add_unit') {
    // find property by name
    const { data: props, error: pe } = await supabase
      .from('properties').select('id').ilike('name', p.property_name).limit(1)
    if (pe) throw pe
    if (!props?.length) throw new Error(`Property "${p.property_name}" not found`)
    const { error } = await supabase.from('units').insert({
      property_id: props[0].id,
      unit_name: p.unit_name,
      status: 'vacant',
    })
    if (error) throw error
    return `Unit "${p.unit_name}" added to ${p.property_name}`
  }

  if (p.intent === 'add_tenant') {
    const { error } = await supabase.from('tenants').insert({
      name: p.name, phone: p.phone, national_id: p.national_id,
    })
    if (error) throw error
    return `Tenant "${p.name}" added`
  }

  if (p.intent === 'assign_tenant') {
    // find tenant
    const { data: tenants } = await supabase.from('tenants').select('id').ilike('name', `%${p.tenant_name}%`).limit(1)
    if (!tenants?.length) throw new Error(`Tenant "${p.tenant_name}" not found`)
    // find unit
    const { data: units } = await supabase
      .from('units')
      .select('id, properties(name)')
      .ilike('unit_name', p.unit_name)
      .limit(1)
    if (!units?.length) throw new Error(`Unit "${p.unit_name}" not found`)

    const { error: le } = await supabase.from('leases').insert({
      unit_id: units[0].id,
      tenant_id: tenants[0].id,
      start_date: p.start_date,
      monthly_rent_ugx: p.monthly_rent_ugx,
      status: 'active',
    })
    if (le) throw le
    // mark unit occupied
    await supabase.from('units').update({ status: 'occupied' }).eq('id', units[0].id)
    return `${p.tenant_name} assigned to unit ${p.unit_name}`
  }

  if (p.intent === 'record_payment') {
    // find lease via tenant name
    const { data: tenants } = await supabase.from('tenants').select('id').ilike('name', `%${p.tenant_name}%`).limit(1)
    if (!tenants?.length) throw new Error(`Tenant "${p.tenant_name}" not found`)
    const { data: leases } = await supabase
      .from('leases').select('id').eq('tenant_id', tenants[0].id).eq('status', 'active').limit(1)
    if (!leases?.length) throw new Error(`No active lease for "${p.tenant_name}"`)

    const { error } = await supabase.from('payments').insert({
      lease_id: leases[0].id,
      amount_ugx: p.amount_ugx,
      month: p.month,
      year: p.year,
      paid_date: new Date().toISOString().slice(0, 10),
      method: p.method,
      notes: p.notes,
    })
    if (error) throw error
    return `Payment of ${ugx(p.amount_ugx)} recorded for ${p.tenant_name}`
  }

  if (p.intent === 'query') {
    return `Query mode not yet supported via this card. Try the Payments or Tenants page.`
  }

  return 'Action completed'
}

export default function ConfirmCard({ parsed, raw, onDone }) {
  const [loading, setLoading] = useState(false)

  if (parsed.intent === 'unknown') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <XCircle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-amber-800">{parsed.message || "I didn't understand that. Try rephrasing."}</p>
          <button onClick={onDone} className="mt-2 text-xs text-amber-600 underline">Dismiss</button>
        </div>
      </div>
    )
  }

  async function confirm() {
    setLoading(true)
    try {
      const msg = await executeIntent(parsed)
      toast.success(msg)
      window.dispatchEvent(new CustomEvent('landlord:refresh'))
      onDone()
    } catch (err) {
      toast.error(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
      <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">Confirm action</p>
      <p className="text-sm text-slate-800 mb-3">{summary(parsed)}</p>
      <div className="flex gap-2">
        <button
          onClick={confirm}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          Confirm
        </button>
        <button
          onClick={onDone}
          disabled={loading}
          className="px-4 py-1.5 text-sm text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
