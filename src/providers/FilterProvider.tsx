'use client';

/**
 * FilterProvider - Global filter context provider
 * Makes filter state available throughout the application
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

import { useFilterStore } from '@/stores/filterStore';
import { FilterState } from '@/types/filters';

interface FilterContextValue extends FilterState {
  // Additional context-specific properties
  isHydrated: boolean;
  isLoading: boolean;
  lastValidationError: string | null;

  // Enhanced actions
  refreshFilters: () => void;
  validateCurrentState: () => boolean;
}

const FilterContext = createContext<FilterContextValue | null>(null);

interface FilterProviderProps {
  children: React.ReactNode;
}

export function FilterProvider({ children }: FilterProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  const {
    dateRange,
    selectedAppeals,
    selectedFunds,
    frequency,
    setDateRange,
    setAppeals,
    setFunds,
    setFrequency,
    clearAllFilters,
    resetToDefaults,
    isLoading,
    lastValidationError,
    setLoading,
    setValidationError,
    hydrated
  } = useFilterStore();

  // Wait for Zustand store to hydrate from localStorage
  useEffect(() => {
    if (hydrated && !isHydrated) {
      setIsHydrated(true);
    }
  }, [hydrated, isHydrated]);

  // Additional context-specific functions
  const refreshFilters = () => {
    // This could trigger a refresh of filter data from APIs
    // Reserved for future implementation
  };

  const validateCurrentState = (): boolean => {
    try {
      // Validate current filter state
      if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
        setValidationError('Invalid date range');
        return false;
      }

      // Additional validation logic could go here
      setValidationError(null);
      return true;
    } catch (error) {
      setValidationError('Filter validation failed');
      return false;
    }
  };

  const contextValue: FilterContextValue = {
    // Core filter state
    dateRange,
    selectedAppeals,
    selectedFunds,
    frequency,

    // Actions
    setDateRange,
    setAppeals,
    setFunds,
    setFrequency,
    clearAllFilters,
    resetToDefaults,

    // Additional properties
    isHydrated,
    isLoading,
    lastValidationError,

    // Enhanced actions
    refreshFilters,
    validateCurrentState
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
}

/**
 * Hook to use filter context
 * Must be used within FilterProvider
 */
export function useFilterContext(): FilterContextValue {
  const context = useContext(FilterContext);

  if (!context) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }

  return context;
}

/**
 * Hook for components that need to listen to filter changes
 * Provides debounced filter change events
 */
export function useFilterChanges(
  callback: (filters: FilterContextValue) => void,
  debounceMs: number = 300
) {
  const filters = useFilterContext();
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [filters, debounceMs]);

  useEffect(() => {
    if (filters.isHydrated) {
      callback(debouncedFilters);
    }
  }, [debouncedFilters, callback, filters.isHydrated]);
}

/**
 * Hook to get filter parameters for API calls
 * Only returns parameters when filters are hydrated
 */
export function useFilterApiParams() {
  const { dateRange, selectedAppeal, selectedFund, frequency, isHydrated } = useFilterContext();

  if (!isHydrated) {
    return null;
  }

  return {
    startDate: dateRange.startDate.toISOString(),
    endDate: dateRange.endDate.toISOString(),
    appealId: selectedAppeal?.id || null,
    fundId: selectedFund?.id || null,
    frequency: frequency
  };
}

/**
 * Hook to check if filters are actively filtering (not at defaults)
 */
export function useIsFiltering() {
  const { selectedAppeal, selectedFund, frequency, dateRange } = useFilterContext();

  return (
    selectedAppeal !== null ||
    selectedFund !== null ||
    frequency !== 'all' ||
    dateRange.preset !== 'last30days'
  );
}