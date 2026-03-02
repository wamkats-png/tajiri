import { useState } from 'react'
import { MapPin, ChevronDown, ChevronUp, X, Phone } from 'lucide-react'
import UnitBadge from './UnitBadge'

export default function PropertyCard({ property, units, leases = [], tenants = [] }) {
  const [expanded, setExpanded] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const occupied = units.filter(u => u.status === 'occupied').length

  function getTenantForUnit(unit) {
    const lease = leases.find(l => l.unit_id === unit.id)
    if (!lease) return null
    const tenant = tenants.find(t => t.id === lease.tenant_id)
    return tenant ? { tenant, lease } : null
  }

  function handleUnitClick(unit) {
    if (unit.status !== 'occupied') return
    setSelectedUnit(prev => prev?.id === unit.id ? null : unit)
  }

  const selectedInfo = selectedUnit ? getTenantForUnit(selectedUnit) : null

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => { setExpanded(x => !x); setSelectedUnit(null) }}
        className="w-full text-left px-5 py-4 flex items-start justify-between hover:bg-slate-50 transition-colors"
      >
        <div>
          <h3 className="font-semibold text-slate-800">{property.name}</h3>
          {property.address && (
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin size={11} /> {property.address}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1">
            {occupied}/{units.length} occupied
          </p>
        </div>
        {expanded
          ? <ChevronUp size={16} className="text-slate-400 mt-1" />
          : <ChevronDown size={16} className="text-slate-400 mt-1" />}
      </button>

      {/* Units grid */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4">
          {units.length === 0 ? (
            <p className="text-sm text-slate-400">
              {`No units yet. Try: "Add unit 1A to ${property.name}"`}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {units.map(u => (
                <UnitBadge
                  key={u.id}
                  unit={u}
                  active={selectedUnit?.id === u.id}
                  onClick={() => handleUnitClick(u)}
                />
              ))}
            </div>
          )}

          {/* Tenant detail inline card */}
          {selectedUnit && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                  {selectedUnit.unit_name} — Tenant
                </p>
                {selectedInfo ? (
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-800">{selectedInfo.tenant.name}</p>
                    {selectedInfo.tenant.phone && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone size={10} /> {selectedInfo.tenant.phone}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">
                      {`UGX ${Number(selectedInfo.lease.monthly_rent_ugx).toLocaleString()}/month · since ${selectedInfo.lease.start_date}`}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Tenant info unavailable</p>
                )}
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="text-green-400 hover:text-green-600 transition-colors ml-3 mt-0.5"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
