"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import { DateRange } from '@/types/filters';
import DateRangePicker from '@/components/filters/DateRangePicker';

interface ComparisonDatePickerProps {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
  mainDateRange: DateRange;
  className?: string;
}

// Helper function to create comparison date ranges
const getComparisonDateRange = (option: string, baseRange: DateRange): DateRange => {
  const { startDate, endDate } = baseRange;
  const duration = endDate.getTime() - startDate.getTime();

  switch (option) {
    case 'previous':
      const prevStart = new Date(startDate.getTime() - duration - 24 * 60 * 60 * 1000);
      const prevEnd = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
      return { startDate: prevStart, endDate: prevEnd, preset: 'custom' };

    case 'monthAgo':
      const monthAgoStart = new Date(startDate);
      monthAgoStart.setMonth(monthAgoStart.getMonth() - 1);
      const monthAgoEnd = new Date(endDate);
      monthAgoEnd.setMonth(monthAgoEnd.getMonth() - 1);
      return { startDate: monthAgoStart, endDate: monthAgoEnd, preset: 'custom' };

    case 'quarterAgo':
      const quarterAgoStart = new Date(startDate);
      quarterAgoStart.setMonth(quarterAgoStart.getMonth() - 3);
      const quarterAgoEnd = new Date(endDate);
      quarterAgoEnd.setMonth(quarterAgoEnd.getMonth() - 3);
      return { startDate: quarterAgoStart, endDate: quarterAgoEnd, preset: 'custom' };

    case 'yearAgo':
      const yearAgoStart = new Date(startDate);
      yearAgoStart.setFullYear(yearAgoStart.getFullYear() - 1);
      const yearAgoEnd = new Date(endDate);
      yearAgoEnd.setFullYear(yearAgoEnd.getFullYear() - 1);
      return { startDate: yearAgoStart, endDate: yearAgoEnd, preset: 'custom' };

    default:
      return { ...baseRange, preset: 'custom' };
  }
};

export default function ComparisonDatePicker({ value, onChange, mainDateRange, className = '' }: ComparisonDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Create comparison-specific presets based on main date range
  const comparisonPresets = [
    {
      label: 'Previous period',
      value: 'previous' as const,
      range: () => getComparisonDateRange('previous', mainDateRange)
    },
    {
      label: 'A month ago',
      value: 'monthAgo' as const,
      range: () => getComparisonDateRange('monthAgo', mainDateRange)
    },
    {
      label: 'A quarter ago',
      value: 'quarterAgo' as const,
      range: () => getComparisonDateRange('quarterAgo', mainDateRange)
    },
    {
      label: 'A year ago',
      value: 'yearAgo' as const,
      range: () => getComparisonDateRange('yearAgo', mainDateRange)
    }
  ];

  const handlePresetSelect = (preset: typeof comparisonPresets[0]) => {
    const range = preset.range();
    onChange(range);
    setIsOpen(false);
  };

  const handleCustomDateChange = (range: DateRange) => {
    onChange(range);
    setShowCustomPicker(false);
  };

  const handleRemoveComparison = () => {
    onChange(null);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 text-sm border rounded-lg shadow-sm transition-all duration-200
          ${value
            ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100'
            : 'border-gray-300 text-gray-700 bg-white hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {value ? (
          <div className="flex flex-col items-start">
            <span className="font-medium">Compare</span>
            <span className="text-xs opacity-75">
              {format(value.startDate, 'MMM d')} – {format(value.endDate, 'MMM d')}
            </span>
          </div>
        ) : (
          <span>Compare</span>
        )}
        <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-80">
          {/* Quick Comparison Presets */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Comparisons</h3>
            <div className="space-y-2">
              {comparisonPresets.map(preset => {
                const previewRange = preset.range();
                return (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetSelect(preset)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-150 group"
                  >
                    <div className="font-medium text-gray-900 group-hover:text-blue-900 mb-1">
                      {preset.label}
                    </div>
                    <div className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {format(previewRange.startDate, 'MMM d')} – {format(previewRange.endDate, 'MMM d')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Custom Range Option */}
          <div className="p-4">
            <button
              onClick={() => {
                setIsOpen(false);
                setShowCustomPicker(true);
              }}
              className="w-full text-left p-3 rounded-lg border border-dashed border-gray-300 hover:border-blue-300 hover:bg-blue-50 transition-all duration-150 group"
            >
              <div className="font-medium text-gray-900 group-hover:text-blue-900 mb-1">
                Custom Range
              </div>
              <div className="text-xs text-gray-500">
                Select specific dates
              </div>
            </button>
          </div>

          {/* Remove comparison option */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleRemoveComparison}
              className="w-full p-3 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-150"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Remove comparison
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Custom Date Picker Modal */}
      {showCustomPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Select Custom Comparison Range</h3>
            </div>
            <div className="p-4">
              <DateRangePicker
                value={value || { startDate: new Date(), endDate: new Date(), preset: 'custom' }}
                onChange={handleCustomDateChange}
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-2 justify-end">
              <button
                onClick={() => setShowCustomPicker(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
