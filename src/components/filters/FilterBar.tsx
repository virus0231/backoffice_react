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
    selectedAppeal,
    selectedFund,
    frequency,
    setDateRange,
    setAppeal,
    setFund,
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
    <div className={clsx('w-full', className)}>
      {/* Validation Error Display */}
      {lastValidationError && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {lastValidationError}
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className={layoutClasses[layout]}>
        {/* Date Range Picker */}
        <div className={clsx(
          layout === 'horizontal' ? 'flex-1 min-w-48' : 'w-full'
        )}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            disabled={disabled || isLoading}
          />
        </div>

        {/* Appeals Filter */}
        <div className={clsx(
          layout === 'horizontal' ? 'flex-1 min-w-48' : 'w-full'
        )}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Appeal/Campaign
          </label>
          <AppealsFilter
            value={selectedAppeal}
            onChange={setAppeal}
            disabled={disabled || isLoading}
          />
        </div>

        {/* Funds Filter */}
        <div className={clsx(
          layout === 'horizontal' ? 'flex-1 min-w-48' : 'w-full'
        )}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fund
          </label>
          <FundsFilter
            value={selectedFund}
            onChange={setFund}
            selectedAppeal={selectedAppeal}
            disabled={disabled || isLoading}
          />
        </div>

        {/* Frequency Filter */}
        <div className={clsx(
          layout === 'horizontal' ? 'flex-1 min-w-48' : 'w-full'
        )}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Donation Type
          </label>
          <FrequencyFilter
            value={frequency}
            onChange={setFrequency}
            disabled={disabled || isLoading}
          />
        </div>

        {/* Clear All Button */}
        {showClearAll && isFiltering && (
          <div className={clsx(
            layout === 'horizontal' ? 'flex-shrink-0' : 'w-full',
            'flex items-end'
          )}>
            <button
              type="button"
              onClick={clearAllFilters}
              disabled={disabled || isLoading}
              className={clsx(
                'px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200',
                'bg-gray-100 text-gray-700 hover:bg-gray-200',
                'focus:ring-2 focus:ring-gray-500 focus:ring-opacity-20',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                layout === 'horizontal' ? 'h-10' : 'w-full'
              )}
            >
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {isFiltering && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">Active Filters:</div>
            <div className="flex flex-wrap gap-2">
              {selectedAppeal && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  Appeal: {selectedAppeal.appeal_name}
                </span>
              )}
              {selectedFund && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  Fund: {selectedFund.fund_name}
                </span>
              )}
              {frequency !== 'all' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  Type: {frequency}
                </span>
              )}
              {dateRange.preset !== 'last30days' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  Date: {dateRange.preset || 'Custom'}
                </span>
              )}
              {/* Comparison summary */}
              {Object.keys(comparisons || {}).filter(id => comparisons[id]?.enabled && comparisons[id]?.startDate && comparisons[id]?.endDate).length > 0 && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {Object.entries(comparisons)
                    .filter(([, c]) => c?.enabled && c.startDate && c.endDate)
                    .slice(0, 3)
                    .map(([id, c]) => `${id}: ${formatDateRangeDisplay({ startDate: new Date(c!.startDate!), endDate: new Date(c!.endDate!), preset: c!.preset || 'custom' })}`)
                    .join(' • ')}
                  {Object.keys(comparisons).filter(id => comparisons[id]?.enabled && comparisons[id]?.startDate && comparisons[id]?.endDate).length > 3 ? '…' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="mt-2 flex items-center text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Updating filters...
        </div>
      )}
    </div>
  );
}
