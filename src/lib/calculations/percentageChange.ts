/**
 * Percentage change utilities for comparison metrics
 */

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface PercentageChangeResult {
  value: number | null; // percentage value (e.g., 12.34 for 12.34%)
  isInfinite: boolean;
  direction: TrendDirection;
}

export interface FormatOptions {
  decimals?: number;
  includeSign?: boolean;
}

/**
 * Compute percentage change between current and comparison values.
 * Formula: ((current - comparison) / comparison) * 100
 * Handles edge cases: null/undefined inputs, zero comparison.
 */
export const computePercentageChange = (
  current: number | null | undefined,
  comparison: number | null | undefined
): PercentageChangeResult => {
  if (current === null || current === undefined || comparison === null || comparison === undefined) {
    return { value: null, isInfinite: false, direction: 'neutral' };
  }

  // Zero baseline handling
  if (comparison === 0) {
    if (current === 0) {
      return { value: 0, isInfinite: false, direction: 'neutral' };
    }
    // Infinite growth/decline depending on sign of current
    return { value: null, isInfinite: true, direction: current > 0 ? 'up' : 'down' };
  }

  const raw = ((current - comparison) / comparison) * 100;
  let direction: TrendDirection = 'neutral';
  if (raw > 0) direction = 'up';
  else if (raw < 0) direction = 'down';

  return { value: raw, isInfinite: false, direction };
};

/**
 * Format a percentage value for display.
 * Returns '∞%' when isInfinite is true.
 */
export const formatPercentage = (
  result: PercentageChangeResult,
  options: FormatOptions = {}
): string => {
  const { decimals = 1, includeSign = true } = options;

  if (result.isInfinite) {
    return result.direction === 'down' ? '-∞%' : '∞%';
  }

  if (result.value === null || result.value === undefined) {
    return '—';
  }

  const rounded = Number(result.value.toFixed(decimals));
  const sign = includeSign && rounded > 0 ? '+' : '';
  return `${sign}${rounded}%`;
};

/**
 * Suggest a color class based on trend direction.
 */
export const trendColor = (direction: TrendDirection): string => {
  switch (direction) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    default:
      return 'text-slate-500';
  }
};
