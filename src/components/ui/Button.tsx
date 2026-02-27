import { type ButtonHTMLAttributes, type ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base = `
    inline-flex items-center justify-center gap-2 font-semibold rounded-xl
    transition-all duration-200 cursor-pointer select-none
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f1117]
  `

  const variants = {
    primary: `
      bg-[#0A7163] text-white hover:bg-[#0D9B87] active:scale-[0.98]
      focus:ring-[#0A7163] shadow-lg shadow-[#0A7163]/20
    `,
    secondary: `
      bg-[#1e2535] text-[#f0f4ff] border border-[#2a3145]
      hover:bg-[#2a3145] hover:border-[#3a4155] active:scale-[0.98]
      focus:ring-[#2a3145]
    `,
    ghost: `
      bg-transparent text-[#8892aa] hover:text-[#f0f4ff] hover:bg-[#1e2535]
      active:scale-[0.98] focus:ring-[#2a3145]
    `,
    danger: `
      bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30
      hover:bg-[#EF4444]/20 active:scale-[0.98] focus:ring-[#EF4444]
    `,
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  }

  return (
    <button
      disabled={disabled || loading}
      className={`
        ${base} ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : children}
    </button>
  )
}
