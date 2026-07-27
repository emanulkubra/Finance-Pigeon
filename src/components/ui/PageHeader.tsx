import React from 'react';
import { cn } from '../../lib/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** The single title block at the top of every page. */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  className,
}) => (
  <header
    className={cn(
      'flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between',
      className,
    )}
  >
    <div className="min-w-0">
      <h1 className="font-display text-[2.25rem] sm:text-[2.75rem] leading-[1.1] tracking-[-0.015em]">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-[1.0625rem] text-ink-soft leading-relaxed max-w-2xl">
          {description}
        </p>
      )}
    </div>
    {action && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{action}</div>}
  </header>
);
