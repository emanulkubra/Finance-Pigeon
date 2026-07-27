import { Transaction, Goal, Subscription, Budget, UserSettings } from '../types/finance';
import { db } from '../firebase/config';
import {
  SAMPLE_TRANSACTIONS,
  SAMPLE_GOALS,
  SAMPLE_SUBSCRIPTIONS,
  SAMPLE_BUDGETS,
} from './sampleData';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';

const LOCAL_STORAGE_KEYS = {
  TRANSACTIONS: 'fp_guest_transactions',
  GOALS: 'fp_guest_goals',
  SUBSCRIPTIONS: 'fp_guest_subscriptions',
  BUDGETS: 'fp_guest_budgets',
  SETTINGS: 'fp_guest_settings',
};

export const DEFAULT_CATEGORIES = [
  'Housing & Rent',
  'Food & Groceries',
  'Utilities & Bills',
  'Subscriptions',
  'Transportation & Fuel',
  'Healthcare & Medical',
  'Entertainment & Leisure',
  'Shopping & Clothing',
  'Education & Fees',
  'Investments & Savings',
  'Salary & Income',
  'Custom / Other'
];

export const DEFAULT_SETTINGS: UserSettings = {
  currency: 'USD',
  currencySymbol: '$',
  theme: 'light',
  aiApiKey: '',
  aiProvider: 'gemini',
  customCategories: DEFAULT_CATEGORIES,
  enableNotifications: true,
  overspendingThreshold: 80,
  monthlyIncomeTarget: 5000,
};

export const DEFAULT_GOALS: Goal[] = SAMPLE_GOALS;
export const DEFAULT_SUBSCRIPTIONS: Subscription[] = SAMPLE_SUBSCRIPTIONS;
export const DEFAULT_BUDGETS: Budget[] = SAMPLE_BUDGETS;
export const DEFAULT_TRANSACTIONS: Transaction[] = SAMPLE_TRANSACTIONS;

class StorageService {
  // Local Guest Storage Methods
  getGuestTransactions(): Transaction[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      this.saveGuestTransactions(DEFAULT_TRANSACTIONS);
      return DEFAULT_TRANSACTIONS;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_TRANSACTIONS;
    }
  }

  saveGuestTransactions(transactions: Transaction[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  getGuestGoals(): Goal[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.GOALS);
    if (!raw) {
      this.saveGuestGoals(DEFAULT_GOALS);
      return DEFAULT_GOALS;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_GOALS;
    }
  }

  saveGuestGoals(goals: Goal[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }

  getGuestSubscriptions(): Subscription[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.SUBSCRIPTIONS);
    if (!raw) {
      this.saveGuestSubscriptions(DEFAULT_SUBSCRIPTIONS);
      return DEFAULT_SUBSCRIPTIONS;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_SUBSCRIPTIONS;
    }
  }

  saveGuestSubscriptions(subscriptions: Subscription[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  }

  getGuestBudgets(): Budget[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.BUDGETS);
    if (!raw) {
      this.saveGuestBudgets(DEFAULT_BUDGETS);
      return DEFAULT_BUDGETS;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_BUDGETS;
    }
  }

  saveGuestBudgets(budgets: Budget[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }

  getGuestSettings(): UserSettings {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
    if (!raw) {
      this.saveGuestSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  saveGuestSettings(settings: UserSettings): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Firestore Auth Mode Subscriptions
  subscribeFirestoreTransactions(userId: string, callback: (transactions: Transaction[]) => void) {
    const q = query(collection(db, `users/${userId}/transactions`), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const txs: Transaction[] = [];
      snapshot.forEach((doc) => {
        txs.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      callback(txs);
    }, (error) => {
      console.warn("Firestore transactions subscription error:", error);
    });
  }

  subscribeFirestoreGoals(userId: string, callback: (goals: Goal[]) => void) {
    const q = query(collection(db, `users/${userId}/goals`));
    return onSnapshot(q, (snapshot) => {
      const goals: Goal[] = [];
      snapshot.forEach((doc) => {
        goals.push({ id: doc.id, ...doc.data() } as Goal);
      });
      callback(goals);
    }, (error) => {
      console.warn("Firestore goals subscription error:", error);
    });
  }

  subscribeFirestoreSubscriptions(userId: string, callback: (subs: Subscription[]) => void) {
    const q = query(collection(db, `users/${userId}/subscriptions`));
    return onSnapshot(q, (snapshot) => {
      const subs: Subscription[] = [];
      snapshot.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() } as Subscription);
      });
      callback(subs);
    }, (error) => {
      console.warn("Firestore subscriptions subscription error:", error);
    });
  }

  subscribeFirestoreBudgets(userId: string, callback: (budgets: Budget[]) => void) {
    const q = query(collection(db, `users/${userId}/budgets`));
    return onSnapshot(q, (snapshot) => {
      const budgets: Budget[] = [];
      snapshot.forEach((doc) => {
        budgets.push({ id: doc.id, ...doc.data() } as Budget);
      });
      callback(budgets);
    }, (error) => {
      console.warn("Firestore budgets subscription error:", error);
    });
  }

  async saveFirestoreTransaction(userId: string, transaction: Transaction) {
    const docRef = doc(db, `users/${userId}/transactions`, transaction.id);
    await setDoc(docRef, { ...transaction, userId });
  }

  async deleteFirestoreTransaction(userId: string, transactionId: string) {
    const docRef = doc(db, `users/${userId}/transactions`, transactionId);
    await deleteDoc(docRef);
  }

  async saveFirestoreGoal(userId: string, goal: Goal) {
    const docRef = doc(db, `users/${userId}/goals`, goal.id);
    await setDoc(docRef, { ...goal, userId });
  }

  async deleteFirestoreGoal(userId: string, goalId: string) {
    const docRef = doc(db, `users/${userId}/goals`, goalId);
    await deleteDoc(docRef);
  }

  async saveFirestoreSubscription(userId: string, sub: Subscription) {
    const docRef = doc(db, `users/${userId}/subscriptions`, sub.id);
    await setDoc(docRef, { ...sub, userId });
  }

  async deleteFirestoreSubscription(userId: string, subId: string) {
    const docRef = doc(db, `users/${userId}/subscriptions`, subId);
    await deleteDoc(docRef);
  }

  async saveFirestoreBudget(userId: string, budget: Budget) {
    const docRef = doc(db, `users/${userId}/budgets`, budget.id);
    await setDoc(docRef, budget);
  }

  async saveFirestoreSettings(userId: string, settings: UserSettings) {
    const docRef = doc(db, `users/${userId}/settings`, 'config');
    await setDoc(docRef, settings);
  }

  async syncGuestDataToFirestore(userId: string): Promise<void> {
    try {
      const localTxs = this.getGuestTransactions();
      const localGoals = this.getGuestGoals();
      const localSubs = this.getGuestSubscriptions();
      const localBudgets = this.getGuestBudgets();
      const localSettings = this.getGuestSettings();

      for (const tx of localTxs) await this.saveFirestoreTransaction(userId, tx);
      for (const g of localGoals) await this.saveFirestoreGoal(userId, g);
      for (const s of localSubs) await this.saveFirestoreSubscription(userId, s);
      for (const b of localBudgets) await this.saveFirestoreBudget(userId, b);
      await this.saveFirestoreSettings(userId, localSettings);
      console.log('Successfully synced guest data to Firestore:', userId);
    } catch (e) {
      console.error('Error syncing guest data to Firestore:', e);
    }
  }
}

export const storageService = new StorageService();
