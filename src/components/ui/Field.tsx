import React, { useId } from 'react';
import { cn } from '../../lib/cn';

interface FieldProps {
  label: string;
  /** Guidance shown under the control. */
  hint?: string;
  className?: string;
  children: (id: string) => React.ReactNode;
}

/** Label + control + hint, wired together with a generated id. */
export const Field: React.FC<FieldProps> = ({ label, hint, className, children }) => {
  const id = useId();
  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children(id)}
      {hint && <p className="mt-1.5 text-sm text-ink-faint">{hint}</p>}
    </div>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  ...props
}) => <input {...props} className={cn('field', className)} />;

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  className,
  children,
  ...props
}) => (
  <select {...props} className={cn('field', className)}>
    {children}
  </select>
);

interface MoneyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  symbol: string;
}

/** Number input with the currency symbol set inside the control. */
export const MoneyInput: React.FC<MoneyInputProps> = ({ symbol, className, ...props }) => (
  <div className="relative">
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint font-medium pointer-events-none">
      {symbol}
    </span>
    <input
      type="number"
      step="0.01"
      min="0"
      inputMode="decimal"
      {...props}
      className={cn('field tnum pl-9', className)}
      style={{ paddingLeft: `${1.6 + symbol.length * 0.5}rem`, ...props.style }}
    />
  </div>
);

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Horizontal choice control, used instead of a select for 2–3 options. */
export const Segmented = <T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedProps<T>) => (
  <div
    role="tablist"
    className={cn('grid gap-1 p-1 rounded-xl bg-sunken border border-line', className)}
    style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
  >
    {options.map((option) => {
      const isActive = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(option.value)}
          className={cn(
            'h-10 px-3 rounded-lg text-[0.9375rem] font-semibold transition-colors',
            isActive
              ? 'bg-surface text-ink shadow-[var(--shadow-card)]'
              : 'text-ink-soft hover:text-ink',
          )}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  hint?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, hint, className, ...props }) => {
  const id = useId();
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <input
        id={id}
        type="checkbox"
        {...props}
        className="mt-0.5 w-5 h-5 shrink-0 rounded-md border-line-strong accent-[var(--color-brand)] cursor-pointer"
      />
      <label htmlFor={id} className="cursor-pointer select-none">
        <span className="block text-[0.9375rem] font-medium text-ink">{label}</span>
        {hint && <span className="block text-sm text-ink-faint mt-0.5">{hint}</span>}
      </label>
    </div>
  );
};
