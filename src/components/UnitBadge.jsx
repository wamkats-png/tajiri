export default function UnitBadge({ unit, onClick, active = false }) {
  const occupied = unit.status === 'occupied'
  const clickable = occupied && onClick

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`px-3 py-2 rounded-lg text-sm border transition-all ${
        occupied
          ? active
            ? 'bg-green-200 border-green-400 text-green-900 shadow-sm scale-[1.03]'
            : 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100 hover:border-green-300'
          : 'bg-slate-50 border-slate-200 text-slate-500'
      } ${clickable ? 'cursor-pointer' : ''}`}
    >
      <p className="font-medium">{unit.unit_name}</p>
      <p className="text-xs mt-0.5">{occupied ? 'Occupied' : 'Vacant'}</p>
    </div>
  )
}
