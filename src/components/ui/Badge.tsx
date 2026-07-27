import React from 'react';
import { cn } from '../../lib/cn';

export type Tone = 'neutral' | 'brand' | 'positive' | 'negative' | 'warning' | 'info';

const TONES: Record<Tone, string> = {
  neutral: 'bg-sunken text-ink-soft',
  brand: 'bg-brand-tint text-brand',
  positive: 'bg-positive-tint text-positive',
  negative: 'bg-negative-tint text-negative',
  warning: 'bg-warning-tint text-warning',
  info: 'bg-info-tint text-info',
};

interface BadgeProps {
  tone?: Tone;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', icon: Icon, className, children }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg',
      'text-sm font-semibold leading-tight whitespace-nowrap',
      TONES[tone],
      className,
    )}
  >
    {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
    {children}
  </span>
);

/** A square tinted tile behind an icon — used for list rows and headers. */
export const IconTile: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  tone?: Tone;
  className?: string;
}> = ({ icon: Icon, tone = 'neutral', className }) => (
  <span
    className={cn(
      'grid place-items-center w-11 h-11 rounded-xl shrink-0',
      TONES[tone],
      className,
    )}
  >
    <Icon className="w-5 h-5" />
  </span>
);
