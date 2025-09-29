'use client';

/**
 * DualMonthDatePicker - Reusable dual-month calendar component
 * Can be used in charts and filters throughout the application
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

interface DualMonthDatePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function DualMonthDatePicker({
  value,
  onChange,
  className,
  disabled = false,
  placeholder = "Select date range",
  size = 'md'
}: DualMonthDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    const newRange = getDateRangeForPreset(preset);
    onChange(newRange);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: 'px-2 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-sm'
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
          'flex items-center justify-between w-full',
          'bg-white border border-gray-300 rounded-md shadow-sm',
          'hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20',
          'transition-colors duration-200',
          sizeClasses[size],
          disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
        )}
      >
        <div className="flex items-center">
          <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-700">
            {value ? formatDateRangeDisplay(value) : placeholder}
          </span>
        </div>
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

      {/* Dual Month Calendar Dropdown */}
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <div className="flex">
            {/* Calendar Section */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex space-x-8">
                  <span className="text-sm font-medium text-gray-900">Aug 2025</span>
                  <span className="text-sm font-medium text-gray-900">Sep 2025</span>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="flex space-x-8">
                {/* August Calendar */}
                <div className="w-48">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="text-xs text-gray-500 text-center py-1">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {/* August days */}
                    {Array.from({length: 31}, (_, i) => (
                      <button
                        key={i + 1}
                        className={clsx(
                          "w-6 h-6 text-xs rounded hover:bg-gray-100",
                          i + 1 === 27 ? "bg-green-500 text-white" : "text-gray-700"
                        )}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* September Calendar */}
                <div className="w-48">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="text-xs text-gray-500 text-center py-1">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {/* September days */}
                    {Array.from({length: 30}, (_, i) => (
                      <button
                        key={i + 1}
                        className={clsx(
                          "w-6 h-6 text-xs rounded hover:bg-gray-100",
                          i + 1 === 27 ? "bg-green-500 text-white" : "text-gray-700"
                        )}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Preset Options Sidebar */}
            <div className="border-l border-gray-200 p-4 w-32">
              <div className="space-y-1">
                <button
                  onClick={() => handlePresetSelect('all')}
                  className="w-full text-left text-sm py-1 px-2 hover:bg-gray-100 rounded"
                >
                  All
                </button>
                <button
                  onClick={() => handlePresetSelect('today')}
                  className="w-full text-left text-sm py-1 px-2 hover:bg-gray-100 rounded"
                >
                  Today
                </button>
                <button
                  onClick={() => handlePresetSelect('yesterday')}
                  className="w-full text-left text-sm py-1 px-2 hover:bg-gray-100 rounded"
                >
                  Yesterday
                </button>
                <button
                  onClick={() => handlePresetSelect('last7days')}
                  className="w-full text-left text-sm py-1 px-2 hover:bg-gray-100 rounded"
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => handlePresetSelect('last14days')}
                  className="w-full text-left text-sm py-1 px-2 hover:bg-gray-100 rounded"
                >
                  Last 14 days
                </button>
                <button
                  onClick={() => handlePresetSelect('last30days')}
                  className="w-full text-left text-sm py-1 px-2 hover:bg-gray-100 rounded"
                >
                  Last 30 days
                </button>
                <button
                  onClick={() => handlePresetSelect('thisWeek')}
                  className="w-full text-left text-sm py-1 px-2 hover:bg-gray-100 rounded"
                >
                  This week
                </button>
                <button
                  onClick={() => handlePresetSelect('thisMonth')}
                  className="w-full text-left text-sm py-1 px-2 hover:bg-gray-100 rounded"
                >
                  This month
                </button>
                <button
                  onClick={() => handlePresetSelect('thisYear')}
                  className="w-full text-left text-sm py-1 px-2 hover:bg-gray-100 rounded"
                >
                  This year
                </button>
                <button
                  onClick={() => handlePresetSelect('lastWeek')}
                  className="w-full text-left text-sm py-1 px-2 hover:bg-gray-100 rounded"
                >
                  Last week
                </button>
                <button
                  onClick={() => handlePresetSelect('lastMonth')}
                  className="w-full text-left text-sm py-1 px-2 hover:bg-gray-100 rounded"
                >
                  Last month
                </button>
                <button
                  onClick={() => handlePresetSelect('lastYear')}
                  className="w-full text-left text-sm py-1 px-2 hover:bg-gray-100 rounded"
                >
                  Last year
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}