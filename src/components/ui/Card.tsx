import React from 'react';
import { cn } from '../../lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Remove the default padding, e.g. for a card wrapping a full-bleed table. */
  flush?: boolean;
}

export const Card: React.FC<CardProps> = ({ flush = false, className, children, ...props }) => (
  <div {...props} className={cn('card', flush ? 'overflow-hidden' : 'p-6 sm:p-7', className)}>
    {children}
  </div>
);

interface CardHeaderProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Buttons or filters aligned to the right of the title. */
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  description,
  icon: Icon,
  action,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6',
      className,
    )}
  >
    <div className="flex items-start gap-3.5 min-w-0">
      {Icon && (
        <span className="shrink-0 mt-0.5 grid place-items-center w-10 h-10 rounded-xl bg-brand-tint text-brand">
          <Icon className="w-5 h-5" />
        </span>
      )}
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-[-0.01em] leading-snug">{title}</h2>
        {description && <p className="mt-1 text-[0.9375rem] text-ink-soft">{description}</p>}
      </div>
    </div>
    {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
  </div>
);
