"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import { DateRange } from '@/types/filters';
import DateRangePicker from '@/components/filters/DateRangePicker';
import { getComparisonPresetOptions } from '@/lib/utils/dateHelpers';

interface ComparisonDatePickerProps {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
  mainDateRange: DateRange;
  className?: string;
}

export default function ComparisonDatePicker({ value, onChange, mainDateRange, className = '' }: ComparisonDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get comparison preset options based on main date range
  const comparisonPresets = getComparisonPresetOptions(mainDateRange);

  const handleDateRangeChange = (range: DateRange) => {
    // Check if it's the "No comparison" option (same start and end date)
    if (range.startDate.getTime() === range.endDate.getTime()) {
      onChange(null);
    } else {
      onChange(range);
    }
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
          <span>No comparison</span>
        )}
        <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50">
          <DateRangePicker
            value={value || { startDate: new Date(), endDate: new Date(), preset: 'custom' }}
            onChange={handleDateRangeChange}
            presetOptions={comparisonPresets}
          />
        </div>
      )}
    </div>
  );
}
