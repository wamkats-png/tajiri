import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from './firebase'
import type { UserProfile, Tracker, Expense, Budget, TrackerSlot, AIUsage } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toISO(val: unknown): string {
  if (!val) return new Date().toISOString()
  if (val instanceof Timestamp) return val.toDate().toISOString()
  return String(val)
}

function cleanDoc<T>(data: Record<string, unknown>): T {
  const cleaned: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data)) {
    cleaned[k] = v instanceof Timestamp ? v.toDate().toISOString() : v
  }
  return cleaned as T
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

// ─── Trackers ─────────────────────────────────────────────────────────────────

export async function saveTracker(uid: string, tracker: Tracker): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'trackers', tracker.id), {
    ...tracker,
    createdAt: serverTimestamp(),
  })
}

export async function fetchTrackers(uid: string): Promise<{ tracker1: Tracker | null; tracker2: Tracker | null }> {
  const snap1 = await getDoc(doc(db, 'users', uid, 'trackers', 'tracker1'))
  const snap2 = await getDoc(doc(db, 'users', uid, 'trackers', 'tracker2'))
  return {
    tracker1: snap1.exists() ? cleanDoc<Tracker>(snap1.data()) : null,
    tracker2: snap2.exists() ? cleanDoc<Tracker>(snap2.data()) : null,
  }
}

export async function updateTracker(
  uid: string,
  slot: TrackerSlot,
  updates: Partial<Tracker>
): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'trackers', slot), updates)
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export async function addExpense(uid: string, expense: Omit<Expense, 'id'>): Promise<Expense> {
  const ref = await addDoc(
    collection(db, 'users', uid, 'expenses'),
    { ...expense, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }
  )
  return { ...expense, id: ref.id }
}

export async function fetchExpenses(
  uid: string,
  trackerId?: TrackerSlot,
  limitCount = 100
): Promise<Expense[]> {
  const constraints: QueryConstraint[] = [
    orderBy('date', 'desc'),
    limit(limitCount),
  ]
  if (trackerId) constraints.unshift(where('trackerId', '==', trackerId))

  const snap = await getDocs(
    query(collection(db, 'users', uid, 'expenses'), ...constraints)
  )
  return snap.docs.map((d) => cleanDoc<Expense>({ id: d.id, ...d.data() }))
}

export async function deleteExpense(uid: string, expenseId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'expenses', expenseId))
}

export async function updateExpense(
  uid: string,
  expenseId: string,
  updates: Partial<Expense>
): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'expenses', expenseId), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

// ─── Budgets ──────────────────────────────────────────────────────────────────

export async function saveBudget(uid: string, budget: Omit<Budget, 'id'>): Promise<Budget> {
  const ref = await addDoc(
    collection(db, 'users', uid, 'budgets'),
    { ...budget, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }
  )
  return { ...budget, id: ref.id }
}

export async function fetchBudgets(uid: string, trackerId?: TrackerSlot): Promise<Budget[]> {
  const constraints: QueryConstraint[] = []
  if (trackerId) constraints.push(where('trackerId', '==', trackerId))

  const snap = await getDocs(
    query(collection(db, 'users', uid, 'budgets'), ...constraints)
  )
  return snap.docs.map((d) => cleanDoc<Budget>({ id: d.id, ...d.data() }))
}

export async function deleteBudget(uid: string, budgetId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'budgets', budgetId))
}

// ─── AI Usage ─────────────────────────────────────────────────────────────────

export async function fetchAIUsage(uid: string): Promise<AIUsage> {
  const snap = await getDoc(doc(db, 'users', uid, 'meta', 'aiUsage'))
  if (!snap.exists()) {
    return { count: 0, resetAt: new Date().toISOString(), limit: 10 }
  }
  return cleanDoc<AIUsage>(snap.data())
}

export async function incrementAIUsage(uid: string, current: AIUsage): Promise<AIUsage> {
  // Reset monthly
  const resetAt = new Date(current.resetAt)
  const now = new Date()
  const needsReset =
    now.getMonth() !== resetAt.getMonth() ||
    now.getFullYear() !== resetAt.getFullYear()

  const updated: AIUsage = needsReset
    ? { count: 1, resetAt: now.toISOString(), limit: current.limit }
    : { ...current, count: current.count + 1 }

  await setDoc(doc(db, 'users', uid, 'meta', 'aiUsage'), updated)
  return updated
}
