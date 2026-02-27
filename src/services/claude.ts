import type { Expense, Budget, Tracker, TrackerSlot } from '@/types'
import { formatCurrency, getCategoryMeta } from '@/utils'

const API_URL = 'https://api.anthropic.com/v1/messages'

function headers() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  }
}

// ─── Core request ──────────────────────────────────────────────────────────────

interface Message { role: 'user' | 'assistant'; content: any }

export async function claudeRequest(
  messages: Message[],
  system?: string,
  maxTokens = 1024
): Promise<string> {
  const body: any = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    messages,
  }
  if (system) body.system = system

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `API error ${res.status}`)
  }

  const data = await res.json()
  const text = data.content
    ?.filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('') ?? ''
  return text
}

// ─── Context builder ───────────────────────────────────────────────────────────

export function buildFinancialContext(
  trackers: (Tracker | null)[],
  expenses: Expense[],
  budgets: Budget[]
): string {
  const today = new Date()
  const month = today.toLocaleString('en', { month: 'long', year: 'numeric' })

  const trackerSummaries = trackers
    .filter(Boolean)
    .map((t) => {
      const tExpenses = expenses.filter((e) => e.trackerId === t!.id)
      const thisMonth = tExpenses.filter((e) => {
        const d = new Date(e.date)
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
      })
      const total = thisMonth.reduce((s, e) => s + e.amount, 0)
      const tBudgets = budgets.filter((b) => b.trackerId === t!.id)
      const budgetTotal = tBudgets.reduce((s, b) => s + b.amount, 0)

      const byCategory = thisMonth.reduce<Record<string, number>>((acc, e) => {
        acc[e.category] = (acc[e.category] ?? 0) + e.amount
        return acc
      }, {})

      const categoryLines = Object.entries(byCategory)
        .sort(([, a], [, b]) => b - a)
        .map(([cat, amt]) => {
          const meta = getCategoryMeta(cat)
          const budget = tBudgets.find((b) => b.category === cat)
          const budgetStr = budget ? ` (budget: ${formatCurrency(budget.amount, t!.currency)})` : ''
          return `  - ${meta.label}: ${formatCurrency(amt, t!.currency)}${budgetStr}`
        })
        .join('\n')

      return `
TRACKER: "${t!.name}" (${t!.currency})
- Total spent this month: ${formatCurrency(total, t!.currency)}
- Total budget: ${budgetTotal > 0 ? formatCurrency(budgetTotal, t!.currency) : 'No budget set'}
- Budget remaining: ${budgetTotal > 0 ? formatCurrency(budgetTotal - total, t!.currency) : 'N/A'}
- Number of expenses this month: ${thisMonth.length}
- Spending by category:
${categoryLines || '  (no expenses yet)'}
- Recent expenses (last 5):
${tExpenses.slice(0, 5).map((e) => `  - ${e.date.slice(0, 10)}: ${e.description} — ${formatCurrency(e.amount, t!.currency)}`).join('\n') || '  (none)'}
`
    })
    .join('\n---\n')

  return `
TODAY: ${today.toISOString().slice(0, 10)} (${month})
USER FINANCIAL DATA:

${trackerSummaries}

IMPORTANT: All monetary responses should use the currency of the relevant tracker. Be concise and practical. You are a financial advisor embedded in a budgeting app.
`.trim()
}

// ─── Natural language expense parser ───────────────────────────────────────────

export interface ParsedExpense {
  description: string
  amount: number
  currency: string
  category: string
  date: string
  notes?: string
}

export async function parseNaturalLanguageExpense(
  text: string,
  defaultCurrency: string
): Promise<ParsedExpense> {
  const today = new Date().toISOString().slice(0, 10)
  const categories = 'food|transport|utilities|rent|health|education|entertainment|shopping|salary|business|savings|other'

  const response = await claudeRequest([{
    role: 'user',
    content: `Extract expense details from this text. Return ONLY valid JSON, no markdown.

Text: "${text}"
Today: ${today}
Default currency: ${defaultCurrency}

Required JSON format:
{
  "description": "clear merchant or item name",
  "amount": <number>,
  "currency": "<3-letter code, use ${defaultCurrency} if not mentioned>",
  "category": "<one of: ${categories}>",
  "date": "<YYYY-MM-DD, use today if not mentioned>",
  "notes": "<any extra context, or omit>"
}

Examples:
- "spent 45k on fuel" → amount: 45000, category: "transport"
- "lunch at Java 35,000" → description: "Lunch at Java", amount: 35000, category: "food"
- "paid rent $500" → amount: 500, currency: "USD", category: "rent"`
  }], undefined, 400)

  const cleaned = response.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}

// ─── Receipt parser ────────────────────────────────────────────────────────────

export async function parseReceiptImage(
  base64: string,
  mimeType: string,
  defaultCurrency: string
): Promise<ParsedExpense> {
  const today = new Date().toISOString().slice(0, 10)
  const categories = 'food|transport|utilities|rent|health|education|entertainment|shopping|salary|business|savings|other'

  const response = await claudeRequest([{
    role: 'user',
    content: [
      { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
      {
        type: 'text',
        text: `Extract expense details from this receipt. Return ONLY valid JSON, no markdown.
Today: ${today}, Default currency: ${defaultCurrency}

JSON format:
{
  "description": "merchant name or main item",
  "amount": <total amount as number>,
  "currency": "<currency on receipt or ${defaultCurrency}>",
  "category": "<one of: ${categories}>",
  "date": "<YYYY-MM-DD from receipt or today>",
  "notes": "<items purchased or relevant details>"
}`
      }
    ]
  }], undefined, 500)

  const cleaned = response.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}

// ─── Spending insights ─────────────────────────────────────────────────────────

export interface Insight {
  type: 'warning' | 'tip' | 'achievement' | 'info'
  title: string
  body: string
}

export async function generateInsights(
  trackers: (Tracker | null)[],
  expenses: Expense[],
  budgets: Budget[]
): Promise<Insight[]> {
  const context = buildFinancialContext(trackers, expenses, budgets)

  const response = await claudeRequest([{
    role: 'user',
    content: `Based on this financial data, generate 3–4 actionable insights. Return ONLY a JSON array, no markdown.

${context}

Each insight must be:
[
  {
    "type": "warning|tip|achievement|info",
    "title": "short title (max 8 words)",
    "body": "2-3 sentence actionable insight"
  }
]

Focus on: over-budget warnings, savings opportunities, spending patterns, positive achievements.`
  }], undefined, 800)

  const cleaned = response.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}
