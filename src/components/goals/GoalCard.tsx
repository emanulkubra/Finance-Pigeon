import React from 'react';
import type { Goal, GoalCategory } from '../../types/finance';
import { Home, Car, Sunrise, Shield, Plane, Landmark, Target, Plus, Trash2 } from 'lucide-react';
import { Button, Progress } from '../ui';
import { moneyShort, relativeDays, longDate } from '../../lib/format';
import { cn } from '../../lib/cn';

const CATEGORY_ICONS: Record<GoalCategory, React.ComponentType<{ className?: string }>> = {
  home: Home,
  car: Car,
  retirement: Sunrise,
  emergency: Shield,
  vacation: Plane,
  debt: Landmark,
  custom: Target,
};

interface GoalCardProps {
  goal: Goal;
  symbol: string;
  onDeposit: (goal: Goal) => void;
  onDelete?: (goal: Goal) => void;
  className?: string;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  symbol,
  onDeposit,
  onDelete,
  className,
}) => {
  const Icon = CATEGORY_ICONS[goal.category] ?? Target;

  const progress = Math.min(100, (goal.currentAmount / Math.max(1, goal.targetAmount)) * 100);
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const isComplete = remaining === 0;
  const deadline = relativeDays(goal.deadline);
  const isOverdue = deadline.days < 0 && !isComplete;

  return (
    <article className={cn('card p-6 flex flex-col', className)}>
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'grid place-items-center w-11 h-11 rounded-xl shrink-0',
            isComplete ? 'bg-positive-tint text-positive' : 'bg-brand-tint text-brand',
          )}
        >
          <Icon className="w-5 h-5" />
        </span>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(goal)}
            aria-label={`Delete ${goal.title}`}
            className="grid place-items-center w-9 h-9 -mr-1.5 -mt-1 rounded-lg text-ink-faint hover:bg-negative-tint hover:text-negative transition-colors"
          >
            <Trash2 className="w-[1.125rem] h-[1.125rem]" />
          </button>
        )}
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug">{goal.title}</h3>
      <p className={cn('text-[0.9375rem]', isOverdue ? 'text-negative' : 'text-ink-soft')}>
        {isComplete ? 'Goal reached' : `${deadline.label} · ${longDate(goal.deadline)}`}
      </p>

      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-3 mb-2.5">
          <span className="tnum text-[1.5rem] font-semibold leading-none tracking-[-0.02em]">
            {moneyShort(goal.currentAmount, symbol)}
          </span>
          <span className="tnum text-[0.9375rem] text-ink-soft">
            of {moneyShort(goal.targetAmount, symbol)}
          </span>
        </div>

        <Progress
          value={progress}
          label={`${goal.title} progress`}
          color={isComplete ? 'var(--color-positive)' : 'var(--color-brand)'}
        />

        <p className="mt-2.5 text-[0.9375rem] text-ink-soft">
          {isComplete ? (
            <span className="text-positive font-medium">Fully funded</span>
          ) : (
            <>
              <span className="tnum font-medium text-ink">{Math.round(progress)}%</span> saved ·{' '}
              <span className="tnum">{moneyShort(remaining, symbol)}</span> to go
            </>
          )}
        </p>
      </div>

      {/* Spacer + auto margin keeps footers aligned across cards of unequal height. */}
      <div className="h-5 shrink-0" />
      <div className="mt-auto pt-5 border-t border-line flex items-center justify-between gap-3">
        <span className="text-[0.9375rem] text-ink-soft">
          <span className="tnum font-medium text-ink">
            {moneyShort(goal.monthlyContributionNeeded, symbol)}
          </span>{' '}
          / month
        </span>
        <Button size="sm" icon={Plus} onClick={() => onDeposit(goal)}>
          Add money
        </Button>
      </div>
    </article>
  );
};
