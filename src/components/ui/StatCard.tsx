import React from 'react';
import { cn } from '../../lib/cn';
import type { Tone } from './Badge';

interface StatCardProps {
  label: string;
  value: string;
  meta?: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Colours the value and the icon tile. */
  tone?: Tone;
  className?: string;
}

const VALUE_TONES: Record<Tone, string> = {
  neutral: 'text-ink',
  brand: 'text-brand',
  positive: 'text-positive',
  negative: 'text-negative',
  warning: 'text-warning',
  info: 'text-info',
};

const ICON_TONES: Record<Tone, string> = {
  neutral: 'bg-sunken text-ink-faint',
  brand: 'bg-brand-tint text-brand',
  positive: 'bg-positive-tint text-positive',
  negative: 'bg-negative-tint text-negative',
  warning: 'bg-warning-tint text-warning',
  info: 'bg-info-tint text-info',
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  meta,
  icon: Icon,
  tone = 'neutral',
  className,
}) => (
  <div className={cn('card p-5 sm:p-6 flex flex-col gap-3', className)}>
    <div className="flex items-start justify-between gap-3">
      <span className="text-[0.9375rem] font-medium text-ink-soft leading-snug">{label}</span>
      {Icon && (
        <span className={cn('grid place-items-center w-9 h-9 rounded-lg shrink-0', ICON_TONES[tone])}>
          <Icon className="w-[1.125rem] h-[1.125rem]" />
        </span>
      )}
    </div>

    <div
      className={cn(
        'tnum text-[2rem] sm:text-[2.125rem] font-semibold leading-none tracking-[-0.02em]',
        VALUE_TONES[tone],
      )}
    >
      {value}
    </div>

    {meta && <p className="text-sm text-ink-faint leading-snug">{meta}</p>}
  </div>
);
