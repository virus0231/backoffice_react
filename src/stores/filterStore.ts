/**
 * Zustand store for global filter state management
 * Handles date range, appeal, fund, and frequency filters with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { FilterState, DateRange, Appeal, Fund, FrequencyType } from '@/types/filters';
import { getDefaultDateRange, validateDateRange } from '@/lib/utils/dateHelpers';
import type { ChartComparison, ComparisonMapping } from '@/types/charts';
import { validateComparisonRange, coerceComparisonAwayFromMain } from '@/lib/validation/comparisonDates';
import { differenceInDays, subDays } from 'date-fns';

interface FilterStore extends FilterState {
  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Validation
  lastValidationError: string | null;
  setValidationError: (error: string | null) => void;

  // Persistence helpers
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;

  // Comparison state (per-chart)
  comparisons: ComparisonMapping;
  setChartComparison: (chartId: string, comparison: ChartComparison) => void;
  clearChartComparison: (chartId: string) => void;
  toggleChartComparison: (chartId: string, enabled?: boolean) => void;
  getChartComparison: (chartId: string) => ChartComparison | null;
}

/**
 * Default filter state
 */
const getDefaultState = (): Omit<FilterState, 'setDateRange' | 'setAppeal' | 'setFund' | 'setFrequency' | 'clearAllFilters' | 'resetToDefaults'> => ({
  dateRange: getDefaultDateRange(),
  selectedAppeal: null,
  selectedFund: null,
  frequency: 'all'
});

const getDefaultComparisons = (): ComparisonMapping => ({ });

const buildPreviousPeriod = (main: DateRange): { startDate: Date; endDate: Date } => {
  const length = Math.max(1, differenceInDays(main.endDate, main.startDate));
  const endDate = subDays(main.startDate, 1);
  const startDate = subDays(endDate, length);
  return { startDate, endDate };
};

/**
 * Filter store with persistence
 */
export const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      ...getDefaultState(),
      isLoading: false,
      lastValidationError: null,
      hydrated: false,
      comparisons: getDefaultComparisons(),

      // Date range actions
      setDateRange: (range: DateRange) => {
        const validation = validateDateRange(range);
        if (!validation.isValid) {
          set({ lastValidationError: validation.error || 'Invalid date range' });
          return;
        }

        set({
          dateRange: range,
          lastValidationError: null
        });
      },

      // Appeal actions
      setAppeal: (appeal: Appeal | null) => {
        set(state => ({
          selectedAppeal: appeal,
          // Clear fund selection when appeal changes (cascading logic)
          selectedFund: appeal && state.selectedFund?.appeal_id !== appeal.id ? null : state.selectedFund,
          lastValidationError: null
        }));
      },

      // Fund actions
      setFund: (fund: Fund | null) => {
        set({
          selectedFund: fund,
          lastValidationError: null
        });
      },

      // Frequency actions
      setFrequency: (frequency: FrequencyType) => {
        set({
          frequency,
          lastValidationError: null
        });
      },

      // Clear all filters
      clearAllFilters: () => {
        set({
          ...getDefaultState(),
          lastValidationError: null,
          comparisons: getDefaultComparisons()
        });
      },

      // Reset to defaults
      resetToDefaults: () => {
        set({
          ...getDefaultState(),
          lastValidationError: null
        });
      },

      // Loading state management
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Validation error management
      setValidationError: (error: string | null) => {
        set({ lastValidationError: error });
      },

      // Hydration state
      setHydrated: (hydrated: boolean) => {
        set({ hydrated });
      },

      // Comparison state actions
      setChartComparison: (chartId: string, comparison: ChartComparison) => {
        const main = get().dateRange;
        if (comparison.enabled && comparison.startDate && comparison.endDate) {
          const result = validateComparisonRange(main, {
            startDate: comparison.startDate,
            endDate: comparison.endDate,
            preset: comparison.preset || 'custom'
          });
          if (!result.isValid) {
            set({ lastValidationError: result.error || 'Invalid comparison selection' });
            return;
          }
        }

        set(state => ({
          comparisons: {
            ...state.comparisons,
            [chartId]: { ...comparison }
          },
          lastValidationError: null
        }));
      },

      clearChartComparison: (chartId: string) => {
        set(state => {
          const next = { ...state.comparisons };
          delete next[chartId];
          return { comparisons: next, lastValidationError: null } as Partial<FilterStore> as any;
        });
      },

      toggleChartComparison: (chartId: string, enabled?: boolean) => {
        const state = get();
        const current = state.comparisons[chartId];
        const nextEnabled = enabled ?? !(current?.enabled ?? false);

        if (!nextEnabled) {
          set(state => ({
            comparisons: {
              ...state.comparisons,
              [chartId]: { enabled: false, startDate: null, endDate: null, preset: 'custom' }
            }
          }));
          return;
        }

        // When enabling, if no range, default to previous period with same length
        let startDate = current?.startDate ?? null;
        let endDate = current?.endDate ?? null;
        if (!startDate || !endDate) {
          const prev = buildPreviousPeriod(state.dateRange);
          startDate = prev.startDate;
          endDate = prev.endDate;
        }

        // Coerce away from main if overlapping
        const adjusted = coerceComparisonAwayFromMain(state.dateRange, {
          startDate,
          endDate,
          preset: current?.preset || 'custom'
        });

        set(s => ({
          comparisons: {
            ...s.comparisons,
            [chartId]: { enabled: true, startDate: adjusted.startDate, endDate: adjusted.endDate, preset: adjusted.preset }
          },
          lastValidationError: null
        }));
      },

      getChartComparison: (chartId: string) => {
        const c = get().comparisons[chartId];
        return c ? { ...c } : null;
      }
    }),
    {
      name: 'insights-filter-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        dateRange: state.dateRange,
        selectedAppeal: state.selectedAppeal,
        selectedFund: state.selectedFund,
        frequency: state.frequency,
        comparisons: state.comparisons
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Failed to rehydrate filter store:', error);
          return;
        }

        if (state) {
          // Validate rehydrated date range
          if (state.dateRange) {
            const validation = validateDateRange(state.dateRange);
            if (!validation.isValid) {
              console.warn('Invalid persisted date range, resetting to default');
              state.dateRange = getDefaultDateRange();
            }
          }

          // Sanitize comparison ranges
          if ((state as any).comparisons) {
            const comps = (state as any).comparisons as ComparisonMapping;
            const sanitized: ComparisonMapping = {};
            for (const key of Object.keys(comps)) {
              const c = comps[key]!;
              if (!c || !c.enabled || !c.startDate || !c.endDate) {
                sanitized[key] = { enabled: false, startDate: null, endDate: null, preset: 'custom' };
                continue;
              }
              const check = validateComparisonRange(state.dateRange!, {
                startDate: new Date(c.startDate),
                endDate: new Date(c.endDate),
                preset: c.preset || 'custom'
              });
              if (!check.isValid) {
                // Default to previous period
                const prev = buildPreviousPeriod(state.dateRange!);
                sanitized[key] = { enabled: true, startDate: prev.startDate, endDate: prev.endDate, preset: 'custom' };
              } else {
                sanitized[key] = {
                  enabled: true,
                  startDate: new Date(c.startDate),
                  endDate: new Date(c.endDate),
                  preset: c.preset || 'custom'
                };
              }
            }
            (state as any).comparisons = sanitized;
          } else {
            (state as any).comparisons = getDefaultComparisons();
          }

          // Set hydrated flag
          state.setHydrated(true);
        }
      }
    }
  )
);

/**
 * Hook to get current filter parameters for API calls
 */
export const useFilterParams = () => {
  const { dateRange, selectedAppeal, selectedFund, frequency } = useFilterStore();

  return {
    startDate: dateRange.startDate.toISOString(),
    endDate: dateRange.endDate.toISOString(),
    appealId: selectedAppeal?.id || null,
    fundId: selectedFund?.id || null,
    frequency: frequency
  };
};

/**
 * Hook to check if any filters are active
 */
export const useHasActiveFilters = () => {
  const { selectedAppeal, selectedFund, frequency, dateRange } = useFilterStore();

  return (
    selectedAppeal !== null ||
    selectedFund !== null ||
    frequency !== 'all' ||
    (dateRange.preset !== 'last30days' && dateRange.preset !== null)
  );
};

/**
 * Hook for debugging filter state
 */
export const useFilterDebug = () => {
  const state = useFilterStore();

  return {
    currentState: {
      dateRange: state.dateRange,
      selectedAppeal: state.selectedAppeal,
      selectedFund: state.selectedFund,
      frequency: state.frequency,
      isLoading: state.isLoading,
      lastValidationError: state.lastValidationError,
      hydrated: state.hydrated
    },
    actions: {
      clearAll: state.clearAllFilters,
      reset: state.resetToDefaults,
      setLoading: state.setLoading
    }
  };
};
