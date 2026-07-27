import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  Transaction, 
  Goal, 
  Subscription, 
  Budget, 
  UserSettings, 
  FinancialHealthReport, 
  PurchaseEvaluationResult, 
  PurchaseEvaluationRequest,
  ParsedExpense 
} from '../types/finance';
import { storageService, DEFAULT_SETTINGS, DEFAULT_TRANSACTIONS, DEFAULT_GOALS, DEFAULT_BUDGETS, DEFAULT_SUBSCRIPTIONS } from '../services/storageService';
import { useAuth } from './AuthContext';
import { aiService } from '../services/aiService';
import { notificationService } from '../services/notificationService';

export type TabType = 'dashboard' | 'transactions' | 'ai-advisor' | 'goals' | 'subscriptions' | 'analytics' | 'settings';

interface FinanceContextType {
  transactions: Transaction[];
  goals: Goal[];
  subscriptions: Subscription[];
  budgets: Budget[];
  settings: UserSettings;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  healthReport: FinancialHealthReport;
  
  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addSubscription: (sub: Omit<Subscription, 'id' | 'createdAt'>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  toggleSubscriptionStatus: (id: string) => Promise<void>;
  updateBudget: (budget: Budget) => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  evaluatePurchase: (req: PurchaseEvaluationRequest) => Promise<PurchaseEvaluationResult>;
  parseNaturalLanguageExpense: (text: string) => Promise<ParsedExpense>;
  resetToDefaults: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isGuest } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [healthReport, setHealthReport] = useState<FinancialHealthReport>(() => 
    aiService.calculateFinancialHealth(DEFAULT_TRANSACTIONS, DEFAULT_GOALS, DEFAULT_BUDGETS, 5000)
  );

  useEffect(() => {
    if (isGuest) {
      setTransactions(storageService.getGuestTransactions());
      setGoals(storageService.getGuestGoals());
      setSubscriptions(storageService.getGuestSubscriptions());
      setBudgets(storageService.getGuestBudgets());
      setSettings(storageService.getGuestSettings());
    } else if (user) {
      const unsubTxs = storageService.subscribeFirestoreTransactions(user.uid, setTransactions);
      const unsubGoals = storageService.subscribeFirestoreGoals(user.uid, setGoals);
      const unsubSubs = storageService.subscribeFirestoreSubscriptions(user.uid, setSubscriptions);
      const unsubBudgets = storageService.subscribeFirestoreBudgets(user.uid, setBudgets);

      return () => {
        unsubTxs();
        unsubGoals();
        unsubSubs();
        unsubBudgets();
      };
    }
  }, [user, isGuest]);

  useEffect(() => {
    setHealthReport(aiService.calculateFinancialHealth(transactions, goals, budgets, settings.monthlyIncomeTarget || 5000));
  }, [transactions, goals, budgets, settings]);

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Actions
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };

    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);

    if (isGuest) storageService.saveGuestTransactions(updatedTxs);
    else if (user) await storageService.saveFirestoreTransaction(user.uid, newTx);

    if (newTx.type === 'expense') {
      const b = budgets.find(b => b.category === newTx.category);
      if (b) {
        const spentInCat = updatedTxs
          .filter(t => t.type === 'expense' && t.category === newTx.category)
          .reduce((sum, t) => sum + t.amount, 0);
        notificationService.checkBudgetAlert(newTx.category, spentInCat, b.limitAmount, settings.overspendingThreshold);
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    const updatedTxs = transactions.filter(t => t.id !== id);
    setTransactions(updatedTxs);
    if (isGuest) storageService.saveGuestTransactions(updatedTxs);
    else if (user) await storageService.deleteFirestoreTransaction(user.uid, id);
  };

  const addGoal = async (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    if (isGuest) storageService.saveGuestGoals(updated);
    else if (user) await storageService.saveFirestoreGoal(user.uid, newGoal);
  };

  const updateGoal = async (updatedGoal: Goal) => {
    const updated = goals.map(g => g.id === updatedGoal.id ? updatedGoal : g);
    setGoals(updated);
    if (isGuest) storageService.saveGuestGoals(updated);
    else if (user) await storageService.saveFirestoreGoal(user.uid, updatedGoal);
  };

  const deleteGoal = async (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    if (isGuest) storageService.saveGuestGoals(updated);
    else if (user) await storageService.deleteFirestoreGoal(user.uid, id);
  };

  const addSubscription = async (subData: Omit<Subscription, 'id' | 'createdAt'>) => {
    const newSub: Subscription = {
      ...subData,
      id: `sub-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [...subscriptions, newSub];
    setSubscriptions(updated);
    if (isGuest) storageService.saveGuestSubscriptions(updated);
    else if (user) await storageService.saveFirestoreSubscription(user.uid, newSub);
  };

  const deleteSubscription = async (id: string) => {
    const updated = subscriptions.filter(s => s.id !== id);
    setSubscriptions(updated);
    if (isGuest) storageService.saveGuestSubscriptions(updated);
    else if (user) await storageService.deleteFirestoreSubscription(user.uid, id);
  };

  const toggleSubscriptionStatus = async (id: string) => {
    const updated = subscriptions.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'paused' as const : 'active' as const } : s);
    setSubscriptions(updated);
    if (isGuest) storageService.saveGuestSubscriptions(updated);
    else if (user) {
      const target = updated.find(s => s.id === id);
      if (target) await storageService.saveFirestoreSubscription(user.uid, target);
    }
  };

  const updateBudget = async (budget: Budget) => {
    const updated = budgets.map(b => b.id === budget.id ? budget : b);
    if (!budgets.some(b => b.id === budget.id)) updated.push(budget);
    setBudgets(updated);
    if (isGuest) storageService.saveGuestBudgets(updated);
    else if (user) await storageService.saveFirestoreBudget(user.uid, budget);
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    if (isGuest) storageService.saveGuestSettings(merged);
    else if (user) await storageService.saveFirestoreSettings(user.uid, merged);
  };

  const evaluatePurchase = async (req: PurchaseEvaluationRequest): Promise<PurchaseEvaluationResult> => {
    return await aiService.evaluatePurchase(req, budgets, goals, transactions, settings.aiApiKey, settings.aiProvider);
  };

  const parseNaturalLanguageExpense = async (text: string): Promise<ParsedExpense> => {
    return await aiService.parseNaturalLanguageExpense(text, settings.customCategories, settings.aiApiKey, settings.aiProvider);
  };

  const resetToDefaults = () => {
    setTransactions(DEFAULT_TRANSACTIONS);
    setGoals(DEFAULT_GOALS);
    setSubscriptions(DEFAULT_SUBSCRIPTIONS);
    setBudgets(DEFAULT_BUDGETS);
    setSettings(DEFAULT_SETTINGS);

    if (isGuest) {
      storageService.saveGuestTransactions(DEFAULT_TRANSACTIONS);
      storageService.saveGuestGoals(DEFAULT_GOALS);
      storageService.saveGuestSubscriptions(DEFAULT_SUBSCRIPTIONS);
      storageService.saveGuestBudgets(DEFAULT_BUDGETS);
      storageService.saveGuestSettings(DEFAULT_SETTINGS);
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        goals,
        subscriptions,
        budgets,
        settings,
        activeTab,
        setActiveTab,
        healthReport,
        addTransaction,
        deleteTransaction,
        addGoal,
        updateGoal,
        deleteGoal,
        addSubscription,
        deleteSubscription,
        toggleSubscriptionStatus,
        updateBudget,
        updateSettings,
        evaluatePurchase,
        parseNaturalLanguageExpense,
        resetToDefaults,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
