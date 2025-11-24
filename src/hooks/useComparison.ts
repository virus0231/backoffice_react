"use client";

/**
 * useComparison - Hook to manage per-chart comparison state
 */

import { useMemo, useState } from 'react';

import type { DateRange } from '@/types/filters';
import type { ChartComparison } from '@/types/charts';
import { useFilterStore } from '@/stores/filterStore';
import { datePresetOptions, formatDateRangeDisplay } from '@/lib/utils/dateHelpers';
import { validateComparisonRange } from '@/lib/validation/comparisonDates';

export interface UseComparisonResult {
  enabled: boolean;
  comparison: ChartComparison | null;
  summary: string | null;
  error: string | null;
  setRange: (range: DateRange) => boolean; // returns true on success
  toggle: (enabled?: boolean) => void;
  clear: () => void;
  presets: typeof datePresetOptions;
}

export const useComparison = (chartId: string): UseComparisonResult => {
  const {
    dateRange,
    comparisons,
    setChartComparison,
    toggleChartComparison,
    clearChartComparison,
    lastValidationError
  } = useFilterStore();

  const comparison = comparisons?.[chartId] ?? null;
  const [localError, setLocalError] = useState<string | null>(null);

  const enabled = !!comparison?.enabled;

  const summary = useMemo(() => {
    if (!comparison || !comparison.startDate || !comparison.endDate) return null;
    return formatDateRangeDisplay({
      startDate: new Date(comparison.startDate),
      endDate: new Date(comparison.endDate),
      preset: comparison.preset || 'custom'
    });
  }, [comparison]);

  const setRange = (range: DateRange): boolean => {
    const check = validateComparisonRange(dateRange, range);
    if (!check.isValid) {
      setLocalError(check.error || 'Invalid comparison range');
      return false;
    }
    setLocalError(null);
    setChartComparison(chartId, {
      enabled: true,
      startDate: range.startDate,
      endDate: range.endDate,
      preset: range.preset || 'custom'
    });
    return true;
  };

  const toggle = (next?: boolean) => toggleChartComparison(chartId, next);
  const clear = () => clearChartComparison(chartId);

  return {
    enabled,
    comparison,
    summary,
    error: localError || lastValidationError,
    setRange,
    toggle,
    clear,
    presets: datePresetOptions
  };
};

