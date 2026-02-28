# CLAUDE.md — Tajiri Codebase Guide

## Project Overview

Tajiri ("wealth" in Swahili) is an AI-powered personal finance and budgeting web app built for African markets, with a focus on East/West African currencies (UGX, KES, TZS, RWF, NGN, GHS, ZAR). Users create up to 2 budget "trackers" to log expenses, set budgets, and get AI-powered financial insights.

**Stack**: React 18 + TypeScript, Vite 5, Tailwind CSS 3, Firebase (Auth + Firestore), Zustand, Anthropic Claude API, Recharts.

## Commands

```bash
npm run dev        # Start Vite dev server (localhost:5173)
npm run build      # TypeScript type-check (tsc) then Vite production build
npm run preview    # Preview the production build locally
npm run lint       # ESLint with zero warnings allowed
```

There are no tests. No test runner or test files exist in the project.

## Architecture

### Directory Layout

```
src/
├── types/index.ts          # All TypeScript interfaces (single source of truth)
├── store/index.ts           # Zustand global store with localStorage persistence
├── services/                # Async functions (Firebase, Claude API, currency, alerts)
│   ├── firebase.ts          # Firebase app initialization
│   ├── auth.ts              # Auth operations (email/password, Google sign-in)
│   ├── firestore.ts         # All Firestore CRUD (users, trackers, expenses, budgets)
│   ├── claude.ts            # Claude API integration (NL parsing, receipts, chat, insights)
│   ├── currency.ts          # Exchange rate fetching + conversion
│   └── alerts.ts            # Budget alert generation logic
├── hooks/                   # React hooks that wire services to Zustand store
│   ├── useAuth.ts           # Firebase auth state listener + tracker loading
│   ├── useExpenses.ts       # Expense CRUD + totals computation
│   ├── useBudgets.ts        # Budget CRUD + progress computation
│   ├── useCurrency.ts       # Currency conversion hooks
│   ├── useAI.ts             # AI usage tracking + CFO chat
│   └── useGate.ts           # Feature gating (always returns allowed: true)
├── pages/                   # Route-level components (11 pages)
├── components/
│   ├── auth/                # AuthLayout, GoogleButton, ProtectedRoute
│   ├── layout/              # AppShell, Sidebar, TopBar, BottomNav
│   ├── ai/                  # InsightsPanel
│   ├── expense/             # ReceiptScanner, NLExpenseInput
│   └── ui/                  # ~19 reusable UI primitives (Button, Card, Modal, etc.)
└── utils/
    ├── constants.ts         # PLAN_LIMITS, EXPENSE_CATEGORIES, CURRENCIES, ROUTES
    ├── helpers.ts           # cn(), formatCurrency, parseAmount, date helpers (vanilla)
    └── index.ts             # formatCurrency, getCategoryMeta, date helpers (date-fns)
```

### Data Flow

1. **Services** (`src/services/`) make async calls to Firebase/Claude API
2. **Hooks** (`src/hooks/`) call services and update the **Zustand store** (`src/store/`)
3. **Pages** and **Components** read from the store via `useAppStore()` and call hook functions for mutations
4. Zustand persists a subset of state to `localStorage` (key: `tajiri-store`)

### Routing (React Router v6)

Defined in `src/App.tsx`:
- Public: `/login`, `/signup`
- Onboarding: `/onboarding` (requires auth, no tracker yet)
- Protected: `/dashboard`, `/tracker/:slot`, `/add-expense`, `/budgets`, `/chat`, `/reports`, `/settings`, `/upgrade`
- `/` redirects to `/dashboard`; unknown routes redirect to `/login`

### Firestore Data Model

```
users/{uid}
  ├── trackers/tracker1    # Tracker document
  ├── trackers/tracker2    # Tracker document (optional)
  ├── expenses/{id}        # Expense documents
  ├── budgets/{id}         # Budget documents
  └── meta/aiUsage         # AI usage counter
```

Security rules enforce per-user isolation: `request.auth.uid == userId`.

## Code Conventions

### TypeScript
- Strict mode enabled (`tsconfig.json`)
- All shared types live in `src/types/index.ts` — add new types there
- Path alias: `@/` maps to `src/` (e.g., `import { useAppStore } from '@/store'`)
- Use `interface` for object shapes, `type` for unions and simple aliases
- Prefer `export function` over `export default` for components (pages use default exports)

### React Patterns
- **Functional components only** — no class components
- Hooks for all side effects and state; custom hooks in `src/hooks/`
- Pages are default exports; UI components are named exports
- Component props use TypeScript interfaces extending HTML element attributes where appropriate
- State management via Zustand `useAppStore()` — no prop drilling for global state

### Styling
- **Tailwind CSS** with inline classes; no CSS modules or styled-components
- Custom design tokens in `tailwind.config.js`:
  - Colors: `pri` (#0A7163), `pri-light`, `pri-dark`, `amber`, `danger`, `surface`, `surface-2`, `surface-3`, `border`
  - Fonts: `font-display` (Syne), `font-body` (DM Sans)
- Dark theme only (dark surface backgrounds, light text)
- Use `cn()` from `src/utils/helpers.ts` for conditional class merging (clsx + tailwind-merge)
- Hardcoded hex values in Tailwind arbitrary values are used throughout (e.g., `bg-[#0A7163]`, `text-[#f0f4ff]`)
- Responsive: desktop uses `Sidebar.tsx`, mobile uses `BottomNav.tsx`, controlled by `AppShell`

### Naming
- Files: PascalCase for components/pages (`DashboardPage.tsx`, `Button.tsx`), camelCase for services/hooks/utils (`firestore.ts`, `useAuth.ts`)
- Variables/functions: camelCase
- Types/interfaces: PascalCase
- Constants: UPPER_SNAKE_CASE for config objects (`PLAN_LIMITS`, `CURRENCIES`, `ROUTES`)
- Section dividers in files use `// ─── Section Name ───` comment style

### Error Handling
- Services throw errors; hooks catch them and set error state strings
- `react-hot-toast` for user-facing error/success notifications
- No custom error classes — plain Error with message strings

## Key Design Decisions

### Paywall Disabled
All features are unlocked for every user. The plan/gating system exists in code but:
- `FEATURE_GATES` in `src/types/index.ts` maps all features to `'free'`
- `useAppStore().getPlan()` always returns `'business'`
- `useAppStore().canAccess()` always returns `true`
- `useGate` hook always returns `{ allowed: true }`

### Claude API Direct Browser Access
The app calls the Anthropic API directly from the browser using `fetch` with the `anthropic-dangerous-direct-browser-access: true` header. The API key is stored in `VITE_ANTHROPIC_API_KEY` and exposed in the client bundle. This is a development-only pattern.

### Dual Utility Files
`src/utils/helpers.ts` (vanilla JS) and `src/utils/index.ts` (uses date-fns) both export overlapping functions like `formatCurrency` and `generateId`. Services import from `@/utils` (index.ts); some components use `@/utils/helpers`. When adding new utilities, prefer `helpers.ts` for zero-dependency helpers, `index.ts` for date-fns-dependent helpers.

## Environment Variables

All use the `VITE_` prefix (required by Vite for browser exposure). Template at `.env.example`.

| Variable | Required | Purpose |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Yes | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | No | Firebase analytics |
| `VITE_ANTHROPIC_API_KEY` | Yes (for AI) | Anthropic Claude API key |
| `VITE_EXCHANGE_RATES_API_KEY` | No | OpenExchangeRates (falls back to static rates) |

## Common Tasks

### Adding a New Page
1. Create `src/pages/NewPage.tsx` (default export)
2. Add route in `src/App.tsx` wrapped with `<ProtectedRoute>`
3. Add nav entry in `src/components/layout/Sidebar.tsx` and `BottomNav.tsx` if needed
4. Add route constant to `ROUTES` in `src/utils/constants.ts`

### Adding a New Expense Category
1. Add the category to the `ExpenseCategory` union type in `src/types/index.ts`
2. Add the entry to `EXPENSE_CATEGORIES` in `src/utils/constants.ts`
3. Update `getCategoryMeta()` in `src/utils/index.ts` if needed

### Adding a New Service
1. Create `src/services/newService.ts` with exported async functions
2. Create a corresponding hook `src/hooks/useNewService.ts` that wires the service to the Zustand store
3. Add any new state slices to `src/store/index.ts`

### Modifying the Zustand Store
- Store is in `src/store/index.ts` using `create` with `persist` middleware
- The `partialize` option controls which state is persisted to localStorage
- Add new state fields plus setter functions in the `AppState` interface and implementation
