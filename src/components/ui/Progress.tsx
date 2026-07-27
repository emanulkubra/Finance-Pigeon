import React from 'react';
import { cn } from '../../lib/cn';

interface ProgressProps {
  /** 0–100. Values above 100 are clamped for the bar but not for the label. */
  value: number;
  /** Any CSS colour — defaults to the brand colour. */
  color?: string;
  size?: 'sm' | 'md';
  className?: string;
  label?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  color = 'var(--color-brand)',
  size = 'md',
  className,
  label,
}) => (
  <div
    role="progressbar"
    aria-valuenow={Math.round(value)}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label={label}
    className={cn(
      'w-full overflow-hidden rounded-full bg-sunken border border-line',
      size === 'sm' ? 'h-2' : 'h-2.5',
      className,
    )}
  >
    <div
      className="h-full rounded-full transition-[width] duration-500 ease-out"
      style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }}
    />
  </div>
);

interface RingProps {
  /** 0–100. */
  value: number;
  size?: number;
  color?: string;
  children?: React.ReactNode;
}

/** Circular progress with content centred inside — used for the health score. */
export const Ring: React.FC<RingProps> = ({
  value,
  size = 140,
  color = 'var(--color-brand)',
  children,
}) => {
  const stroke = size >= 120 ? 10 : 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-sunken)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
};
