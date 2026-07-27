import React from 'react';
import { cn } from '../../lib/cn';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}) => (
  <div className={cn('flex flex-col items-center text-center px-6 py-14', className)}>
    <span className="grid place-items-center w-14 h-14 rounded-2xl bg-sunken text-ink-faint">
      <Icon className="w-7 h-7" />
    </span>
    <h3 className="mt-5 text-lg font-semibold">{title}</h3>
    <p className="mt-2 max-w-sm text-[0.9375rem] text-ink-soft leading-relaxed">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);
