'use client';

/**
 * DateRangePicker component for universal filter system
 * Provides preset date options and custom date range selection
 */

import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

import { DateRange, DatePreset } from '@/types/filters';
import {
  datePresetOptions,
  getDateRangeForPreset,
  validateDateRange,
  formatDateRangeDisplay
} from '@/lib/utils/dateHelpers';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
  disabled?: boolean;
}

export default function DateRangePicker({
  value,
  onChange,
  className,
  disabled = false
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(
    value.preset === 'custom' ? format(value.startDate, 'yyyy-MM-dd') : ''
  );
  const [customEndDate, setCustomEndDate] = useState(
    value.preset === 'custom' ? format(value.endDate, 'yyyy-MM-dd') : ''
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePresetSelect = (preset: DatePreset) => {
    setValidationError(null);
    const newRange = getDateRangeForPreset(preset);

    if (preset === 'custom') {
      // Initialize custom dates with current range
      setCustomStartDate(format(value.startDate, 'yyyy-MM-dd'));
      setCustomEndDate(format(value.endDate, 'yyyy-MM-dd'));
    } else {
      onChange(newRange);
      setIsOpen(false);
    }
  };

  const handleCustomDateChange = (type: 'start' | 'end', dateString: string) => {
    if (type === 'start') {
      setCustomStartDate(dateString);
    } else {
      setCustomEndDate(dateString);
    }

    // Validate and apply custom date range if both dates are provided
    if (dateString && (type === 'start' ? customEndDate : customStartDate)) {
      const startDate = new Date(type === 'start' ? dateString : customStartDate);
      const endDate = new Date(type === 'end' ? dateString : customEndDate);

      const customRange: DateRange = {
        startDate,
        endDate,
        preset: 'custom'
      };

      const validation = validateDateRange(customRange);
      if (validation.isValid) {
        setValidationError(null);
        onChange(customRange);
      } else {
        setValidationError(validation.error || 'Invalid date range');
      }
    }
  };

  const handleApplyCustomRange = () => {
    if (customStartDate && customEndDate) {
      const customRange: DateRange = {
        startDate: new Date(customStartDate),
        endDate: new Date(customEndDate),
        preset: 'custom'
      };

      const validation = validateDateRange(customRange);
      if (validation.isValid) {
        setValidationError(null);
        onChange(customRange);
        setIsOpen(false);
      } else {
        setValidationError(validation.error || 'Invalid date range');
      }
    }
  };

  return (
    <div className={clsx('relative', className)}>
      {/* Date Range Display Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          'flex items-center justify-between w-full px-4 py-2.5 text-sm',
          'bg-white border border-gray-300 rounded-lg shadow-sm',
          'hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20',
          'transition-colors duration-200',
          disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
        )}
      >
        <span className="text-gray-900">
          {formatDateRangeDisplay(value)}
        </span>
        <svg
          className={clsx(
            'w-4 h-4 text-gray-500 transition-transform duration-200',
            isOpen && 'transform rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-80 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <div className="p-4">
            {/* Preset Options */}
            <div className="space-y-1 mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Select</h4>
              <div className="grid grid-cols-2 gap-1">
                {datePresetOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePresetSelect(option.value)}
                    className={clsx(
                      'px-3 py-2 text-sm text-left rounded-md transition-colors duration-150',
                      value.preset === option.value
                        ? 'bg-blue-100 text-blue-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            {value.preset === 'custom' && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Custom Range</h4>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="custom-start-date" className="block text-xs font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      id="custom-start-date"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => handleCustomDateChange('start', e.target.value)}
                      max={format(new Date(), 'yyyy-MM-dd')}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="custom-end-date" className="block text-xs font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      id="custom-end-date"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => handleCustomDateChange('end', e.target.value)}
                      max={format(new Date(), 'yyyy-MM-dd')}
                      min={customStartDate}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Validation Error */}
                  {validationError && (
                    <div className="p-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {validationError}
                    </div>
                  )}

                  {/* Apply Button */}
                  <button
                    type="button"
                    onClick={handleApplyCustomRange}
                    disabled={!customStartDate || !customEndDate || !!validationError}
                    className={clsx(
                      'w-full px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                      !customStartDate || !customEndDate || !!validationError
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
                    )}
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}