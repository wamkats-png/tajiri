import { useEffect, useState } from 'react'
import { Users, RefreshCw, Phone } from 'lucide-react'
import { supabase } from '../lib/supabase'
import IDPhotoUpload from '../components/IDPhotoUpload'

export default function Tenants() {
  const [tenants, setTenants] = useState([])
  const [leases, setLeases] = useState([])
  const [units, setUnits] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)

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
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
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
                        ? `UGX ${Number(info.lease.monthly_rent_ugx).toLocaleString()}`
                        : <span className="text-slate-300">—</span>
                      }
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
