import { useState } from 'react'
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import UnitBadge from './UnitBadge'

export default function PropertyCard({ property, units }) {
  const [expanded, setExpanded] = useState(false)
  const occupied = units.filter(u => u.status === 'occupied').length

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(x => !x)}
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
        {expanded ? <ChevronUp size={16} className="text-slate-400 mt-1" /> : <ChevronDown size={16} className="text-slate-400 mt-1" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4">
          {units.length === 0 ? (
            <p className="text-sm text-slate-400">No units yet. Try: "Add unit 1A to {property.name}"</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {units.map(u => <UnitBadge key={u.id} unit={u} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
