/**
 * Chart and comparison-related type definitions
 */

import type { DatePreset } from '@/types/filters';

export type ChartId = string;

export interface ChartComparison {
  enabled: boolean;
  startDate: Date | null;
  endDate: Date | null;
  preset?: DatePreset | null;
}

export interface ComparisonMapping {
  [chartId: ChartId]: ChartComparison | undefined;
}

export interface ComparisonActions {
  setChartComparison: (chartId: ChartId, comparison: ChartComparison) => void;
  clearChartComparison: (chartId: ChartId) => void;
  toggleChartComparison: (chartId: ChartId, enabled?: boolean) => void;
  getChartComparison: (chartId: ChartId) => ChartComparison | null;
}

