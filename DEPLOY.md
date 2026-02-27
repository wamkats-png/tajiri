# Tajiri — Deployment Guide

## Prerequisites
- Node.js 18+
- Firebase project (Blaze plan recommended for Storage)
- Anthropic API key (for AI features)

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in env vars
cp .env.example .env
# Edit .env with your keys

# 3. Start dev server
npm run dev
# → http://localhost:5173
```

## Firebase Setup Checklist

1. **Authentication**
   - Enable Email/Password provider
   - Enable Google provider
   - Add `localhost` and your production domain to authorized domains

2. **Firestore**
   - Create database in production mode
   - Deploy security rules: paste `firebase/firestore.rules` → Publish
   - Deploy indexes: Firebase Console → Firestore → Indexes → import `firebase/firestore.indexes.json`

3. **Security Rules** (already written at `firebase/firestore.rules`)
   - Users can only read/write their own data under `users/{uid}`

## Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting (one-time)
firebase init hosting
# → Public directory: dist
# → Single-page app: yes
# → GitHub Actions: optional

# Build + Deploy
npm run build
firebase deploy
```

## Deploy to Vercel (alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
# Add env vars in Vercel dashboard
```

## Deploy to Netlify (alternative)

```bash
npm run build
# Drag dist/ folder to Netlify dashboard
# OR connect GitHub repo with build command: npm run build, publish: dist
```

## Environment Variables for Production

Set these in your hosting provider's dashboard:

| Variable | Required | Description |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `VITE_ANTHROPIC_API_KEY` | ✅ (for AI) | Claude API key |
| `VITE_EXCHANGE_RATES_API_KEY` | Optional | Live FX rates |

## Post-Deploy Checklist

- [ ] Test signup with email and Google
- [ ] Complete onboarding → creates tracker in Firestore
- [ ] Add a test expense manually
- [ ] Add a budget → check progress bar
- [ ] Test AI Parse (needs `VITE_ANTHROPIC_API_KEY`)
- [ ] Test Receipt Scanner (needs `VITE_ANTHROPIC_API_KEY`)
- [ ] Test AI Chat (needs `VITE_ANTHROPIC_API_KEY`)
- [ ] Verify currency converter loads rates
- [ ] Check alerts bell shows budget warnings
- [ ] Test Reports charts render

## Architecture Overview

```
tajiri/
├── src/
│   ├── pages/          # 11 route pages
│   ├── components/
│   │   ├── auth/       # AuthLayout, GoogleButton, ProtectedRoute
│   │   ├── layout/     # AppShell, Sidebar, BottomNav, TopBar
│   │   ├── expense/    # ReceiptScanner, NLExpenseInput
│   │   ├── ai/         # InsightsPanel
│   │   └── ui/         # 15+ reusable components
│   ├── services/       # Firebase, Claude API, currency, alerts
│   ├── hooks/          # useAuth, useExpenses, useBudgets, useAI, ...
│   ├── store/          # Zustand global state
│   ├── types/          # Full TypeScript types
│   └── utils/          # Formatters, constants, helpers
├── firebase/           # Firestore rules + indexes
└── public/             # PWA manifest, favicon
```

## Feature Gates

| Feature | Free | Business |
|---|---|---|
| Tracker 1 | ✅ | ✅ |
| Tracker 2 | ❌ | ✅ |
| Manual expenses | ✅ | ✅ |
| Receipt scanning | ❌ | ✅ |
| Natural language entry | ❌ | ✅ |
| AI Chat (unlimited) | 10/mo | ✅ |
| Reports | ❌ | ✅ |
| CSV export | ❌ | ✅ |
| Spending insights | ❌ | ✅ |
| Rename trackers | ❌ | ✅ |
