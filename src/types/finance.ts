export type TransactionType = 'expense' | 'income' | 'transfer';
export type PaymentMethod = 'card' | 'transfer' | 'cash' | 'wallet' | 'crypto' | 'other';

export interface Transaction {
  id: string;
  userId?: string;
  date: string; // ISO format string YYYY-MM-DD
  amount: number;
  type: TransactionType;
  category: string;
  paymentMethod: PaymentMethod;
  accountSource?: string;
  accountDestination?: string;
  merchant: string;
  notes?: string;
  isGoodPurchase?: boolean;
  aiReasoning?: string;
  createdAt: string;
}

export type GoalCategory = 'home' | 'car' | 'retirement' | 'emergency' | 'vacation' | 'debt' | 'custom';

export interface Goal {
  id: string;
  userId?: string;
  title: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  monthlyContributionNeeded: number;
  icon?: string;
  notes?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId?: string;
  name: string;
  category: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  nextDueDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  status: 'active' | 'paused';
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  limitAmount: number;
  period: 'monthly' | 'yearly';
}

export interface UserSettings {
  currency: string;
  currencySymbol: string;
  theme: 'dark' | 'light';
  aiApiKey: string;
  aiProvider: 'gemini' | 'openai' | 'groq' | 'openrouter';
  customCategories: string[];
  enableNotifications: boolean;
  overspendingThreshold: number;
  monthlyIncomeTarget: number;
}

export interface PurchaseEvaluationRequest {
  item: string;
  price: number;
  category: string;
  merchant?: string;
  isEssential: boolean;
}

export interface PurchaseEvaluationResult {
  isGoodPurchase: boolean;
  verdict: 'Great Buy' | 'Acceptable' | 'Think Twice' | 'Financial Trap';
  impactOnGoals: string;
  reasoning: string;
  savingsAlternativeTip: string;
  healthScoreDelta: number;
}

export interface ParsedExpense {
  amount: number;
  category: string;
  merchant: string;
  paymentMethod: PaymentMethod;
  notes: string;
  type: TransactionType;
}

export interface FinancialHealthReport {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySavings: number;
  savingsRate: number;
  topExpenseCategory: string;
  aiSummary: string;
  actionableTips: string[];
}
