import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[#8892aa]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5568]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-xl border bg-[#181d27] text-[#f0f4ff]
              placeholder:text-[#4a5568] transition-all duration-200
              focus:outline-none focus:ring-2 focus:border-transparent
              ${error
                ? 'border-[#EF4444]/50 focus:ring-[#EF4444]/30'
                : 'border-[#2a3145] focus:ring-[#0A7163]/40 focus:border-[#0A7163]/50'
              }
              ${icon ? 'pl-10 pr-4 py-3' : 'px-4 py-3'}
              text-sm ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-[#EF4444]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#4a5568]">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
