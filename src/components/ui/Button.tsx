import React from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ComponentType<{ className?: string }>;
  /** Render only the icon; a string `children` becomes the accessible label. */
  iconOnly?: boolean;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand text-on-brand border border-transparent hover:bg-brand-strong shadow-[var(--shadow-card)]',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-sunken hover:border-ink-faint',
  ghost: 'bg-transparent text-ink-soft border border-transparent hover:bg-sunken hover:text-ink',
  danger: 'bg-negative-tint text-negative border border-transparent hover:brightness-95',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[0.9375rem] gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-base gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[1.0625rem] gap-2.5 rounded-xl',
};

const ICON_SIZES: Record<Size, string> = {
  sm: 'h-9 w-9 rounded-lg',
  md: 'h-11 w-11 rounded-xl',
  lg: 'h-12 w-12 rounded-xl',
};

const GLYPH: Record<Size, string> = {
  sm: 'w-4 h-4',
  md: 'w-[1.125rem] h-[1.125rem]',
  lg: 'w-5 h-5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconOnly = false,
  fullWidth = false,
  className,
  children,
  ...props
}) => {
  const fallbackLabel = iconOnly && typeof children === 'string' ? children : undefined;

  return (
    <button
      type="button"
      aria-label={fallbackLabel}
      title={fallbackLabel}
      {...props}
      className={cn(
        'inline-flex items-center justify-center font-semibold whitespace-nowrap',
        'transition-[background-color,border-color,color,transform] duration-150',
        'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        iconOnly ? ICON_SIZES[size] : SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {Icon && <Icon className={cn(GLYPH[size], 'shrink-0')} />}
      {!iconOnly && children}
    </button>
  );
};
