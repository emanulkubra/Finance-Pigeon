import React, { useMemo, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { exportService } from '../../services/exportService';
import type { Transaction, TransactionType } from '../../types/finance';
import { PageHeader, Button, Card, EmptyState, Input, Select, Segmented } from '../ui';
import { TransactionRow } from './TransactionRow';
import { money, longDate } from '../../lib/format';
import { Plus, Search, FileSpreadsheet, FileText, Receipt, SearchX } from 'lucide-react';

type TypeFilter = 'all' | TransactionType;

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'expense', label: 'Out' },
  { value: 'income', label: 'In' },
  { value: 'transfer', label: 'Transfers' },
];

interface TransactionsPageProps {
  onOpenAddTx: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ onOpenAddTx }) => {
  const { transactions, goals, deleteTransaction, settings } = useFinance();
  const symbol = settings.currencySymbol;

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      const matchesSearch =
        !term ||
        tx.merchant.toLowerCase().includes(term) ||
        tx.category.toLowerCase().includes(term) ||
        (tx.notes ?? '').toLowerCase().includes(term);

      return (
        matchesSearch &&
        (typeFilter === 'all' || tx.type === typeFilter) &&
        (category === 'all' || tx.category === category)
      );
    });
  }, [transactions, search, typeFilter, category]);

  /** Newest first, split into day headings. */
  const grouped = useMemo(() => {
    const byDate = new Map<string, Transaction[]>();
    for (const tx of [...filtered].sort((a, b) => b.date.localeCompare(a.date))) {
      const list = byDate.get(tx.date);
      if (list) list.push(tx);
      else byDate.set(tx.date, [tx]);
    }
    return [...byDate.entries()];
  }, [filtered]);

  const totals = useMemo(
    () => ({
      out: filtered.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
      in: filtered.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    }),
    [filtered],
  );

  const isFiltered = search.trim() !== '' || typeFilter !== 'all' || category !== 'all';

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategory('all');
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Transactions"
        description="Every payment, deposit and transfer you have recorded."
        action={
          <>
            <Button
              icon={FileSpreadsheet}
              onClick={() =>
                exportService.exportToCSV(
                  filtered,
                  `finance-pigeon-${new Date().toISOString().split('T')[0]}.csv`,
                )
              }
            >
              CSV
            </Button>
            <Button
              icon={FileText}
              onClick={() => exportService.exportToPDF(filtered, goals, symbol)}
            >
              PDF
            </Button>
            <Button onClick={onOpenAddTx} icon={Plus} variant="primary">
              Add transaction
            </Button>
          </>
        }
      />

      <Card className="p-5 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,15rem)] gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[1.125rem] h-[1.125rem] text-ink-faint pointer-events-none" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category or note"
              aria-label="Search transactions"
              className="pl-11"
            />
          </div>

          <Segmented options={TYPE_OPTIONS} value={typeFilter} onChange={setTypeFilter} />

          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {settings.customCategories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-4 pt-4 border-t border-line flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="text-[0.9375rem] text-ink-soft">
            <span className="tnum font-semibold text-ink">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'record' : 'records'}
          </span>
          <span className="text-[0.9375rem] text-ink-soft">
            In <span className="tnum font-semibold text-positive">{money(totals.in, symbol)}</span>
          </span>
          <span className="text-[0.9375rem] text-ink-soft">
            Out <span className="tnum font-semibold text-negative">{money(totals.out, symbol)}</span>
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-[0.9375rem] font-medium text-brand hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </Card>

      {grouped.length === 0 ? (
        <Card flush>
          {transactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              description="Add your first one and it will appear here, grouped by day."
              action={
                <Button onClick={onOpenAddTx} icon={Plus} variant="primary" size="lg">
                  Add transaction
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={SearchX}
              title="Nothing matches those filters"
              description="Try a different search term, or clear the filters to see everything again."
              action={<Button onClick={clearFilters}>Clear filters</Button>}
            />
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, items]) => {
            const dayNet = items.reduce(
              (sum, tx) =>
                sum + (tx.type === 'income' ? tx.amount : tx.type === 'expense' ? -tx.amount : 0),
              0,
            );

            return (
              <section key={date}>
                <div className="flex items-baseline justify-between gap-4 px-1 mb-2.5">
                  <h2 className="text-[0.9375rem] font-semibold text-ink-soft">{longDate(date)}</h2>
                  {/* A day of transfers only nets to zero — no total worth showing. */}
                  {dayNet !== 0 && (
                    <span
                      className={`tnum text-[0.9375rem] font-medium ${
                        dayNet > 0 ? 'text-positive' : 'text-negative'
                      }`}
                    >
                      {dayNet > 0 ? '+' : ''}
                      {money(dayNet, symbol)}
                    </span>
                  )}
                </div>

                <Card flush>
                  <div className="divide-y divide-line">
                    {items.map((tx) => (
                      <TransactionRow
                        key={tx.id}
                        transaction={tx}
                        symbol={symbol}
                        onDelete={deleteTransaction}
                      />
                    ))}
                  </div>
                </Card>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
