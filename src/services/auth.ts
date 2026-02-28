import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from './firebase'
import { tokenManager } from './tokenManager'
import type { UserProfile } from '@/types'

// ─── Create user profile in Firestore ────────────────────────────────────────

async function createUserProfile(user: User, displayName?: string): Promise<UserProfile> {
  const ref = doc(db, 'users', user.uid)
  const existing = await getDoc(ref)

  if (existing.exists()) {
    return existing.data() as UserProfile
  }

  const profile: UserProfile = {
    uid:             user.uid,
    email:           user.email!,
    displayName:     displayName ?? user.displayName ?? 'User',
    photoURL:        user.photoURL ?? undefined,
    plan:            'free',
    defaultCurrency: 'UGX',
    createdAt:       new Date().toISOString(),
    updatedAt:       new Date().toISOString(),
  }

  await setDoc(ref, { ...profile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return profile
}

// ─── Auth actions ─────────────────────────────────────────────────────────────

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<UserProfile> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(user, { displayName })
  // Initialize token rotation for the new user
  await tokenManager.setUser(user)
  return createUserProfile(user, displayName)
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserProfile> {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  // Initialize token rotation
  await tokenManager.setUser(user)
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return createUserProfile(user)
  return snap.data() as UserProfile
}

export async function signInWithGoogle(): Promise<UserProfile> {
  const { user } = await signInWithPopup(auth, googleProvider)
  // Initialize token rotation
  await tokenManager.setUser(user)
  return createUserProfile(user)
}

export async function logOut(): Promise<void> {
  // Clean up token rotation before signing out
  tokenManager.cleanup()
  await tokenManager.setUser(null)
  await signOut(auth)
}

// ─── Auth state listener (with token rotation) ──────────────────────────────

/**
 * Listens for Firebase auth state changes and synchronizes the token manager.
 * When a user signs in (including page reloads with a persisted session),
 * the token manager acquires a fresh token and schedules proactive rotation.
 */
export function onAuthChange(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, async (user) => {
    // Sync the token manager with the current auth state
    await tokenManager.setUser(user)
    callback(user)
  })
}

// ─── Fetch user profile ───────────────────────────────────────────────────────

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}
