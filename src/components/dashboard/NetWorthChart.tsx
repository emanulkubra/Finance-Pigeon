import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardHeader, EmptyState } from '../ui';
import { ChartTooltip } from '../charts/ChartTooltip';
import { useThemeColors } from '../../lib/useThemeColors';
import { money, moneyCompact, moneyShort, shortDate, longDate } from '../../lib/format';
import { TrendingUp, TrendingDown, LineChart } from 'lucide-react';

/** Balance carried before the first recorded transaction. */
const OPENING_BALANCE = 10_000;

export const NetWorthChart: React.FC = () => {
  const { transactions, settings } = useFinance();
  const colors = useThemeColors();
  const symbol = settings.currencySymbol;

  /** One point per day, so a busy day does not stretch the x-axis. */
  const data = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const byDate = new Map<string, number>();
    let balance = OPENING_BALANCE;

    for (const tx of sorted) {
      if (tx.type === 'income') balance += tx.amount;
      else if (tx.type === 'expense') balance -= tx.amount;
      byDate.set(tx.date, balance);
    }

    return [...byDate.entries()].map(([date, value]) => ({ date, value: Math.round(value) }));
  }, [transactions]);

  if (data.length < 2) {
    return (
      <Card flush>
        <EmptyState
          icon={LineChart}
          title="Your balance chart starts here"
          description="Once you have recorded a couple of transactions, this chart will show how your balance moves over time."
        />
      </Card>
    );
  }

  const current = data[data.length - 1].value;
  const opening = data[0].value;
  const change = current - opening;
  const isUp = change >= 0;
  const TrendIcon = isUp ? TrendingUp : TrendingDown;

  /* Anchoring the axis at zero would squash the trend into the top third of
     the chart, so pad around the actual range instead. */
  const values = data.map((point) => point.value);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const padding = Math.max((high - low) * 0.15, 100);
  const domain: [number, number] = [Math.max(0, low - padding), high + padding];

  return (
    <Card>
      <CardHeader
        title="Balance over time"
        description="How your running balance has moved since your first record."
        action={
          <div className="text-left sm:text-right">
            <p className="text-[0.9375rem] text-ink-soft">Balance today</p>
            <p className="tnum text-[1.75rem] font-semibold leading-tight tracking-[-0.02em]">
              {moneyShort(current, symbol)}
            </p>
            <p
              className={`tnum inline-flex items-center gap-1.5 text-[0.9375rem] font-medium ${
                isUp ? 'text-positive' : 'text-negative'
              }`}
            >
              <TrendIcon className="w-4 h-4" />
              {isUp ? '+' : '−'}
              {moneyShort(Math.abs(change), symbol)} overall
            </p>
          </div>
        }
      />

      <div className="h-72 w-full -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.brand} stopOpacity={0.22} />
                <stop offset="100%" stopColor={colors.brand} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke={colors.line} vertical={false} />

            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              tick={{ fill: colors['ink-faint'], fontSize: 13 }}
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              minTickGap={28}
            />
            <YAxis
              domain={domain}
              tickFormatter={(value: number) => moneyCompact(value, symbol)}
              tick={{ fill: colors['ink-faint'], fontSize: 13 }}
              axisLine={false}
              tickLine={false}
              width={64}
            />

            <Tooltip
              cursor={{ stroke: colors['ink-faint'], strokeDasharray: '4 4' }}
              content={
                <ChartTooltip
                  format={(value) => money(value, symbol)}
                  labelFormat={(label) => longDate(String(label))}
                />
              }
            />

            <Area
              type="monotone"
              dataKey="value"
              name="Balance"
              stroke={colors.brand}
              strokeWidth={2.5}
              fill="url(#netWorthFill)"
              activeDot={{ r: 5, strokeWidth: 2, stroke: colors.surface }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
