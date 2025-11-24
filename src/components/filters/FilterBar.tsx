'use client';

/**
 * FilterBar - Combined filter interface component
 * Integrates all filter components into a unified interface
 */

import React, { useState } from 'react';
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const getActiveFilterCount = () => {
    let count = 0;
    if (dateRange.preset && dateRange.preset !== 'last30days') count++;
    if (selectedAppeals.length > 0) count++;
    if (selectedFunds.length > 0) count++;
    if (frequency !== 'all') count++;
    return count;
  };

  return (
    <>
      {/* Mobile: Toggle Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsDrawerOpen(true)}
          disabled={disabled}
          className={clsx(
            'flex items-center justify-between w-full px-4 py-2.5 text-sm',
            'bg-white border border-gray-300 rounded-lg shadow-sm',
            'hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20',
            'transition-all duration-200',
            disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
          )}
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="font-medium text-gray-900">Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getActiveFilterCount()}
              </span>
            )}
          </div>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Mobile: Drawer/Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filters Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Client switcher moved to Profile Panel */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  disabled={disabled || isLoading}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appeals</label>
                <AppealsFilter
                  value={selectedAppeals}
                  onChange={setAppeals}
                  disabled={disabled || isLoading}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Funds</label>
                <FundsFilter
                  value={selectedFunds}
                  onChange={setFunds}
                  selectedAppeals={selectedAppeals}
                  disabled={disabled || isLoading}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <FrequencyFilter
                  value={frequency}
                  onChange={setFrequency}
                  disabled={disabled || isLoading}
                  className="w-full"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={() => {
                  clearAllFilters();
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: Horizontal Filters */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Client switcher moved to Profile Panel */}

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
    </>
  );
}
