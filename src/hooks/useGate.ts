import { useAppStore } from '@/store'
import type { GatedFeature } from '@/types'

/**
 * Returns whether the current user can access a gated feature.
 * Usage: const canScan = useGate('receipt_scan')
 */
export function useGate(feature: GatedFeature): boolean {
  return useAppStore((s) => s.canAccess(feature))
}

/**
 * Returns the user's current plan
 */
export function usePlan() {
  return useAppStore((s) => s.getPlan())
}
