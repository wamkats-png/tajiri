import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`
        relative z-10 w-full ${sizes[size]} mx-0 sm:mx-4
        rounded-t-3xl sm:rounded-2xl
        border border-[#2a3145] bg-[#181d27]
        shadow-2xl fade-up
        max-h-[90vh] overflow-y-auto
      `}>
        {/* Handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#2a3145]" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3145]">
            <h2 className="text-base font-semibold text-[#f0f4ff]" style={{ fontFamily: 'Syne, sans-serif' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#4a5568] hover:text-[#f0f4ff] hover:bg-[#1e2535] transition-all"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
