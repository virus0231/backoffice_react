'use client';

/**
 * FilterBar - Combined filter interface component
 * Integrates all filter components into a unified interface
 */

import React from 'react';
import { clsx } from 'clsx';

import { useFilterContext, useIsFiltering } from '@/providers/FilterProvider';
import DateRangePicker from './DateRangePicker';
import AppealsFilter from './AppealsFilter';
import FundsFilter from './FundsFilter';
import FrequencyFilter from './FrequencyFilter';
import { useFilterStore } from '@/stores/filterStore';
import { formatDateRangeDisplay } from '@/lib/utils/dateHelpers';

interface FilterBarProps {
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'grid';
  showClearAll?: boolean;
  disabled?: boolean;
}

export default function FilterBar({
  className,
  layout = 'horizontal',
  showClearAll = true,
  disabled = false
}: FilterBarProps) {
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
    isHydrated,
    isLoading,
    lastValidationError
  } = useFilterContext();

  const isFiltering = useIsFiltering();
  const { comparisons } = useFilterStore();

  // Don't render until store is hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className={clsx('animate-pulse', className)}>
        <div className="flex space-x-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg w-48"></div>
          ))}
        </div>
      </div>
    );
  }

  const layoutClasses = {
    horizontal: 'flex flex-wrap items-center gap-4',
    vertical: 'flex flex-col space-y-4',
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
  };

  return (
    <div className="flex items-center gap-4">
      {/* Date Range Picker */}
      <DateRangePicker
        value={dateRange}
        onChange={setDateRange}
        disabled={disabled || isLoading}
      />

      {/* Appeals Filter */}
      <AppealsFilter
        value={selectedAppeals}
        onChange={setAppeals}
        disabled={disabled || isLoading}
      />

      {/* Funds Filter */}
      <FundsFilter
        value={selectedFunds}
        onChange={setFunds}
        selectedAppeals={selectedAppeals}
        disabled={disabled || isLoading}
      />

      {/* Frequency Filter */}
      <FrequencyFilter
        value={frequency}
        onChange={setFrequency}
        disabled={disabled || isLoading}
      />
    </div>
  );
}
