import type { Transaction, Goal, Subscription, Budget, TransactionType } from '../types/finance';

/**
 * The dataset a new visitor sees before they record anything of their own.
 *
 * It is generated rather than hard-coded so the dates stay anchored to today —
 * a fixed dataset would drift and eventually show an app full of stale months.
 * The seed is fixed, so the same visitor sees the same figures on every reload.
 */

const SEED = 0x5f3e21;
const MONTHS_OF_HISTORY = 5;

/** Small deterministic PRNG (mulberry32). */
const makeRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const random = makeRandom(SEED);

const between = (min: number, max: number) => min + random() * (max - min);
const cash = (min: number, max: number) => Math.round(between(min, max) * 100) / 100;
const count = (min: number, max: number) => Math.floor(between(min, max + 1));
const pick = <T>(options: readonly T[]): T => options[Math.floor(random() * options.length)];
const chance = (probability: number) => random() < probability;

/** Local YYYY-MM-DD — `toISOString` would shift the day in western timezones. */
const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const today = new Date();

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

const GROCERS = ['Whole Foods Market', 'Trader Joe’s', 'Safeway', 'Costco', 'Corner Market'];
const EATERIES = [
  'Blue Bottle Coffee',
  'Chipotle',
  'Sushi Yama',
  'The Breakfast Club',
  'Pizza Nova',
  'Noodle Bar',
];
const TRAVEL = ['Shell Garage', 'Uber', 'Metro Card Top-up', 'City Parking', 'Amtrak'];
const FUN = ['AMC Theatres', 'Steam', 'Riverside Live', 'Bowling Lanes', 'City Museum'];
const SHOPS = ['Nike Store', 'Uniqlo', 'IKEA', 'Amazon', 'Best Buy'];
const HEALTH = ['CVS Pharmacy', 'Bright Dental', 'Optical Studio'];

interface Draft {
  day: number;
  amount: number;
  type: TransactionType;
  category: string;
  merchant: string;
  paymentMethod: Transaction['paymentMethod'];
  notes?: string;
  accountSource?: string;
  accountDestination?: string;
  isGoodPurchase?: boolean;
}

const buildMonth = (monthOffset: number, lastDay: number): Draft[] => {
  const drafts: Draft[] = [];
  const add = (draft: Draft) => {
    if (draft.day <= lastDay && draft.day >= 1) drafts.push(draft);
  };

  // --- Income -------------------------------------------------------------
  for (const day of [1, 16]) {
    add({
      day,
      amount: cash(2380, 2520),
      type: 'income',
      category: 'Salary & Income',
      merchant: 'Northwind Systems',
      paymentMethod: 'transfer',
      accountSource: 'Employer payroll',
      accountDestination: 'Current account',
      notes: 'Salary',
    });
  }

  if (chance(0.4)) {
    add({
      day: count(6, 24),
      amount: cash(280, 940),
      type: 'income',
      category: 'Custom / Other',
      merchant: pick(['Freelance design work', 'Consulting invoice', 'Marketplace sale']),
      paymentMethod: 'transfer',
      accountDestination: 'Current account',
    });
  }

  // --- Fixed monthly costs ------------------------------------------------
  add({
    day: 3,
    amount: 1450,
    type: 'expense',
    category: 'Housing & Rent',
    merchant: 'Parkview Apartments',
    paymentMethod: 'transfer',
    notes: 'Monthly rent',
    accountSource: 'Current account',
  });

  add({
    day: 8,
    amount: cash(62, 118),
    type: 'expense',
    category: 'Utilities & Bills',
    merchant: 'Cityline Energy',
    paymentMethod: 'transfer',
    notes: 'Electricity and gas',
  });

  add({
    day: 12,
    amount: 65,
    type: 'expense',
    category: 'Utilities & Bills',
    merchant: 'Fibrenet Broadband',
    paymentMethod: 'card',
    notes: 'Home internet',
  });

  add({
    day: 14,
    amount: 34.5,
    type: 'expense',
    category: 'Utilities & Bills',
    merchant: 'Vantel Mobile',
    paymentMethod: 'card',
    notes: 'Phone plan',
  });

  // Subscription charges mirror the tracked subscriptions, so the two screens agree.
  const subscriptionCharges: [number, number, string][] = [
    [1, 120, 'Momentum Gym'],
    [5, 19.99, 'Netflix'],
    [12, 16.99, 'Spotify'],
    [18, 10, 'GitHub Copilot'],
  ];
  for (const [day, amount, merchant] of subscriptionCharges) {
    add({
      day,
      amount,
      type: 'expense',
      category: merchant === 'Momentum Gym' ? 'Healthcare & Medical' : 'Subscriptions',
      merchant,
      paymentMethod: 'card',
      notes: 'Recurring payment',
    });
  }

  // --- Everyday spending --------------------------------------------------
  for (let i = 0; i < count(4, 6); i++) {
    add({
      day: count(1, 28),
      amount: cash(34, 128),
      type: 'expense',
      category: 'Food & Groceries',
      merchant: pick(GROCERS),
      paymentMethod: chance(0.15) ? 'cash' : 'card',
      notes: 'Groceries',
    });
  }

  for (let i = 0; i < count(5, 9); i++) {
    add({
      day: count(1, 28),
      amount: cash(6, 52),
      type: 'expense',
      category: 'Food & Groceries',
      merchant: pick(EATERIES),
      paymentMethod: chance(0.2) ? 'cash' : 'card',
      notes: 'Eating out',
    });
  }

  for (let i = 0; i < count(3, 6); i++) {
    add({
      day: count(1, 28),
      amount: cash(11, 74),
      type: 'expense',
      category: 'Transportation & Fuel',
      merchant: pick(TRAVEL),
      paymentMethod: 'card',
    });
  }

  for (let i = 0; i < count(1, 3); i++) {
    add({
      day: count(1, 28),
      amount: cash(14, 82),
      type: 'expense',
      category: 'Entertainment & Leisure',
      merchant: pick(FUN),
      paymentMethod: 'card',
    });
  }

  for (let i = 0; i < count(1, 3); i++) {
    const amount = cash(22, 265);
    add({
      day: count(1, 28),
      amount,
      type: 'expense',
      category: 'Shopping & Clothing',
      merchant: pick(SHOPS),
      paymentMethod: 'card',
      // Big discretionary buys are the ones the advisor would have queried.
      isGoodPurchase: amount < 150,
    });
  }

  if (chance(0.55)) {
    add({
      day: count(1, 28),
      amount: cash(18, 145),
      type: 'expense',
      category: 'Healthcare & Medical',
      merchant: pick(HEALTH),
      paymentMethod: 'card',
    });
  }

  if (chance(0.3)) {
    add({
      day: count(1, 28),
      amount: cash(45, 320),
      type: 'expense',
      category: 'Education & Fees',
      merchant: pick(['Coursera', 'Evening class', 'Technical books']),
      paymentMethod: 'card',
    });
  }

  // --- Money moved into goals --------------------------------------------
  const contributions: [string, number][] = [
    ['House deposit', 500],
    ['Electric car fund', 300],
    ['Retirement pot', 250],
  ];
  for (const [destination, amount] of contributions) {
    add({
      day: 20,
      amount,
      type: 'transfer',
      category: 'Investments & Savings',
      merchant: `Saved towards ${destination}`,
      paymentMethod: 'transfer',
      accountSource: 'Current account',
      accountDestination: destination,
      notes: 'Automatic monthly transfer',
      isGoodPurchase: true,
    });
  }

  return drafts;
};

const buildTransactions = (): Transaction[] => {
  const rows: Transaction[] = [];

  for (let offset = MONTHS_OF_HISTORY - 1; offset >= 0; offset--) {
    const anchor = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const daysInMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
    // The current month is only filled in up to today.
    const lastDay = offset === 0 ? today.getDate() : daysInMonth;

    for (const draft of buildMonth(offset, lastDay)) {
      const date = new Date(anchor.getFullYear(), anchor.getMonth(), draft.day, 12);
      rows.push({
        id: `tx-sample-${rows.length + 1}`,
        date: iso(date),
        amount: draft.amount,
        type: draft.type,
        category: draft.category,
        paymentMethod: draft.paymentMethod,
        accountSource: draft.accountSource ?? (draft.type === 'expense' ? 'Visa card' : undefined),
        accountDestination: draft.accountDestination,
        merchant: draft.merchant,
        notes: draft.notes,
        isGoodPurchase: draft.isGoodPurchase,
        createdAt: date.toISOString(),
      });
    }
  }

  // Newest first — the rest of the app assumes this order.
  return rows.sort((a, b) => b.date.localeCompare(a.date));
};

// ---------------------------------------------------------------------------
// Goals, subscriptions and budgets
// ---------------------------------------------------------------------------

/** A date `months` from now, keeping the day of the month where possible. */
const monthsAhead = (months: number, day = 15) =>
  iso(new Date(today.getFullYear(), today.getMonth() + months, day));

/** The next time a given day of the month comes around. */
const nextDue = (dayOfMonth: number) => {
  const due = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
  if (due < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    due.setMonth(due.getMonth() + 1);
  }
  return iso(due);
};

const createdAt = new Date().toISOString();

export const SAMPLE_GOALS: Goal[] = [
  {
    id: 'goal-emergency',
    title: 'Emergency fund',
    category: 'emergency',
    targetAmount: 9000,
    currentAmount: 8250,
    deadline: monthsAhead(4, 1),
    monthlyContributionNeeded: 190,
    notes: 'Three months of outgoings, kept somewhere I can reach quickly.',
    createdAt,
  },
  {
    id: 'goal-home',
    title: 'House deposit',
    category: 'home',
    targetAmount: 50000,
    currentAmount: 21400,
    deadline: monthsAhead(29, 31),
    monthlyContributionNeeded: 985,
    notes: '10% on a two-bedroom place.',
    createdAt,
  },
  {
    id: 'goal-car',
    title: 'Electric car fund',
    category: 'car',
    targetAmount: 25000,
    currentAmount: 13600,
    deadline: monthsAhead(16, 30),
    monthlyContributionNeeded: 715,
    notes: 'Replacing the old petrol car.',
    createdAt,
  },
  {
    id: 'goal-japan',
    title: 'Two weeks in Japan',
    category: 'vacation',
    targetAmount: 4800,
    currentAmount: 1950,
    deadline: monthsAhead(10, 1),
    monthlyContributionNeeded: 285,
    notes: 'Flights, rail pass and spending money.',
    createdAt,
  },
  {
    id: 'goal-retirement',
    title: 'Retirement pot',
    category: 'retirement',
    targetAmount: 250000,
    currentAmount: 68500,
    deadline: monthsAhead(168, 1),
    monthlyContributionNeeded: 1080,
    notes: 'Long-term index funds, left alone to compound.',
    createdAt,
  },
];

export const SAMPLE_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-gym',
    name: 'Momentum Gym',
    category: 'Healthcare & Medical',
    amount: 120,
    billingCycle: 'monthly',
    nextDueDate: nextDue(1),
    paymentMethod: 'transfer',
    status: 'active',
    createdAt,
  },
  {
    id: 'sub-netflix',
    name: 'Netflix',
    category: 'Subscriptions',
    amount: 19.99,
    billingCycle: 'monthly',
    nextDueDate: nextDue(5),
    paymentMethod: 'card',
    status: 'active',
    createdAt,
  },
  {
    id: 'sub-spotify',
    name: 'Spotify Family',
    category: 'Subscriptions',
    amount: 16.99,
    billingCycle: 'monthly',
    nextDueDate: nextDue(12),
    paymentMethod: 'card',
    status: 'active',
    createdAt,
  },
  {
    id: 'sub-copilot',
    name: 'GitHub Copilot',
    category: 'Subscriptions',
    amount: 10,
    billingCycle: 'monthly',
    nextDueDate: nextDue(18),
    paymentMethod: 'card',
    status: 'active',
    createdAt,
  },
  {
    id: 'sub-icloud',
    name: 'iCloud 2TB',
    category: 'Subscriptions',
    amount: 9.99,
    billingCycle: 'monthly',
    nextDueDate: nextDue(29),
    paymentMethod: 'card',
    status: 'active',
    createdAt,
  },
  {
    id: 'sub-insurance',
    name: 'Contents insurance',
    category: 'Utilities & Bills',
    amount: 186,
    billingCycle: 'yearly',
    nextDueDate: monthsAhead(4, 9),
    paymentMethod: 'card',
    status: 'active',
    createdAt,
  },
  {
    id: 'sub-news',
    name: 'The Daily Ledger',
    category: 'Entertainment & Leisure',
    amount: 12,
    billingCycle: 'monthly',
    nextDueDate: nextDue(22),
    paymentMethod: 'card',
    status: 'paused',
    createdAt,
  },
];

/** Limits sit close to real spending so the budget bars show a useful spread. */
export const SAMPLE_BUDGETS: Budget[] = [
  { id: 'b-housing', category: 'Housing & Rent', limitAmount: 1500, period: 'monthly' },
  { id: 'b-food', category: 'Food & Groceries', limitAmount: 650, period: 'monthly' },
  { id: 'b-bills', category: 'Utilities & Bills', limitAmount: 220, period: 'monthly' },
  { id: 'b-transport', category: 'Transportation & Fuel', limitAmount: 200, period: 'monthly' },
  { id: 'b-sub', category: 'Subscriptions', limitAmount: 60, period: 'monthly' },
  { id: 'b-ent', category: 'Entertainment & Leisure', limitAmount: 150, period: 'monthly' },
  { id: 'b-shop', category: 'Shopping & Clothing', limitAmount: 250, period: 'monthly' },
  { id: 'b-health', category: 'Healthcare & Medical', limitAmount: 180, period: 'monthly' },
];

export const SAMPLE_TRANSACTIONS: Transaction[] = buildTransactions();
