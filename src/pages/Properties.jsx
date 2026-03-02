import { useEffect, useState } from 'react'
import { Building2, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import PropertyCard from '../components/PropertyCard'

export default function Properties() {
  const [properties, setProperties] = useState([])
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)

  const [leases, setLeases] = useState([])
  const [tenants, setTenants] = useState([])

  async function load() {
    setLoading(true)
    const [{ data: props }, { data: units }, { data: leases }, { data: tenants }] = await Promise.all([
      supabase.from('properties').select('*').order('created_at'),
      supabase.from('units').select('*').order('unit_name'),
      supabase.from('leases').select('*').eq('status', 'active'),
      supabase.from('tenants').select('id, name, phone'),
    ])
    setProperties(props || [])
    setUnits(units || [])
    setLeases(leases || [])
    setTenants(tenants || [])
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
          <h2 className="text-xl font-bold text-slate-800">Properties</h2>
          <p className="text-sm text-slate-500 mt-0.5">Use the AI bar below to add properties and units</p>
        </div>
        <button onClick={load} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <RefreshCw size={16} className="text-slate-500" />
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 size={40} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No properties yet</p>
          <p className="text-slate-400 text-sm mt-1">Try typing: "Add a property called Nakawa Flats on Jinja Road"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map(p => (
            <PropertyCard
              key={p.id}
              property={p}
              units={units.filter(u => u.property_id === p.id)}
              leases={leases}
              tenants={tenants}
            />
          ))}
        </div>
      )}
    </div>
  )
}
