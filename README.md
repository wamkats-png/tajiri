# Tajiri — AI Finance Tracker

> Smart money management for your home and business. Powered by Claude AI.

## Tech Stack

- **React + Vite + TypeScript** — Fast, type-safe frontend
- **Tailwind CSS** — Utility-first styling with custom Tajiri design system
- **Firebase** — Auth, Firestore database, Storage
- **Claude API** — AI receipt parsing, natural language entry, CFO chat
- **Zustand** — Lightweight global state management
- **React Router v6** — Client-side routing

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
```
Fill in your keys:
- **Firebase**: Create a project at [firebase.google.com](https://firebase.google.com)
- **Claude API**: Get your key at [console.anthropic.com](https://console.anthropic.com)
- **Exchange Rates**: Free account at [openexchangerates.org](https://openexchangerates.org)

### 3. Run development server
```bash
npm run dev
```
App runs at `http://localhost:3000`

### 4. Build for production
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/          # Base UI: Button, Card, Input, Modal, etc.
│   ├── layout/      # AppShell, BottomNav, Header
│   ├── auth/        # LoginForm, SignupForm
│   ├── tracker/     # TrackerCard, TrackerSetup
│   ├── expense/     # ExpenseList, ExpenseItem, AddExpenseForm
│   ├── budget/      # BudgetCard, BudgetProgress
│   └── ai/          # ChatInterface, InsightCard, ReceiptScanner
├── pages/           # Route-level page components
├── hooks/           # useAuth, useTracker, useExpenses, useBudgets, useAI
├── services/        # firebase.ts, claude.ts, currency.ts
├── store/           # Zustand global state
├── utils/           # constants.ts, helpers.ts
└── types/           # TypeScript interfaces
```

## Plans

| Feature | Free | Business |
|---------|------|----------|
| Tracker 1 | ✅ | ✅ |
| Tracker 2 | 🔒 | ✅ |
| Manual expense entry | ✅ | ✅ |
| Basic budgets | ✅ | ✅ |
| AI interactions | 10/month | Unlimited |
| Receipt scanning | 🔒 | ✅ |
| Natural language entry | 🔒 | ✅ |
| AI CFO Chat | 🔒 | ✅ |
| Reports & CSV export | 🔒 | ✅ |
| Rename trackers | 🔒 | ✅ |

## Build Phases

- **Phase 1 (Prompts 1–6)**: Scaffold, Firebase, Auth, Shell, Design System, Dashboard
- **Phase 2 (Prompts 7–11)**: Tracker setup, Expenses, Budgets, Currency
- **Phase 3 (Prompts 12–16)**: Claude AI integration, Receipt scanning, NL entry, Chat
- **Phase 4 (Prompts 17–20)**: Reports, CSV export, Alerts, Polish + Deploy
