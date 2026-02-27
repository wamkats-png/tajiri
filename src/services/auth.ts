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
  return createUserProfile(user, displayName)
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserProfile> {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return createUserProfile(user)
  return snap.data() as UserProfile
}

export async function signInWithGoogle(): Promise<UserProfile> {
  const { user } = await signInWithPopup(auth, googleProvider)
  return createUserProfile(user)
}

export async function logOut(): Promise<void> {
  await signOut(auth)
}

// ─── Auth state listener ──────────────────────────────────────────────────────

export function onAuthChange(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback)
}

// ─── Fetch user profile ───────────────────────────────────────────────────────

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}
