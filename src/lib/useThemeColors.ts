import { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';

const TOKENS = [
  'brand',
  'positive',
  'negative',
  'warning',
  'info',
  'ink',
  'ink-soft',
  'ink-faint',
  'line',
  'surface',
  'sunken',
  'series-1',
  'series-2',
  'series-3',
  'series-4',
  'series-5',
  'series-6',
  'series-7',
  'series-8',
] as const;

export type ThemeColors = Record<(typeof TOKENS)[number], string>;

const readTokens = (): ThemeColors => {
  const styles = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    TOKENS.map((token) => [token, styles.getPropertyValue(`--color-${token}`).trim()]),
  ) as ThemeColors;
};

/**
 * Resolved token values for SVG charts.
 *
 * Recharts writes colours as SVG presentation attributes, which cannot resolve
 * `var(...)`, so charts need the concrete values. Re-read after a theme change
 * once the `.dark` class has been applied to the document.
 */
export const useThemeColors = (): ThemeColors => {
  const { settings } = useFinance();
  const [colors, setColors] = useState<ThemeColors>(readTokens);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setColors(readTokens()));
    return () => cancelAnimationFrame(frame);
  }, [settings.theme]);

  return colors;
};

/** The eight categorical series colours, in order. */
export const seriesPalette = (colors: ThemeColors): string[] => [
  colors['series-1'],
  colors['series-2'],
  colors['series-3'],
  colors['series-4'],
  colors['series-5'],
  colors['series-6'],
  colors['series-7'],
  colors['series-8'],
];
