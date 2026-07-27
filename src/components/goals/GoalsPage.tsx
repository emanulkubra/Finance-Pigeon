import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { Goal } from '../../types/finance';
import { PageHeader, Button, Card, StatCard, EmptyState } from '../ui';
import { GoalCard } from './GoalCard';
import { DepositModal } from './DepositModal';
import { moneyShort } from '../../lib/format';
import { Plus, Target, PiggyBank, Coins } from 'lucide-react';

interface GoalsPageProps {
  onOpenAddGoal: () => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({ onOpenAddGoal }) => {
  const { goals, deleteGoal, settings } = useFinance();
  const [depositGoal, setDepositGoal] = useState<Goal | null>(null);
  const symbol = settings.currencySymbol;

  const saved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const target = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const perMonth = goals.reduce((sum, goal) => sum + goal.monthlyContributionNeeded, 0);

  const handleDelete = (goal: Goal) => {
    if (confirm(`Delete “${goal.title}”? Your recorded transfers will stay in your transactions.`)) {
      void deleteGoal(goal.id);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Savings goals"
        description="Set a target, add money as you go, and see how close you are."
        action={
          <Button onClick={onOpenAddGoal} icon={Plus} variant="primary">
            New goal
          </Button>
        }
      />

      {goals.length === 0 ? (
        <Card flush>
          <EmptyState
            icon={Target}
            title="No goals yet"
            description="Create your first goal — a house deposit, a car, an emergency fund — and track your progress towards it."
            action={
              <Button onClick={onOpenAddGoal} icon={Plus} variant="primary" size="lg">
                Create a goal
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              label="Saved so far"
              value={moneyShort(saved, symbol)}
              meta={`Across ${goals.length} ${goals.length === 1 ? 'goal' : 'goals'}`}
              icon={PiggyBank}
              tone="positive"
            />
            <StatCard
              label="Total target"
              value={moneyShort(target, symbol)}
              meta={`${Math.round((saved / Math.max(1, target)) * 100)}% funded`}
              icon={Target}
              tone="brand"
            />
            <StatCard
              label="Needed each month"
              value={moneyShort(perMonth, symbol)}
              meta="To hit every deadline on time"
              icon={Coins}
              tone="neutral"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                symbol={symbol}
                onDeposit={setDepositGoal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      <DepositModal goal={depositGoal} onClose={() => setDepositGoal(null)} />
    </div>
  );
};
