import { useEffect, useState } from 'react'
import { Users, RefreshCw, Phone, X, CreditCard, Calendar, IdCard, Loader2, Pencil, Trash2, DoorOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import IDPhotoUpload from '../components/IDPhotoUpload'

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function ugx(n) {
  return `UGX ${Number(n).toLocaleString()}`
}

/** Modal showing a single tenant's full details + payment history */
function TenantModal({ tenant, leaseInfo, onClose }) {
  const [payments, setPayments] = useState([])
  const [loadingPay, setLoadingPay] = useState(true)

  // Edit state
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(tenant.name)
  const [editPhone, setEditPhone] = useState(tenant.phone || '')
  const [saving, setSaving] = useState(false)

  // End lease state
  const [ending, setEnding] = useState(false)

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchPayments() {
      if (!leaseInfo?.lease) { setLoadingPay(false); return }
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('lease_id', leaseInfo.lease.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
      setPayments(data || [])
      setLoadingPay(false)
    }
    fetchPayments()
  }, [leaseInfo?.lease?.id])

  async function saveEdit() {
    if (!editName.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    const { error } = await supabase.from('tenants').update({
      name: editName.trim(),
      phone: editPhone.trim() || null,
    }).eq('id', tenant.id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Tenant updated')
    window.dispatchEvent(new CustomEvent('landlord:refresh'))
    onClose()
  }

  async function endLease() {
    if (!leaseInfo?.lease) return
    setEnding(true)
    await supabase.from('leases')
      .update({ status: 'ended', end_date: new Date().toISOString().slice(0, 10) })
      .eq('id', leaseInfo.lease.id)
    if (leaseInfo.unit) {
      await supabase.from('units').update({ status: 'vacant' }).eq('id', leaseInfo.unit.id)
    }
    toast.success('Lease ended — unit is now vacant')
    window.dispatchEvent(new CustomEvent('landlord:refresh'))
    setEnding(false)
    onClose()
  }

  async function deleteTenant() {
    setDeleting(true)
    const { error } = await supabase.from('tenants').delete().eq('id', tenant.id)
    setDeleting(false)
    if (error) { toast.error(error.message); return }
    toast.success(`${tenant.name} deleted`)
    window.dispatchEvent(new CustomEvent('landlord:refresh'))
    onClose()
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{tenant.name}</h3>
            <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-slate-500">
              {tenant.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={12} /> {tenant.phone}
                </span>
              )}
              {tenant.national_id && (
                <span className="flex items-center gap-1">
                  <IdCard size={12} /> {tenant.national_id}
                </span>
              )}
              {tenant.date_of_birth && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {tenant.date_of_birth}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Lease summary */}
        {leaseInfo ? (
          <div className="px-6 py-3 bg-green-50 border-b border-green-100 text-sm flex flex-wrap gap-4">
            <span className="text-green-700 font-medium">
              {leaseInfo.prop?.name} · {leaseInfo.unit?.unit_name}
            </span>
            <span className="text-green-600">{ugx(leaseInfo.lease.monthly_rent_ugx)}/month</span>
            <span className="text-green-500">since {leaseInfo.lease.start_date}</span>
          </div>
        ) : (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 text-sm text-slate-400">
            No active lease
          </div>
        )}

        {/* Payment history */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <CreditCard size={13} /> Payment History
          </h4>

          {loadingPay ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-slate-400">No payments recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {MONTHS[p.month]} {p.year}
                    </p>
                    <p className="text-xs text-slate-400">
                      {p.paid_date || '—'}{p.method ? ` · ${p.method.toUpperCase()}` : ''}
                      {p.notes ? ` · ${p.notes}` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-green-700">{ugx(p.amount_ugx)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ID photo if present */}
        {tenant.id_photo_url && (
          <div className="px-6 pb-4">
            <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">National ID</p>
            <img
              src={tenant.id_photo_url}
              alt="National ID"
              className="w-full max-w-xs rounded-lg border border-slate-200 object-cover"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="px-6 pb-5 pt-3 border-t border-slate-100">
          {!editing && !confirmDelete && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Pencil size={11} /> Edit
              </button>
              {leaseInfo?.lease && (
                <button
                  onClick={endLease}
                  disabled={ending}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-50 disabled:opacity-50 transition-colors"
                >
                  {ending
                    ? <Loader2 size={11} className="animate-spin" />
                    : <DoorOpen size={11} />
                  }
                  End Lease
                </button>
              )}
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={11} /> Delete Tenant
              </button>
            </div>
          )}

          {editing && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500">Name</label>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full mt-0.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Phone</label>
                  <input
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full mt-0.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  Save Changes
                </button>
                <button onClick={() => setEditing(false)} className="px-4 py-1.5 text-sm text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {confirmDelete && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-700 mb-3 font-medium">
                Delete <strong>{tenant.name}</strong>? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={deleteTenant}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleting && <Loader2 size={13} className="animate-spin" />}
                  Yes, Delete
                </button>
                <button onClick={() => setConfirmDelete(false)} className="px-4 py-1.5 text-sm text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Tenants() {
  const [tenants, setTenants] = useState([])
  const [leases, setLeases] = useState([])
  const [units, setUnits] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState(null)

  async function load() {
    setLoading(true)
    const [{ data: t }, { data: l }, { data: u }, { data: p }] = await Promise.all([
      supabase.from('tenants').select('*').order('name'),
      supabase.from('leases').select('*').eq('status', 'active'),
      supabase.from('units').select('*'),
      supabase.from('properties').select('*'),
    ])
    setTenants(t || [])
    setLeases(l || [])
    setUnits(u || [])
    setProperties(p || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    window.addEventListener('landlord:refresh', load)
    return () => window.removeEventListener('landlord:refresh', load)
  }, [])

  function getLeaseInfo(tenantId) {
    const lease = leases.find(l => l.tenant_id === tenantId)
    if (!lease) return null
    const unit = units.find(u => u.id === lease.unit_id)
    const prop = unit ? properties.find(p => p.id === unit.property_id) : null
    return { lease, unit, prop }
  }

  if (loading) return <div className="text-slate-400 text-sm p-4">Loading...</div>

  const selectedLeaseInfo = selectedTenant ? getLeaseInfo(selectedTenant.id) : null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tenants</h2>
          <p className="text-sm text-slate-500 mt-0.5">Add via ID photo or the AI bar below</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUpload(x => !x)}
            className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + ID Photo
          </button>
          <button onClick={load} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <RefreshCw size={16} className="text-slate-500" />
          </button>
        </div>
      </div>

      {showUpload && (
        <div className="mb-6">
          <IDPhotoUpload onTenantAdded={() => { load(); setShowUpload(false) }} />
        </div>
      )}

      {tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users size={40} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No tenants yet</p>
          <p className="text-slate-400 text-sm mt-1">
            Upload an ID photo or type: "Add tenant John Kabugo, 0701234567"
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Phone</th>
                <th className="text-left px-5 py-3">Property</th>
                <th className="text-left px-5 py-3">Unit</th>
                <th className="text-right px-5 py-3">Rent/Month</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => {
                const info = getLeaseInfo(t.id)
                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTenant(t)}
                    className="border-b border-slate-50 hover:bg-green-50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-slate-800">{t.name}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {t.phone
                        ? <span className="flex items-center gap-1"><Phone size={11} />{t.phone}</span>
                        : <span className="text-slate-300">—</span>
                      }
                    </td>
                    <td className="px-5 py-3 text-slate-600">{info?.prop?.name || <span className="text-slate-300">—</span>}</td>
                    <td className="px-5 py-3 text-slate-600">{info?.unit?.unit_name || <span className="text-slate-300">—</span>}</td>
                    <td className="px-5 py-3 text-right text-slate-700">
                      {info?.lease
                        ? ugx(info.lease.monthly_rent_ugx)
                        : <span className="text-slate-300">—</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="text-xs text-slate-400 px-5 py-2.5 border-t border-slate-50">
            Click any row to view details, edit, or end lease
          </p>
        </div>
      )}

      {/* Tenant detail modal */}
      {selectedTenant && (
        <TenantModal
          tenant={selectedTenant}
          leaseInfo={selectedLeaseInfo}
          onClose={() => setSelectedTenant(null)}
        />
      )}
    </div>
  )
}
