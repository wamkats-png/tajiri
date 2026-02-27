import type { Expense, Budget } from '@/types'
import { getCategoryMeta, formatCurrency } from '@/utils'

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success'

export interface Alert {
  id: string
  severity: AlertSeverity
  title: string
  body: string
  category?: string
  trackerId?: string
  trackerName?: string
  createdAt: string
  read: boolean
}

export function generateAlerts(
  expenses: Expense[],
  budgets: Budget[],
  trackerNames: Record<string, string>
): Alert[] {
  const alerts: Alert[] = []
  const now = new Date()

  budgets.forEach((budget) => {
    const relevantExpenses = expenses.filter((e) => {
      const d = new Date(e.date)
      const sameTracker = e.trackerId === budget.trackerId
      if (budget.period === 'monthly')
        return sameTracker && e.category === budget.category &&
          d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      if (budget.period === 'weekly') {
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
        return sameTracker && e.category === budget.category && d >= weekAgo
      }
      if (budget.period === 'yearly')
        return sameTracker && e.category === budget.category && d.getFullYear() === now.getFullYear()
      return false
    })

    const spent = relevantExpenses.reduce((s, e) => s + e.amount, 0)
    const pct   = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
    const meta  = getCategoryMeta(budget.category)
    const tName = trackerNames[budget.trackerId] ?? budget.trackerId

    if (pct >= 100) {
      alerts.push({
        id: `over-${budget.id}`,
        severity: 'critical',
        title: `${meta.label} budget exceeded`,
        body: `You've spent ${formatCurrency(spent, budget.currency)} on ${meta.label} — ${Math.round(pct - 100)}% over your ${budget.period} budget of ${formatCurrency(budget.amount, budget.currency)} in "${tName}".`,
        category: budget.category,
        trackerId: budget.trackerId,
        trackerName: tName,
        createdAt: new Date().toISOString(),
        read: false,
      })
    } else if (pct >= 80) {
      alerts.push({
        id: `near-${budget.id}`,
        severity: 'warning',
        title: `${meta.label} budget at ${Math.round(pct)}%`,
        body: `You've used ${formatCurrency(spent, budget.currency)} of your ${formatCurrency(budget.amount, budget.currency)} ${meta.label} budget in "${tName}". Only ${formatCurrency(budget.amount - spent, budget.currency)} remaining.`,
        category: budget.category,
        trackerId: budget.trackerId,
        trackerName: tName,
        createdAt: new Date().toISOString(),
        read: false,
      })
    } else if (pct <= 30 && now.getDate() >= 25) {
      alerts.push({
        id: `good-${budget.id}`,
        severity: 'success',
        title: `Great ${meta.label} discipline!`,
        body: `You've only used ${Math.round(pct)}% of your ${meta.label} budget this month in "${tName}". Keep it up!`,
        category: budget.category,
        trackerId: budget.trackerId,
        trackerName: tName,
        createdAt: new Date().toISOString(),
        read: false,
      })
    }
  })

  // Large single expense alert (> 50% of monthly budget)
  const recentLarge = expenses.filter((e) => {
    const d = new Date(e.date)
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1)
    return d >= yesterday
  })

  recentLarge.forEach((e) => {
    const budget = budgets.find(b => b.trackerId === e.trackerId && b.category === e.category)
    if (budget && (e.amount / budget.amount) > 0.5) {
      const meta = getCategoryMeta(e.category)
      alerts.push({
        id: `large-${e.id}`,
        severity: 'info',
        title: `Large ${meta.label} expense logged`,
        body: `${formatCurrency(e.amount, e.currency)} on "${e.description}" is more than half your ${meta.label} budget.`,
        category: e.category,
        trackerId: e.trackerId,
        createdAt: new Date().toISOString(),
        read: false,
      })
    }
  })

  // Dedup by id
  const seen = new Set<string>()
  return alerts.filter(a => { if (seen.has(a.id)) return false; seen.add(a.id); return true })
    .sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2, success: 3 }
      return order[a.severity] - order[b.severity]
    })
}
