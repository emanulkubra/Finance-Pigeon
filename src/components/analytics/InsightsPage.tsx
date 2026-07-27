import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { PageHeader, Card, CardHeader, EmptyState, Progress, Badge } from '../ui';
import { ChartTooltip } from '../charts/ChartTooltip';
import { useThemeColors, seriesPalette } from '../../lib/useThemeColors';
import {
  money,
  moneyShort,
  moneyCompact,
  percent,
  isThisMonth,
  currentMonthLabel,
} from '../../lib/format';
import { ChartPie, ChartColumn, Scale, Receipt } from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const { transactions, budgets, settings } = useFinance();
  const colors = useThemeColors();
  const palette = seriesPalette(colors);
  const symbol = settings.currencySymbol;

  // Budgets are monthly limits, so everything on this page covers this month.
  const monthTransactions = useMemo(
    () => transactions.filter((tx) => isThisMonth(tx.date)),
    [transactions],
  );

  const byCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const tx of monthTransactions) {
      if (tx.type !== 'expense') continue;
      totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount);
    }
    return [...totals.entries()]
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [monthTransactions]);

  const totals = useMemo(
    () => ({
      income: monthTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expenses: monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0),
    }),
    [monthTransactions],
  );

  const spent = byCategory.reduce((sum, item) => sum + item.value, 0);

  /** A colour per category, fixed by rank so chart and legend agree. */
  const colorFor = (index: number) => palette[index % palette.length];

  const comparison = [
    { name: 'Money in', value: Math.round(totals.income) },
    { name: 'Money out', value: Math.round(totals.expenses) },
  ];

  if (transactions.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Insights"
          description={`Where your money went in ${currentMonthLabel()}.`}
        />
        <Card flush>
          <EmptyState
            icon={Receipt}
            title="Nothing to chart yet"
            description="Record a few transactions and this page will show your spending split by category, income against spending, and how you are tracking against your budgets."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Insights"
        description={`Where your money went in ${currentMonthLabel()}.`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card>
          <CardHeader
            title="Spending by category"
            description={`${moneyShort(spent, symbol)} across ${byCategory.length} categories.`}
            icon={ChartPie}
          />

          {byCategory.length === 0 ? (
            <EmptyState
              icon={ChartPie}
              title="No spending recorded"
              description="Once you log an expense, the split appears here."
            />
          ) : (
            <>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={104}
                      paddingAngle={2}
                      stroke={colors.surface}
                      strokeWidth={2}
                    >
                      {byCategory.map((entry, index) => (
                        <Cell key={entry.name} fill={colorFor(index)} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip format={(v) => money(v, symbol)} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <ul className="mt-6 space-y-3">
                {byCategory.slice(0, 6).map((item, index) => (
                  <li key={item.name} className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: colorFor(index) }}
                    />
                    <span className="text-[0.9375rem] truncate">{item.name}</span>
                    <span className="tnum ml-auto text-[0.9375rem] text-ink-soft shrink-0">
                      {percent((item.value / Math.max(1, spent)) * 100)}
                    </span>
                    <span className="tnum w-24 text-right font-semibold shrink-0">
                      {moneyShort(item.value, symbol)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card>
          <CardHeader
            title="In versus out"
            description="What you earned against what you spent this month."
            icon={ChartColumn}
          />

          <div className="h-64 w-full -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparison} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={colors.line} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: colors['ink-soft'], fontSize: 14 }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                />
                <YAxis
                  tickFormatter={(value: number) => moneyCompact(value, symbol)}
                  tick={{ fill: colors['ink-faint'], fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                />
                <Tooltip
                  cursor={{ fill: colors.sunken }}
                  content={<ChartTooltip format={(v) => money(v, symbol)} />}
                />
                <Bar dataKey="value" name="Total" radius={[10, 10, 0, 0]} maxBarSize={88}>
                  <Cell fill={colors.positive} />
                  <Cell fill={colors.negative} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 pt-6 border-t border-line flex items-center gap-3">
            <Scale className="w-5 h-5 text-ink-faint shrink-0" />
            <p className="text-[1.0625rem]">
              You kept{' '}
              <span className="tnum font-semibold">
                {moneyShort(totals.income - totals.expenses, symbol)}
              </span>{' '}
              of the{' '}
              <span className="tnum font-semibold">{moneyShort(totals.income, symbol)}</span> that
              came in.
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Budgets"
          description={`How much of each monthly limit you have used in ${currentMonthLabel()}.`}
          icon={Scale}
        />

        {budgets.length === 0 ? (
          <EmptyState
            icon={Scale}
            title="No budgets set"
            description="Set monthly limits per category in Settings and track them here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {budgets.map((budget) => {
              const used = byCategory.find((item) => item.name === budget.category)?.value ?? 0;
              const ratio = (used / Math.max(1, budget.limitAmount)) * 100;
              const isOver = ratio >= 100;
              const isClose = ratio >= settings.overspendingThreshold;

              return (
                <div key={budget.id}>
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <span className="font-medium truncate">{budget.category}</span>
                    <Badge tone={isOver ? 'negative' : isClose ? 'warning' : 'positive'}>
                      {percent(ratio)}
                    </Badge>
                  </div>

                  <Progress
                    value={ratio}
                    label={`${budget.category} budget`}
                    color={
                      isOver
                        ? 'var(--color-negative)'
                        : isClose
                          ? 'var(--color-warning)'
                          : 'var(--color-brand)'
                    }
                  />

                  <p className="tnum mt-2 text-[0.9375rem] text-ink-soft">
                    {money(used, symbol)} of {moneyShort(budget.limitAmount, symbol)}
                    {isOver && (
                      <span className="text-negative font-medium">
                        {' '}
                        · {money(used - budget.limitAmount, symbol)} over
                      </span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
