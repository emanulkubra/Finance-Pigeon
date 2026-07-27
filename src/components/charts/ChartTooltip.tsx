import React from 'react';

interface Entry {
  name?: string | number;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: Entry[];
  /** Turns a raw value into display text, e.g. currency. */
  format: (value: number) => string;
  /** Overrides the heading, which defaults to the axis label. */
  labelFormat?: (label: string | number) => string;
}

/**
 * Shared tooltip for every chart. Styled with theme classes so it follows
 * light/dark automatically, unlike Recharts' inline-styled default.
 */
export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  label,
  payload,
  format,
  labelFormat,
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-[var(--shadow-raised)]">
      {label !== undefined && label !== '' && (
        <p className="text-[0.8125rem] font-medium text-ink-faint mb-1.5">
          {labelFormat ? labelFormat(label) : label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2.5 text-[0.9375rem]">
            {entry.color && (
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
            )}
            {entry.name !== undefined && <span className="text-ink-soft">{entry.name}</span>}
            <span className="tnum font-semibold text-ink ml-auto">
              {format(Number(entry.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
