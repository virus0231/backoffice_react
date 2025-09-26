/**
 * Zustand store for global filter state management
 * Handles date range, appeal, fund, and frequency filters with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { FilterState, DateRange, Appeal, Fund, FrequencyType } from '@/types/filters';
import { getDefaultDateRange, validateDateRange } from '@/lib/utils/dateHelpers';

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
          lastValidationError: null
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
        frequency: state.frequency
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