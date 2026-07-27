import React, { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Topbar } from './components/layout/Topbar';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewPage } from './components/dashboard/OverviewPage';
import { TransactionsPage } from './components/transactions/TransactionsPage';
import { AdvisorPage } from './components/ai/AdvisorPage';
import { GoalsPage } from './components/goals/GoalsPage';
import { SubscriptionsPage } from './components/subscriptions/SubscriptionsPage';
import { InsightsPage } from './components/analytics/InsightsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { AddTransactionModal } from './components/transactions/AddTransactionModal';
import { AddGoalModal } from './components/goals/AddGoalModal';

const AppContent: React.FC = () => {
  const { activeTab } = useFinance();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('PWA Service Worker registration failed:', err);
      });
    }
  }, []);

  const openAddTx = () => setIsAddTxOpen(true);
  const openAddGoal = () => setIsAddGoalOpen(true);

  return (
    <div className="min-h-[100dvh] flex bg-canvas text-ink">
      <Sidebar isMobileOpen={isNavOpen} onCloseMobile={() => setIsNavOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenMobileNav={() => setIsNavOpen(true)} onOpenAddTx={openAddTx} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          {/* Remounting on tab change replays the entrance animation. */}
          <div key={activeTab} className="mx-auto w-full max-w-[75rem] animate-fade-up">
            {activeTab === 'dashboard' && (
              <OverviewPage onOpenAddTx={openAddTx} onOpenAddGoal={openAddGoal} />
            )}
            {activeTab === 'transactions' && <TransactionsPage onOpenAddTx={openAddTx} />}
            {activeTab === 'ai-advisor' && <AdvisorPage />}
            {activeTab === 'goals' && <GoalsPage onOpenAddGoal={openAddGoal} />}
            {activeTab === 'subscriptions' && <SubscriptionsPage />}
            {activeTab === 'analytics' && <InsightsPage />}
            {activeTab === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>

      <AddTransactionModal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} />
      <AddGoalModal isOpen={isAddGoalOpen} onClose={() => setIsAddGoalOpen(false)} />
    </div>
  );
};

export const App: React.FC = () => (
  <AuthProvider>
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  </AuthProvider>
);

export default App;
