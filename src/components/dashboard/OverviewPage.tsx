import React, { useMemo, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { Goal } from '../../types/finance';
import { PageHeader, Button, Card, CardHeader, StatCard, EmptyState } from '../ui';
import { QuickLogCard } from './QuickLogCard';
import { HealthCard } from './HealthCard';
import { NetWorthChart } from './NetWorthChart';
import { TransactionRow } from '../transactions/TransactionRow';
import { GoalCard } from '../goals/GoalCard';
import { DepositModal } from '../goals/DepositModal';
import { moneyShort, percent, isThisMonth, currentMonthLabel } from '../../lib/format';
import { Plus, Compass, ArrowDownLeft, ArrowUpRight, Wallet, PiggyBank, Receipt, Target } from 'lucide-react';

interface OverviewPageProps {
  onOpenAddTx: () => void;
  onOpenAddGoal: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onOpenAddTx, onOpenAddGoal }) => {
  const { transactions, goals, settings, healthReport, setActiveTab } = useFinance();
  const [depositGoal, setDepositGoal] = useState<Goal | null>(null);
  const symbol = settings.currencySymbol;

  // Headline figures cover this month only, matching the health score below.
  const { income, expenses } = useMemo(() => {
    const thisMonth = transactions.filter((tx) => isThisMonth(tx.date));
    return {
      income: thisMonth.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0),
      expenses: thisMonth
        .filter((tx) => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0),
    };
  }, [transactions]);

  const leftOver = income - expenses;
  const recent = transactions.slice(0, 6);
  const topGoals = [...goals]
    .sort((a, b) => b.currentAmount / b.targetAmount - a.currentAmount / a.targetAmount)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description={`Where you stand in ${currentMonthLabel()} — what came in, what went out, and what is left.`}
        action={
          <>
            <Button onClick={() => setActiveTab('ai-advisor')} icon={Compass}>
              Should I buy it?
            </Button>
            <Button onClick={onOpenAddTx} icon={Plus} variant="primary">
              Add transaction
            </Button>
          </>
        }
      />

      <QuickLogCard />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          label="Money in this month"
          value={moneyShort(income, symbol)}
          meta="Salary, refunds and other income"
          icon={ArrowDownLeft}
          tone="positive"
        />
        <StatCard
          label="Money out this month"
          value={moneyShort(expenses, symbol)}
          meta={
            healthReport.topExpenseCategory
              ? `Most on ${healthReport.topExpenseCategory}`
              : undefined
          }
          icon={ArrowUpRight}
          tone="negative"
        />
        <StatCard
          label="Left over this month"
          value={moneyShort(leftOver, symbol)}
          meta={`${percent(healthReport.savingsRate)} of what you earned`}
          icon={Wallet}
          tone={leftOver >= 0 ? 'brand' : 'negative'}
        />
        <StatCard
          label="Saved in goals"
          value={moneyShort(
            goals.reduce((sum, goal) => sum + goal.currentAmount, 0),
            symbol,
          )}
          meta={`${goals.length} ${goals.length === 1 ? 'goal' : 'goals'} on the go`}
          icon={PiggyBank}
          tone="neutral"
        />
      </div>

      <HealthCard />

      <NetWorthChart />

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-6 items-start">
        <Card flush>
          <div className="p-6 sm:p-7 pb-4">
            <CardHeader
              title="Recent activity"
              description="Your six most recent records."
              icon={Receipt}
              className="mb-0"
              action={
                <Button size="sm" onClick={() => setActiveTab('transactions')}>
                  See all
                </Button>
              }
            />
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Nothing recorded yet"
              description="Add your first transaction and it will show up here."
              action={
                <Button onClick={onOpenAddTx} icon={Plus} variant="primary">
                  Add transaction
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-line border-t border-line">
              {recent.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} symbol={symbol} compact />
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-[-0.01em]">Goal progress</h2>
            <Button size="sm" onClick={() => setActiveTab('goals')}>
              See all
            </Button>
          </div>

          {topGoals.length === 0 ? (
            <Card flush>
              <EmptyState
                icon={Target}
                title="No goals yet"
                description="Give your saving a purpose — a deposit, a trip, a rainy-day fund."
                action={
                  <Button onClick={onOpenAddGoal} icon={Plus} variant="primary">
                    Create a goal
                  </Button>
                }
              />
            </Card>
          ) : (
            topGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} symbol={symbol} onDeposit={setDepositGoal} />
            ))
          )}
        </div>
      </div>

      <DepositModal goal={depositGoal} onClose={() => setDepositGoal(null)} />
    </div>
  );
};
