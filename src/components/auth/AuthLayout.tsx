import { type ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0f1117]">

      {/* Background mesh gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #0A7163 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(#f0f4ff 1px, transparent 1px),
              linear-gradient(90deg, #f0f4ff 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#0A7163] flex items-center justify-center mb-4 shadow-lg shadow-[#0A7163]/30">
            <span className="text-2xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>T</span>
          </div>
          <h1 className="text-2xl font-bold text-[#f0f4ff]" style={{ fontFamily: 'Syne, sans-serif' }}>
            Tajiri
          </h1>
          <p className="text-sm text-[#4a5568] mt-1">Smart money. Clear picture.</p>
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-[#2a3145] bg-[#181d27]/80 backdrop-blur-sm p-8 shadow-2xl">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#4a5568] mt-6">
          By continuing, you agree to Tajiri's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
