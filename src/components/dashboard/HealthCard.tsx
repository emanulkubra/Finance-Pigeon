import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card, Ring, Badge } from '../ui';
import { moneyShort, percent } from '../../lib/format';
import { Check } from 'lucide-react';

const GRADE_MESSAGE: Record<string, string> = {
  'A+': 'Excellent — you are saving well ahead of target.',
  A: 'Strong — your spending is comfortably under control.',
  B: 'Good — a few adjustments would build more headroom.',
  C: 'Fair — savings are thin relative to what you earn.',
  D: 'Stretched — spending is eating most of your income.',
  F: 'At risk — you are spending more than you bring in.',
};

/** Score, the four numbers behind it, and what to do next. */
export const HealthCard: React.FC = () => {
  const { healthReport, settings } = useFinance();
  const { score, grade, monthlyIncome, monthlyExpense, monthlySavings, savingsRate } = healthReport;

  const tone = score >= 70 ? 'positive' : score >= 45 ? 'warning' : 'negative';
  const ringColor =
    tone === 'positive'
      ? 'var(--color-positive)'
      : tone === 'warning'
        ? 'var(--color-warning)'
        : 'var(--color-negative)';

  const figures = [
    { label: 'Money in', value: moneyShort(monthlyIncome, settings.currencySymbol) },
    { label: 'Money out', value: moneyShort(monthlyExpense, settings.currencySymbol) },
    { label: 'Left over', value: moneyShort(monthlySavings, settings.currencySymbol) },
    { label: 'Saved', value: percent(savingsRate) },
  ];

  return (
    <Card>
      <div className="flex flex-col md:flex-row md:items-center gap-7 md:gap-9">
        <div className="flex items-center gap-6 shrink-0">
          <Ring value={score} size={132} color={ringColor}>
            <div>
              <div className="tnum text-[2.5rem] font-semibold leading-none tracking-[-0.03em]">
                {score}
              </div>
              <div className="text-sm text-ink-faint mt-1">out of 100</div>
            </div>
          </Ring>

          <div className="md:hidden">
            <Badge tone={tone}>Grade {grade}</Badge>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-semibold tracking-[-0.01em]">Your financial health</h2>
            <span className="hidden md:inline-flex">
              <Badge tone={tone}>Grade {grade}</Badge>
            </span>
          </div>

          <p className="mt-1.5 text-[1.0625rem] text-ink-soft leading-relaxed">
            {GRADE_MESSAGE[grade] ?? healthReport.aiSummary}
          </p>

          <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
            {figures.map((figure) => (
              <div key={figure.label}>
                <dt className="text-[0.9375rem] text-ink-soft">{figure.label}</dt>
                <dd className="tnum mt-0.5 text-[1.5rem] font-semibold leading-tight tracking-[-0.02em]">
                  {figure.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {healthReport.actionableTips.length > 0 && (
        <div className="mt-7 pt-6 border-t border-line">
          <h3 className="text-[0.9375rem] font-semibold text-ink-soft mb-3">What to do next</h3>
          <ul className="space-y-2.5">
            {healthReport.actionableTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="grid place-items-center w-5 h-5 mt-0.5 rounded-full bg-brand-tint text-brand shrink-0">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </span>
                <span className="text-[1.0625rem] leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
