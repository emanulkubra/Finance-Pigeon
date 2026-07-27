import React, { useMemo, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { GoalCategory } from '../../types/finance';
import { Modal, Button, Field, Input, Select, MoneyInput } from '../ui';
import { moneyShort, relativeDays } from '../../lib/format';
import { Target } from 'lucide-react';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { value: GoalCategory; label: string }[] = [
  { value: 'home', label: 'Home or property' },
  { value: 'car', label: 'Car or vehicle' },
  { value: 'retirement', label: 'Retirement' },
  { value: 'emergency', label: 'Emergency fund' },
  { value: 'vacation', label: 'Travel and holidays' },
  { value: 'debt', label: 'Paying off debt' },
  { value: 'custom', label: 'Something else' },
];

/** Two years out — a realistic default for a savings goal. */
const defaultDeadline = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 2);
  return date.toISOString().split('T')[0];
};

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose }) => {
  const { addGoal, settings } = useFinance();
  const symbol = settings.currencySymbol;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('home');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [notes, setNotes] = useState('');

  const target = parseFloat(targetAmount);
  const current = parseFloat(currentAmount) || 0;
  const isValid = title.trim() !== '' && !isNaN(target) && target > 0;

  /** How much per month this goal needs to land on time. */
  const monthlyNeeded = useMemo(() => {
    if (!isValid) return 0;
    const months = Math.max(
      1,
      Math.round((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)),
    );
    return Math.round(Math.max(0, target - current) / months);
  }, [isValid, target, current, deadline]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    await addGoal({
      title: title.trim(),
      category,
      targetAmount: target,
      currentAmount: current,
      deadline,
      monthlyContributionNeeded: monthlyNeeded,
      notes: notes.trim(),
    });

    onClose();
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setNotes('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create a savings goal"
      description="Name it, set a target, and pick a date to hit it by."
      icon={Target}
      footer={
        <div className="flex gap-3">
          <Button onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" form="goal-form" variant="primary" fullWidth disabled={!isValid}>
            Create goal
          </Button>
        </div>
      }
    >
      <form id="goal-form" onSubmit={handleSubmit} className="space-y-6">
        <Field label="What are you saving for?">
          {(id) => (
            <Input
              id={id}
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. House deposit"
              className="h-12"
            />
          )}
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Type of goal">
            {(id) => (
              <Select
                id={id}
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
              >
                {CATEGORIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Hit it by">
            {(id) => (
              <Input
                id={id}
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            )}
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label={`How much do you need? (${symbol})`}>
            {(id) => (
              <MoneyInput
                id={id}
                symbol={symbol}
                required
                placeholder="25000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            )}
          </Field>

          <Field label={`Already saved (${symbol})`} hint="Leave blank if you are starting fresh.">
            {(id) => (
              <MoneyInput
                id={id}
                symbol={symbol}
                placeholder="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
            )}
          </Field>
        </div>

        <Field label="Note" hint="Optional.">
          {(id) => (
            <Input
              id={id}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 10% deposit on a two-bed flat"
            />
          )}
        </Field>

        {isValid && (
          <div className="p-5 rounded-xl bg-brand-tint border border-brand/15">
            <p className="text-[1.0625rem] leading-relaxed">
              To reach{' '}
              <span className="tnum font-semibold">{moneyShort(target, symbol)}</span>{' '}
              {relativeDays(deadline).label.toLowerCase()}, put aside about{' '}
              <span className="tnum font-semibold text-brand">
                {moneyShort(monthlyNeeded, symbol)}
              </span>{' '}
              each month.
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
};
