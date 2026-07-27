import React, { useMemo, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { Subscription } from '../../types/finance';
import {
  PageHeader,
  Button,
  Card,
  StatCard,
  EmptyState,
  Modal,
  Field,
  Input,
  Select,
  MoneyInput,
  Segmented,
  Badge,
} from '../ui';
import { money, moneyShort, longDate, relativeDays } from '../../lib/format';
import { Plus, RefreshCw, Pause, Play, Trash2, CalendarClock, Wallet } from 'lucide-react';
import { cn } from '../../lib/cn';

/** A yearly plan expressed as a monthly figure, so totals are comparable. */
const monthlyCost = (sub: Subscription) =>
  sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount;

const AddSubscriptionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { addSubscription, settings } = useFinance();
  const symbol = settings.currencySymbol;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Subscriptions');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().split('T')[0]);

  const value = parseFloat(amount);
  const isValid = name.trim() !== '' && !isNaN(value) && value > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    await addSubscription({
      name: name.trim(),
      category,
      amount: value,
      billingCycle,
      nextDueDate,
      paymentMethod: 'card',
      status: 'active',
    });

    onClose();
    setName('');
    setAmount('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add a subscription"
      description="Anything that bills you on a regular schedule."
      icon={RefreshCw}
      footer={
        <div className="flex gap-3">
          <Button onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button
            type="submit"
            form="subscription-form"
            variant="primary"
            fullWidth
            disabled={!isValid}
          >
            Add subscription
          </Button>
        </div>
      }
    >
      <form id="subscription-form" onSubmit={handleSubmit} className="space-y-6">
        <Field label="What is it?">
          {(id) => (
            <Input
              id={id}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Netflix"
              className="h-12"
            />
          )}
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label={`Cost (${symbol})`}>
            {(id) => (
              <MoneyInput
                id={id}
                symbol={symbol}
                required
                placeholder="9.99"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            )}
          </Field>

          <Field label="Category">
            {(id) => (
              <Select id={id} value={category} onChange={(e) => setCategory(e.target.value)}>
                {settings.customCategories.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="How often?">
            {() => (
              <Segmented
                options={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'yearly', label: 'Yearly' },
                ]}
                value={billingCycle}
                onChange={setBillingCycle}
              />
            )}
          </Field>

          <Field label="Next payment">
            {(id) => (
              <Input
                id={id}
                type="date"
                required
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
              />
            )}
          </Field>
        </div>

        {isValid && billingCycle === 'yearly' && (
          <p className="text-[0.9375rem] text-ink-soft">
            That works out at{' '}
            <span className="tnum font-semibold text-ink">{money(value / 12, symbol)}</span> a month.
          </p>
        )}
      </form>
    </Modal>
  );
};

const SubscriptionCard: React.FC<{
  subscription: Subscription;
  symbol: string;
  onToggle: (id: string) => void;
  onDelete: (subscription: Subscription) => void;
}> = ({ subscription: sub, symbol, onToggle, onDelete }) => {
  const isActive = sub.status === 'active';
  const due = relativeDays(sub.nextDueDate);
  const isDueSoon = isActive && due.days >= 0 && due.days <= 7;

  return (
    <article className={cn('card p-6 flex flex-col', !isActive && 'opacity-70')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-snug truncate">{sub.name}</h3>
          <p className="text-[0.9375rem] text-ink-soft truncate">{sub.category}</p>
        </div>
        <Badge tone={isActive ? 'positive' : 'neutral'}>{isActive ? 'Active' : 'Paused'}</Badge>
      </div>

      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="tnum text-[2rem] font-semibold leading-none tracking-[-0.02em]">
          {money(sub.amount, symbol)}
        </span>
        <span className="text-[0.9375rem] text-ink-soft">
          / {sub.billingCycle === 'yearly' ? 'year' : 'month'}
        </span>
      </div>

      {sub.billingCycle === 'yearly' && (
        <p className="tnum mt-1 text-[0.9375rem] text-ink-faint">
          {money(monthlyCost(sub), symbol)} a month
        </p>
      )}

      <p
        className={cn(
          'mt-4 flex items-center gap-2 text-[0.9375rem]',
          isDueSoon ? 'text-warning font-medium' : 'text-ink-soft',
        )}
      >
        <CalendarClock className="w-[1.125rem] h-[1.125rem] shrink-0" />
        {isActive ? `${due.label} · ${longDate(sub.nextDueDate)}` : 'Not billing while paused'}
      </p>

      <div className="h-5 shrink-0" />
      <div className="mt-auto pt-5 border-t border-line flex items-center justify-between gap-3">
        <Button size="sm" icon={isActive ? Pause : Play} onClick={() => onToggle(sub.id)}>
          {isActive ? 'Pause' : 'Resume'}
        </Button>
        <button
          type="button"
          onClick={() => onDelete(sub)}
          aria-label={`Delete ${sub.name}`}
          className="grid place-items-center w-9 h-9 rounded-lg text-ink-faint hover:bg-negative-tint hover:text-negative transition-colors"
        >
          <Trash2 className="w-[1.125rem] h-[1.125rem]" />
        </button>
      </div>
    </article>
  );
};

export const SubscriptionsPage: React.FC = () => {
  const { subscriptions, deleteSubscription, toggleSubscriptionStatus, settings } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const symbol = settings.currencySymbol;

  const active = useMemo(() => subscriptions.filter((s) => s.status === 'active'), [subscriptions]);
  const perMonth = active.reduce((sum, sub) => sum + monthlyCost(sub), 0);

  const dueSoon = active.filter((sub) => {
    const { days } = relativeDays(sub.nextDueDate);
    return days >= 0 && days <= 7;
  });

  const handleDelete = (sub: Subscription) => {
    if (confirm(`Stop tracking “${sub.name}”?`)) void deleteSubscription(sub.id);
  };

  /** Soonest payment first, paused ones last. */
  const ordered = [...subscriptions].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
    return a.nextDueDate.localeCompare(b.nextDueDate);
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Subscriptions"
        description="Everything that bills you regularly, and what it adds up to."
        action={
          <Button onClick={() => setIsAdding(true)} icon={Plus} variant="primary">
            Add subscription
          </Button>
        }
      />

      {subscriptions.length === 0 ? (
        <Card flush>
          <EmptyState
            icon={RefreshCw}
            title="No subscriptions tracked"
            description="Add the services you pay for regularly to see what they cost you each month and when they renew."
            action={
              <Button onClick={() => setIsAdding(true)} icon={Plus} variant="primary" size="lg">
                Add subscription
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              label="Costing you each month"
              value={money(perMonth, symbol)}
              meta={`${active.length} active ${active.length === 1 ? 'subscription' : 'subscriptions'}`}
              icon={Wallet}
              tone="negative"
            />
            <StatCard
              label="Over a year"
              value={moneyShort(perMonth * 12, symbol)}
              meta="If nothing changes"
              icon={RefreshCw}
              tone="neutral"
            />
            <StatCard
              label="Due this week"
              value={String(dueSoon.length)}
              meta={
                dueSoon.length > 0
                  ? dueSoon.map((sub) => sub.name).join(', ')
                  : 'Nothing due in the next seven days'
              }
              icon={CalendarClock}
              tone={dueSoon.length > 0 ? 'warning' : 'neutral'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {ordered.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                symbol={symbol}
                onToggle={toggleSubscriptionStatus}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      <AddSubscriptionModal isOpen={isAdding} onClose={() => setIsAdding(false)} />
    </div>
  );
};
