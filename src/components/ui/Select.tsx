import { type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#8892aa]">{label}</label>}
      <select
        className={`
          w-full rounded-xl border bg-[#181d27] text-[#f0f4ff] px-4 py-3 text-sm
          transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent
          ${error
            ? 'border-[#EF4444]/50 focus:ring-[#EF4444]/30'
            : 'border-[#2a3145] focus:ring-[#0A7163]/40 focus:border-[#0A7163]/50'}
          ${className}
        `}
        {...props}
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
    </div>
  )
}
