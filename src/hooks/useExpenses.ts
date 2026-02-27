import { useEffect, useState, useCallback } from 'react'
import { fetchExpenses, deleteExpense as deleteExpenseFS, addExpense as addExpenseFS } from '@/services/firestore'
import { useAppStore } from '@/store'
import type { Expense, TrackerSlot } from '@/types'

export function useExpenses(trackerId?: TrackerSlot) {
  const { user, expenses, setExpenses, removeExpense, addExpense } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await fetchExpenses(user.uid, trackerId)
      setExpenses(data)
    } catch {
      setError('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }, [user, trackerId])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string) {
    if (!user) return
    removeExpense(id)
    await deleteExpenseFS(user.uid, id)
  }

  async function handleAdd(expense: Omit<Expense, 'id'>) {
    if (!user) return
    const saved = await addExpenseFS(user.uid, expense)
    addExpense(saved)
    return saved
  }

  const filtered = trackerId
    ? expenses.filter((e) => e.trackerId === trackerId)
    : expenses

  return { expenses: filtered, loading, error, reload: load, deleteExpense: handleDelete, addExpense: handleAdd }
}

// Compute totals for a list of expenses
export function useExpenseTotals(expenses: Expense[]) {
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date)
    const n = new Date()
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
  })

  const total = thisMonth.reduce((s, e) => s + e.amount, 0)

  // By category
  const byCategory = thisMonth.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {})

  // By day (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    const dayTotal = expenses
      .filter((e) => e.date.slice(0, 10) === key)
      .reduce((s, e) => s + e.amount, 0)
    return { date: key, total: dayTotal, label: d.toLocaleDateString('en', { weekday: 'short' }) }
  })

  return { total, byCategory, last7, thisMonth, count: thisMonth.length }
}
