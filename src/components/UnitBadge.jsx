export default function UnitBadge({ unit }) {
  const occupied = unit.status === 'occupied'
  return (
    <div className={`px-3 py-2 rounded-lg text-sm border ${
      occupied
        ? 'bg-green-50 border-green-200 text-green-800'
        : 'bg-slate-50 border-slate-200 text-slate-500'
    }`}>
      <p className="font-medium">{unit.unit_name}</p>
      <p className="text-xs mt-0.5">{occupied ? 'Occupied' : 'Vacant'}</p>
    </div>
  )
}
