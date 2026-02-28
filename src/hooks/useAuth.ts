import { useEffect } from 'react'
import { onAuthChange, fetchUserProfile } from '@/services/auth'
import { tokenManager } from '@/services/tokenManager'
import { fetchTrackers } from '@/services/firestore'
import { useAppStore } from '@/store'

export function useAuth() {
  const { user, tokenState, setUser, setTokenState, setTracker } = useAppStore()

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setTracker('tracker1', null)
        setTracker('tracker2', null)
        return
      }

      // Fetch full profile from Firestore
      const profile = await fetchUserProfile(firebaseUser.uid)
      if (profile) {
        setUser(profile)
        // Load trackers
        const { tracker1, tracker2 } = await fetchTrackers(firebaseUser.uid)
        setTracker('tracker1', tracker1)
        setTracker('tracker2', tracker2)
      }
    })

    return unsub
  }, [])

  // Subscribe to token rotation events and sync state to the store
  useEffect(() => {
    const unsub = tokenManager.subscribe(() => {
      setTokenState(tokenManager.getState())
    })

    // Sync initial state
    setTokenState(tokenManager.getState())

    return unsub
  }, [])

  return { user, tokenState }
}
