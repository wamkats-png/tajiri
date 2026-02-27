import { useEffect, useState, useCallback } from 'react'
import { fetchBudgets, saveBudget as saveBudgetFS, deleteBudget as deleteBudgetFS } from '@/services/firestore'
import { useAppStore } from '@/store'
import type { Budget, TrackerSlot } from '@/types'

export function useBudgets(trackerId?: TrackerSlot) {
  const { user, budgets, setBudgets, addBudget, removeBudget } = useAppStore()
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await fetchBudgets(user.uid, trackerId)
      setBudgets(data)
    } finally {
      setLoading(false)
    }
  }, [user, trackerId])

  useEffect(() => { load() }, [load])

  async function handleSave(budget: Omit<Budget, 'id'>) {
    if (!user) return
    const saved = await saveBudgetFS(user.uid, budget)
    addBudget(saved)
    return saved
  }

  async function handleDelete(id: string) {
    if (!user) return
    removeBudget(id)
    await deleteBudgetFS(user.uid, id)
  }

  const filtered = trackerId
    ? budgets.filter((b) => b.trackerId === trackerId)
    : budgets

  return { budgets: filtered, loading, reload: load, saveBudget: handleSave, deleteBudget: handleDelete }
}

// Compute budget vs actual for each category
export function useBudgetProgress(budgets: Budget[], expenses: any[], currency: string) {
  return budgets.map((b) => {
    const spent = expenses
      .filter((e) => e.category === b.category)
      .reduce((s: number, e: any) => s + e.amount, 0)
    const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0
    return { ...b, spent, pct, remaining: b.amount - spent }
  })
}
