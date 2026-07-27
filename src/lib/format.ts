/**
 * Formatting helpers. Every number and date in the UI goes through here so
 * amounts, dates and percentages read identically on every screen.
 */

/** `$1,240.50` — full precision, for ledgers and totals. */
export const money = (amount: number, symbol: string): string => {
  const sign = amount < 0 ? '-' : '';
  return `${sign}${symbol}${Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/** `$1,241` — rounded, for headline figures where cents are noise. */
export const moneyShort = (amount: number, symbol: string): string => {
  const sign = amount < 0 ? '-' : '';
  return `${sign}${symbol}${Math.round(Math.abs(amount)).toLocaleString()}`;
};

/** `$12.4k` — for chart axes, where space is tight. */
export const moneyCompact = (amount: number, symbol: string): string => {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}${symbol}${(abs / 1_000_000).toFixed(1)}m`;
  if (abs >= 1_000) return `${sign}${symbol}${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  return `${sign}${symbol}${Math.round(abs)}`;
};

/** `12 Mar 2026` — unambiguous across locales, unlike numeric dates. */
export const longDate = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

/** `12 Mar` — for dense lists where the year is implied. */
export const shortDate = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

/** `in 12 days` / `3 days ago` / `today` — for renewal and deadline dates. */
export const relativeDays = (iso: string): { label: string; days: number } => {
  const target = new Date(iso);
  if (isNaN(target.getTime())) return { label: iso, days: 0 };

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(target) - startOfDay(new Date())) / 86_400_000);

  if (days === 0) return { label: 'Today', days };
  if (days === 1) return { label: 'Tomorrow', days };
  if (days === -1) return { label: 'Yesterday', days };
  if (days > 0 && days < 30) return { label: `In ${days} days`, days };
  if (days < 0 && days > -30) return { label: `${Math.abs(days)} days ago`, days };

  const months = Math.round(Math.abs(days) / 30);
  if (Math.abs(days) < 365) {
    return { label: days > 0 ? `In ${months} months` : `${months} months ago`, days };
  }

  const years = Math.round(Math.abs(days) / 365);
  const unit = years === 1 ? 'year' : 'years';
  return { label: days > 0 ? `In about ${years} ${unit}` : `About ${years} ${unit} ago`, days };
};

export const percent = (value: number): string => `${Math.round(value)}%`;

/**
 * The current calendar month as `YYYY-MM`.
 *
 * Headline figures and budgets are per-month, so anything comparing against a
 * monthly limit must filter on this rather than summing the whole history.
 */
export const currentMonthKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const isThisMonth = (isoDate: string): boolean => isoDate.startsWith(currentMonthKey());

/** `July 2026` — names the period a set of figures covers. */
export const currentMonthLabel = (): string =>
  new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

/** Initials for a merchant avatar, e.g. "Whole Foods" -> "WF". */
export const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase() || '?';

/**
 * Deterministic series colour for a category name, so a category keeps the
 * same colour across the donut chart, the ledger and the budget list.
 */
export const seriesVar = (key: string): string => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return `var(--color-series-${(hash % 8) + 1})`;
};
