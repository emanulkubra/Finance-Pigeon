import React from 'react';
import type { Transaction } from '../../types/finance';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Trash2, CircleAlert } from 'lucide-react';
import { money, longDate, shortDate } from '../../lib/format';
import { cn } from '../../lib/cn';

/** Icon, tint and amount sign for each transaction type, in one place. */
const TYPE_STYLES = {
  expense: {
    icon: ArrowUpRight,
    tile: 'bg-negative-tint text-negative',
    amount: 'text-negative',
    sign: '-',
    label: 'Money out',
  },
  income: {
    icon: ArrowDownLeft,
    tile: 'bg-positive-tint text-positive',
    amount: 'text-positive',
    sign: '+',
    label: 'Money in',
  },
  transfer: {
    icon: ArrowLeftRight,
    tile: 'bg-info-tint text-info',
    amount: 'text-info',
    sign: '',
    label: 'Transfer',
  },
} as const;

interface TransactionRowProps {
  transaction: Transaction;
  symbol: string;
  /** Compact hides the secondary columns, for the overview list. */
  compact?: boolean;
  onDelete?: (id: string) => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction: tx,
  symbol,
  compact = false,
  onDelete,
}) => {
  const style = TYPE_STYLES[tx.type];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        'group flex items-center gap-4 px-4 sm:px-5 py-4 transition-colors hover:bg-sunken/70',
      )}
    >
      <span className={cn('grid place-items-center w-11 h-11 rounded-xl shrink-0', style.tile)}>
        <Icon className="w-5 h-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold truncate">{tx.merchant}</p>
          {tx.isGoodPurchase === false && (
            <CircleAlert
              className="w-4 h-4 text-warning shrink-0"
              aria-label="Flagged by the purchase advisor"
            />
          )}
        </div>
        <p className="text-[0.9375rem] text-ink-soft truncate">
          {tx.category}
          <span className="text-ink-faint"> · {compact ? shortDate(tx.date) : tx.paymentMethod}</span>
        </p>
      </div>

      {!compact && (
        <>
          <div className="hidden lg:block w-44 shrink-0 min-w-0">
            <p className="text-[0.9375rem] text-ink-soft truncate">
              {tx.accountSource || 'Not specified'}
            </p>
            {tx.accountDestination && (
              <p className="text-sm text-ink-faint truncate">→ {tx.accountDestination}</p>
            )}
          </div>

          <div className="hidden sm:block w-32 shrink-0 text-[0.9375rem] text-ink-soft tnum">
            {longDate(tx.date)}
          </div>
        </>
      )}

      <div className={cn('tnum font-semibold text-[1.0625rem] text-right shrink-0', style.amount)}>
        {style.sign}
        {money(tx.amount, symbol)}
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(tx.id)}
          aria-label={`Delete ${tx.merchant}`}
          className={cn(
            'grid place-items-center w-9 h-9 rounded-lg shrink-0 text-ink-faint',
            'hover:bg-negative-tint hover:text-negative transition-colors',
            'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100',
          )}
        >
          <Trash2 className="w-[1.125rem] h-[1.125rem]" />
        </button>
      )}
    </div>
  );
};
