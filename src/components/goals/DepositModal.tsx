import React, { useEffect, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { Goal } from '../../types/finance';
import { Modal, Button, Field, MoneyInput, Progress } from '../ui';
import { moneyShort } from '../../lib/format';
import { PiggyBank } from 'lucide-react';

interface DepositModalProps {
  goal: Goal | null;
  onClose: () => void;
}

const QUICK_AMOUNTS = [50, 100, 250, 500];

/** Adds money to a goal and records the matching transfer in the ledger. */
export const DepositModal: React.FC<DepositModalProps> = ({ goal, onClose }) => {
  const { updateGoal, addTransaction, settings } = useFinance();
  const [amount, setAmount] = useState('');
  const symbol = settings.currencySymbol;

  useEffect(() => {
    if (goal) setAmount('');
  }, [goal]);

  if (!goal) return null;

  const value = parseFloat(amount);
  const isValid = !isNaN(value) && value > 0;
  const projected = goal.currentAmount + (isValid ? value : 0);
  const projectedPercent = Math.min(100, (projected / Math.max(1, goal.targetAmount)) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    await updateGoal({ ...goal, currentAmount: goal.currentAmount + value });
    await addTransaction({
      date: new Date().toISOString().split('T')[0],
      amount: value,
      type: 'transfer',
      category: 'Investments & Savings',
      paymentMethod: 'transfer',
      accountSource: 'Main account',
      accountDestination: goal.title,
      merchant: `Saved towards ${goal.title}`,
      notes: `Deposit into the ${goal.title} goal`,
      isGoodPurchase: true,
    });

    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Add money to ${goal.title}`}
      description="This also records a transfer in your transactions."
      icon={PiggyBank}
    >
      <form id="deposit-form" onSubmit={handleSubmit} className="space-y-6">
        <Field label={`Amount (${symbol})`}>
          {(id) => (
            <MoneyInput
              id={id}
              symbol={symbol}
              autoFocus
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          )}
        </Field>

        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((quick) => (
            <button
              key={quick}
              type="button"
              onClick={() => setAmount(String(quick))}
              className="tnum px-3.5 h-10 rounded-lg border border-line-strong bg-surface text-[0.9375rem] font-medium hover:bg-sunken transition-colors"
            >
              {symbol}
              {quick}
            </button>
          ))}
        </div>

        <div className="p-5 rounded-xl bg-sunken border border-line">
          <div className="flex items-baseline justify-between gap-3 mb-2.5">
            <span className="text-[0.9375rem] text-ink-soft">After this deposit</span>
            <span className="tnum font-semibold">
              {moneyShort(projected, symbol)}{' '}
              <span className="font-normal text-ink-soft">
                of {moneyShort(goal.targetAmount, symbol)}
              </span>
            </span>
          </div>
          <Progress value={projectedPercent} label="Projected progress" />
          <p className="tnum mt-2.5 text-[0.9375rem] text-ink-soft">
            {Math.round(projectedPercent)}% of the way there
          </p>
        </div>
      </form>

      <div className="mt-7 flex gap-3">
        <Button onClick={onClose} fullWidth>
          Cancel
        </Button>
        <Button type="submit" form="deposit-form" variant="primary" fullWidth disabled={!isValid}>
          Add {isValid ? moneyShort(value, symbol) : 'money'}
        </Button>
      </div>
    </Modal>
  );
};
