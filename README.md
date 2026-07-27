LIVE LINK : https://finance-pigeon.vercel.app/

# 🐦 Finance Pigeon

**A calm, clear way to track your money — and a second opinion before you spend it.**

[![Live on Vercel](https://img.shields.io/badge/Live_Demo-Open_the_app-1d6152?style=for-the-badge)](https://finance-pigeon.vercel.app)
[![React](https://img.shields.io/badge/React-19-087ea4?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

> **🔗 Live app: https://finance-pigeon.vercel.app**
> No sign-up, no card details. It opens with a realistic five-month demo dataset so you can try every screen straight away.

---

## Table of contents

- [The problem](#the-problem)
- [What Finance Pigeon does](#what-finance-pigeon-does)
- [Features](#features)
- [The AI feature](#the-ai-feature)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [How it works](#how-it-works)
- [Running it locally](#running-it-locally)
- [Deploying your own copy](#deploying-your-own-copy)
- [Project structure](#project-structure)
- [Design decisions](#design-decisions)
- [Known limits and roadmap](#known-limits-and-roadmap)

---

## The problem

I kept losing track of where my money actually went.

Not in a dramatic way — I was never overdrawn. But at the end of every month I genuinely could not tell you whether I'd saved anything, and I'd catch myself at a checkout page wondering *"can I actually afford this?"* with no way to answer beyond a vague feeling.

I tried the obvious things and each one failed for a specific reason:

| What I tried | Why I stopped |
|---|---|
| **Bank apps** | They show what already happened. They never help *before* you spend. |
| **Spreadsheets** | Logging a coffee meant opening a laptop. I lasted eleven days. |
| **Mint / Emma / YNAB-style apps** | They want read access to my actual bank account. For a student tracking a few hundred a month, handing over banking credentials to a third party is a bad trade. |
| **Notes app** | Zero structure. No totals, no trends, no answers. |

There are two distinct gaps here, and no tool I found covered both:

1. **Logging has to be effortless**, or you stop doing it. Fourteen form fields is a dead app.
2. **The moment that actually matters is *before* the purchase** — not in a monthly report you read three weeks later.

### Who it's for

Students, freelancers, and anyone on an irregular or modest income who wants to understand their spending **without connecting a real bank account**. If you have ever hovered over a "Buy now" button and wished something would just tell you straight — that's the person this is for.

---

## What Finance Pigeon does

Finance Pigeon is a personal finance tracker built around two ideas the alternatives miss:

**1. Logging takes one sentence.**
Type *"Spent 45 on lunch at Subway"* and it becomes a categorised transaction — amount, merchant, category and payment method all extracted for you.

**2. It answers the question before you spend, not after.**
Describe something you're thinking of buying and the **Purchase Advisor** checks it against your real budgets and savings goals, then gives you a verdict, the effect on your goals, and a cheaper alternative worth considering.

Everything else — the ledger, the charts, the goals, the budgets, the health score — exists to give those two features something honest to reason about.

**Your data never leaves your browser** unless you explicitly sign in. That's the default, not a setting.

---

## Features

### 📊 Overview
- **Financial health score** out of 100 with a letter grade, calculated from your savings rate and goal progress
- **Four headline figures** for the current month — money in, money out, what's left, total saved in goals
- **Balance-over-time chart** built from every transaction, with an axis scaled to your actual range
- **Quick log** — plain-English transaction entry (see [the AI feature](#the-ai-feature))
- **Recent activity** and **goal progress** side by side
- Plain-language action plan: *"Automate transfers to your Emergency fund on payday."*

### 💳 Transactions
- Full ledger of expenses, income and transfers, **grouped by day with a running daily total**
- Live search across merchant, category and notes
- Filter by type and category, with a one-click **Clear filters**
- Delete any record
- **Export to CSV** for spreadsheets, or a **formatted PDF report** including your goals
- Filters apply to exports — export exactly what you're looking at

### 🧭 Purchase Advisor
- Describe a purchase, get a verdict: **Great Buy · Acceptable · Think Twice · Financial Trap**
- Shows the effect on your nearest savings goal and the hit to your health score
- Suggests a concrete cheaper alternative
- Also available inline while adding an expense — check before you commit

### 🐷 Savings goals
- Create goals across seven types — home, car, retirement, emergency, travel, debt, custom
- **Automatically works out how much per month** you need to hit your deadline
- Progress bars, percentage funded, and how much is left to go
- **Add money** with a live preview of where the deposit lands you
- Every deposit writes a matching transfer to your ledger, so the two always agree

### 🔄 Subscriptions
- Track recurring services with monthly or yearly billing
- **Yearly plans are normalised to a monthly figure** so totals are comparable
- Monthly cost, annual cost, and a **due-this-week** warning
- Pause and resume without deleting history
- Sorted by soonest payment, paused items last

### 📈 Insights
- **Spending by category** donut with a ranked legend showing percentage and amount
- **Money in versus money out** for the current month
- **Budget tracker** — every category against its monthly limit, colour-coded as safe, close, or over
- Everything scoped to the current month, so figures are comparable to your limits

### ⚙️ Settings
- Seven currencies (USD, EUR, GBP, PKR, INR, CAD, AUD)
- Editable monthly budget per category
- Add and remove your own spending categories
- Choose your AI provider and add your own API key
- **Download a full JSON backup**, restore from a file, or reset to the demo dataset

### 🎨 Throughout
- **Light and dark themes** — a warm paper palette, not the usual blue-black
- **Fully responsive** — verified with no horizontal overflow from 375 px upward
- **Installable as a PWA** and usable offline
- **Accessible** — every control is keyboard reachable with a visible focus ring, all form fields are labelled, and all text meets WCAG AA contrast in both themes
- **Optional Google sign-in** with Firebase for cross-device sync

---

## The AI feature

Finance Pigeon has **two AI-powered capabilities**, both driven by prompts written for this project. They live in [`src/services/aiService.ts`](src/services/aiService.ts).

### 1. Purchase Advisor — the headline feature

This is the feature the whole app is built around. It takes what you're about to buy, injects **your real budgets and your real goals** into the prompt, and asks the model for a structured verdict.

The critical design detail is that the prompt is not generic advice — the model receives your actual category limits and every goal's current amount, target and deadline. That's what lets it say *"this delays your house deposit"* instead of *"consider saving more."*

**System prompt (Google Gemini):**

```text
You are an expert personal financial advisor AI for Finance Pigeon.
Evaluate this purchase request:
Item: "{item}"
Price: ${price}
Category: "{category}"
Merchant: "{merchant}"
Is Essential: {isEssential}

User Budgets: {JSON array of every category budget and its monthly limit}
User Milestones/Goals: {JSON array of {title, current, target, deadline}}

Return ONLY valid JSON matching this schema:
{
  "isGoodPurchase": boolean,
  "verdict": "Great Buy" | "Acceptable" | "Think Twice" | "Financial Trap",
  "impactOnGoals": "short summary of impact on goal deadlines",
  "reasoning": "2-3 sentences concise explanation",
  "savingsAlternativeTip": "actionable saving tip",
  "healthScoreDelta": number (-10 to +10)
}
```

The request is sent with `responseMimeType: "application/json"` so Gemini returns parseable JSON rather than prose wrapped in a code fence. The same prompt is adapted for OpenAI-compatible providers using `response_format: { type: "json_object" }`.

### 2. Quick Log — plain-English transaction entry

Turns one sentence into a structured transaction, so logging a coffee takes three seconds instead of filling in a form.

**System prompt:**

```text
Parse this financial transaction text into a structured JSON expense object: "{text}"
Available categories: {JSON array of the user's categories, including custom ones}
Return ONLY JSON with schema:
{
  "amount": number,
  "category": string,
  "merchant": string,
  "paymentMethod": "card" | "transfer" | "cash" | "wallet" | "crypto" | "other",
  "notes": string,
  "type": "expense" | "income" | "transfer"
}
```

Passing the user's own category list into the prompt matters — if you've created a "Pets" category, the model files things there instead of inventing its own taxonomy.

### Bring your own key — and why

**The app works with no API key at all.** Enter one in **Settings → Purchase advice** to enable live model calls; leave it blank and a deterministic fallback engine handles both features.

This was a deliberate decision, not a shortcut:

- **No key can leak from a static site.** A key baked into a frontend bundle is readable by anyone who opens DevTools. The alternative — a backend proxy — means running a server for a coursework app.
- **No cost ceiling.** A public demo with my key attached is a bill waiting to happen.
- **The app must never be dead.** A rate limit or an outage shouldn't break the core feature, so there is always a working path.

**The fallback engine** is genuine logic, not a stub. For the Purchase Advisor it computes your current month's spend in that category, adds the proposed purchase, and compares against your budget:

| Condition | Verdict | Health delta |
|---|---|---|
| Marked essential | Great Buy | 0 |
| Over 120% of the category budget | Financial Trap | −6 |
| Over 85% of the category budget | Think Twice | −2 |
| Otherwise | Acceptable | +2 |

It also estimates the delay to your nearest unfinished goal in days. For Quick Log, a regex parser extracts the amount and matches keywords (`lunch`, `coffee`, `uber`, `fuel`, `bill`, `electric`) to categories, and pulls the merchant from an `at <merchant>` pattern.

### Trying the live model calls

To see the app call a real model rather than the fallback engine:

1. Get a free key at [Google AI Studio](https://aistudio.google.com/apikey) (no billing required).
2. Open the app → **Settings** → **Purchase advice** → paste it into **API key** → **Save changes**.
3. Go to **Purchase Advisor** and describe something. The verdict now comes from `gemini-1.5-flash`, reasoning over your actual budgets and goals.

The key is stored only in your own browser. Clear site data and it's gone.

### Supported providers

| Provider | Model | Endpoint |
|---|---|---|
| **Google Gemini** *(default)* | `gemini-1.5-flash` | `generativelanguage.googleapis.com` |
| **OpenAI** | `gpt-4o-mini` | `api.openai.com` |
| **Groq** | `llama-3.1-8b-instant` | `api.groq.com` |
| **OpenRouter** | `meta-llama/llama-3.1-8b-instruct:free` | `openrouter.ai` |

Every provider call is wrapped in a try/catch that falls through to the local engine, so a bad key degrades gracefully instead of throwing.

---

## Screenshots

**Overview — the financial health score, headline figures and balance chart**

![Overview page](docs/screenshots/01-overview.png)

**Purchase Advisor — the AI feature giving a verdict against real goals**

![Purchase Advisor](docs/screenshots/02-advisor.png)

**Transactions — the ledger, grouped by day with filters and export**

![Transactions](docs/screenshots/03-transactions.png)

**Insights — category breakdown and budget tracking**

![Insights](docs/screenshots/04-insights.png)

**Savings goals in dark mode**

![Savings goals in dark mode](docs/screenshots/05-goals-dark.png)

---

## Tech stack

### Core
| Tool | Version | Why |
|---|---|---|
| **React** | 19 | Component model and hooks |
| **TypeScript** | 6 | Every data structure is typed end to end |
| **Vite** | 8 | Fast dev server, small production build |
| **Tailwind CSS** | 4 | Utility styling, driven by CSS-variable design tokens |

### Libraries
| Library | Purpose |
|---|---|
| **Recharts** | Area, donut and bar charts |
| **Lucide React** | Icon set |
| **jsPDF** + **jspdf-autotable** | PDF report export |
| **Firebase** | Optional Google auth and Firestore sync |
| **clsx** + **tailwind-merge** | Conditional class composition |

### Services
| Service | Purpose |
|---|---|
| **Vercel** | Hosting and continuous deployment from GitHub |
| **Firebase Auth + Firestore** | Optional sign-in and cross-device sync |
| **Google Gemini / OpenAI / Groq / OpenRouter** | AI inference |
| **Google Fonts** | Inter and Instrument Serif |

### Tooling
**Oxlint** for linting · **PostCSS** + **Autoprefixer** · **Git** and **GitHub** for version control

---

## How it works

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│  React UI  ·  7 pages built from a shared component set  │
└────────────────────────┬─────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   FinanceContext    │  single source of truth
              │  transactions·goals │  actions · derived state
              │  subs·budgets·prefs │
              └──────────┬──────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
  storageService    aiService       exportService
        │                │                │
   ┌────┴────┐      ┌────┴────┐      ┌────┴────┐
   │localStg │      │ Gemini  │      │   CSV   │
   │Firestore│      │ OpenAI  │      │   PDF   │
   └─────────┘      │  Groq   │      │  JSON   │
                    │OpenRoutr│      └─────────┘
                    │    ↓    │
                    │ fallback│  local rules engine
                    └─────────┘
```

### Data model

Five typed entities in [`src/types/finance.ts`](src/types/finance.ts):

- **Transaction** — amount, type (`expense` / `income` / `transfer`), category, payment method, merchant, accounts, notes, plus the advisor's verdict if one was requested
- **Goal** — title, category, target, current amount, deadline, and the monthly contribution needed
- **Subscription** — name, amount, billing cycle, next due date, active or paused
- **Budget** — a monthly limit per category
- **UserSettings** — currency, theme, AI provider and key, custom categories, income target

### Storage

**Guest mode (default)** — everything in `localStorage`. No account, no network, no tracking. On first visit the app seeds a realistic five-month dataset so every screen has something to show.

**Signed in (optional)** — Firestore subscriptions stream changes in real time across devices. Guest data is migrated into your account automatically on first sign-in, so nothing is lost when you switch.

### The demo dataset

Rather than five hard-coded rows, [`src/services/sampleData.ts`](src/services/sampleData.ts) *generates* around 160 transactions spanning five months from a **seeded PRNG**. This means:

- Dates are anchored to today, so the app never shows a stale month
- The same visitor sees the same figures on every reload
- Subscription charges in the ledger match the tracked subscriptions exactly
- Budget limits sit near real spending, so the trackers show a genuine spread of safe, close and over

---

## Running it locally

**Requirements:** Node.js 20 or newer, and npm.

```bash
git clone https://github.com/emanulkubra/Finance-Pigeon.git
```

```bash
cd Finance-Pigeon && npm install
```

```bash
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). That's it — no configuration, no API key, no account. The demo data loads automatically.

### Optional configuration

Only needed if you want Google sign-in. Copy `.env.example` to `.env` and fill in your Firebase values:

```bash
cp .env.example .env
```

The AI key is **not** an environment variable — it's entered in the app under **Settings → Purchase advice**, so it stays on your machine.

### All scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run Oxlint |

---

## Deploying your own copy

The app is a static build, so any static host works. These steps are for Vercel.

1. Push the repository to GitHub.
2. At [vercel.com/new](https://vercel.com/new), import the repository. Vercel detects Vite automatically — build command `npm run build`, output directory `dist`.
3. If you're using Firebase, add the six `VITE_FIREBASE_*` variables under **Settings → Environment Variables**, then redeploy so they're baked into the build.
4. If you're using Firebase Auth, add your Vercel domain under **Firebase console → Authentication → Settings → Authorized domains**. Sign-in fails silently without this.

Every push to `main` redeploys automatically.

---

## Project structure

```
src/
├── components/
│   ├── ui/              # Design system: Button, Card, Field, Modal,
│   │                    # Badge, Progress, StatCard, EmptyState, PageHeader
│   ├── layout/          # Sidebar (with mobile drawer), Topbar
│   ├── dashboard/       # Overview page, health card, balance chart, quick log
│   ├── transactions/    # Ledger, row component, add-transaction modal
│   ├── goals/           # Goals page, goal card, deposit and create modals
│   ├── subscriptions/   # Subscriptions page and modal
│   ├── analytics/       # Insights page
│   ├── settings/        # Settings page
│   ├── ai/              # Purchase Advisor page
│   └── charts/          # Shared themed chart tooltip
├── context/
│   ├── FinanceContext   # All app state and actions
│   └── AuthContext      # Firebase auth and guest-data migration
├── services/
│   ├── aiService        # Prompts, provider calls, fallback engine, health score
│   ├── storageService   # localStorage and Firestore
│   ├── exportService    # CSV, PDF and JSON export
│   ├── sampleData       # Seeded demo dataset generator
│   └── notificationService
├── lib/
│   ├── format           # Currency, dates, percentages, month scoping
│   ├── useThemeColors   # Resolves CSS tokens for SVG charts
│   └── cn               # Class merging
├── types/finance.ts     # Every shared type
└── index.css            # Design tokens, base styles, primitives
```

---

## Design decisions

A few choices worth explaining, since they're the difference between an app that works and one that's pleasant to use.

**Everything is a design token.** [`src/index.css`](src/index.css) defines the entire palette as CSS custom properties. Dark mode is not a second set of components — it's the same UI with the variable values swapped under `.dark`. One place to change a colour, and both themes stay consistent.

**Charts need resolved values, not variables.** Recharts writes colours as SVG presentation attributes, and those cannot resolve `var(...)`. The [`useThemeColors`](src/lib/useThemeColors.ts) hook reads the computed token values and re-reads them after a theme change, so charts follow the theme correctly. This one caught me out and is documented in the code.

**Type is sized for reading, not for density.** Body text is 16 px and nothing anywhere is below 13 px. All money uses tabular numerals so figures line up in columns.

**Monthly figures are scoped to the month.** Budgets are monthly limits, so comparing them against all-time spending would show every category massively over. The Overview and Insights pages filter to the current month and say so in the copy.

**Deposits write real transfers.** Adding money to a goal also records a transfer in the ledger, so the goals page and the transactions page can never disagree.

**The service worker is network-first for pages.** A cache-first HTML strategy pins visitors to whichever build they first loaded, meaning a deploy never reaches them. Pages go to the network first and fall back to cache offline; hashed build assets stay cache-first.

---

## Known limits and roadmap

Being straight about what this does and doesn't do:

- **No bank integration.** Deliberate — the whole point is not handing over banking credentials. Everything is entered manually or via Quick Log.
- **The AI key lives in the browser.** Fine for personal use, but a shared deployment would want a backend proxy holding the key server-side.
- **Budgets are monthly only.** No weekly or annual periods yet.
- **Single currency at a time.** Changing currency reformats existing figures rather than converting them.

**Next up:** recurring transactions generated automatically from subscriptions · multi-month comparison charts · a backend proxy so the hosted demo has AI enabled by default · CSV import from bank statements.

---

## Licence

MIT — see [`LICENSE`](LICENSE). Use it, fork it, learn from it.
