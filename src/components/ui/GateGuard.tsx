import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Zap } from 'lucide-react'
import { useGate } from '@/hooks/useGate'
import type { GatedFeature } from '@/types'
import { Button } from './Button'

interface GateGuardProps {
  feature: GatedFeature
  children: ReactNode
  fallback?: ReactNode
  compact?: boolean
}

export function GateGuard({ feature, children, fallback, compact }: GateGuardProps) {
  const canAccess = useGate(feature)
  if (canAccess) return <>{children}</>
  if (fallback) return <>{fallback}</>

  return compact ? <CompactGate /> : <FullGate />
}

function CompactGate() {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate('/upgrade')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 hover:bg-[#F59E0B]/20 transition-all"
    >
      <Lock size={11} className="text-[#F59E0B]" />
      <span className="text-xs font-semibold text-[#F59E0B]">Business</span>
    </button>
  )
}

function FullGate() {
  const navigate = useNavigate()
  return (
    <div className="rounded-2xl border border-dashed border-[#F59E0B]/30 bg-[#F59E0B]/5 p-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center mx-auto mb-4">
        <Zap size={20} className="text-[#F59E0B]" />
      </div>
      <h3 className="text-sm font-semibold text-[#f0f4ff] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
        Business Feature
      </h3>
      <p className="text-xs text-[#4a5568] mb-5 leading-relaxed max-w-xs mx-auto">
        Upgrade to the Business plan to unlock this feature.
      </p>
      <Button onClick={() => navigate('/upgrade')} size="sm">
        <Zap size={13} /> Upgrade Now
      </Button>
    </div>
  )
}
