import type { GatedFeature } from '@/types'

// All features unlocked — no plan checks
export function useGate(feature: GatedFeature) {
  return { allowed: true, plan: 'free' as const }
}
