"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import type { DateRange } from '@/types/filters';
import { getComparisonPresetOptions, formatDateRangeDisplay } from '@/lib/utils/dateHelpers';

interface ComparisonDatePickerProps {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
  mainDateRange: DateRange;
  className?: string;
}

export default function ComparisonDatePicker({ value, onChange, mainDateRange, className = '' }: ComparisonDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectingDate, setSelectingDate] = useState<'start' | 'end' | null>(null);
  const [tempRange, setTempRange] = useState<{start: Date | null, end: Date | null}>({
    start: value?.startDate || null,
    end: value?.endDate || null
  });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get comparison preset options based on main date range
  const comparisonPresets = getComparisonPresetOptions(mainDateRange);

  // Update internal state when value prop changes
  useEffect(() => {
    setTempRange({ start: value?.startDate || null, end: value?.endDate || null });
  }, [value?.startDate, value?.endDate]);

  const handleDateClick = useCallback((date: Date) => {
    if (!selectingDate) {
      // Start new selection
      setTempRange({ start: date, end: null });
      setSelectingDate('end');
    } else if (selectingDate === 'end') {
      // Complete the range
      const start = tempRange.start!;
      const end = date;

      const newRange: DateRange = {
        startDate: start <= end ? start : end,
        endDate: start <= end ? end : start,
        preset: 'custom'
      };

      onChange(newRange);
      setTempRange({ start: newRange.startDate, end: newRange.endDate });
      setSelectingDate(null);
      setHoveredDate(null);
      setIsOpen(false);
    }
  }, [selectingDate, tempRange.start, onChange]);

  const handlePresetSelect = (preset: string) => {
    if (preset === 'noComparison') {
      onChange(null);
      setTempRange({ start: null, end: null });
      setSelectingDate(null);
      setHoveredDate(null);
      setIsOpen(false);
      return;
    }

    const presetOption = comparisonPresets.find(p => p.value === preset);
    if (presetOption && presetOption.range) {
      const newRange = presetOption.range();
      onChange(newRange);
      setTempRange({ start: newRange.startDate, end: newRange.endDate });
      setSelectingDate(null);
      setHoveredDate(null);
      setIsOpen(false);
    }
  };

  const resetSelection = useCallback(() => {
    setSelectingDate(null);
    setHoveredDate(null);
    setTempRange({ start: value?.startDate || null, end: value?.endDate || null });
  }, [value?.startDate, value?.endDate]);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => subMonths(prev, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => addMonths(prev, 1));
  }, []);

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
        resetSelection();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          resetSelection();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handlePrevMonth();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNextMonth();
          break;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, resetSelection, handlePrevMonth, handleNextMonth]);

  const handleDateHover = (date: Date) => {
    if (selectingDate === 'end' && tempRange.start) {
      setHoveredDate(date);
    }
  };

  const handleDateLeave = () => {
    setHoveredDate(null);
  };

  const getCalendarDays = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });

    // Add empty cells for days before the first day of month
    const startDayOfWeek = getDay(start);
    const emptyDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Monday = 0

    return {
      emptyDays,
      days
    };
  };

  const isDateSelected = (date: Date) => {
    if (!tempRange.start || !tempRange.end) return false;
    return isSameDay(date, tempRange.start) || isSameDay(date, tempRange.end);
  };

  const isDateInRange = (date: Date) => {
    if (!tempRange.start || !tempRange.end) return false;
    return date >= tempRange.start && date <= tempRange.end;
  };

  const isDateInHoverRange = (date: Date) => {
    if (!tempRange.start || !hoveredDate || !selectingDate) return false;
    const start = tempRange.start;
    const end = hoveredDate;
    const minDate = start <= end ? start : end;
    const maxDate = start <= end ? end : start;
    return date >= minDate && date <= maxDate;
  };

  const isStartDate = (date: Date) => {
    return tempRange.start && isSameDay(date, tempRange.start);
  };

  const isEndDate = (date: Date) => {
    return tempRange.end && isSameDay(date, tempRange.end);
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const isDateInMainRange = (date: Date) => {
    // Check if the date falls within the main date range (selected period)
    return date >= mainDateRange.startDate && date <= mainDateRange.endDate;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
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
        <div
          ref={dropdownRef}
          className="absolute right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-w-[calc(100vw-2rem)] overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Calendar Section */}
            <div className="p-6">
              {/* Header with navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                  title="Previous month"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex flex-col items-center">
                  <div className="flex space-x-16 mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {format(currentDate, 'MMM yyyy')}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {format(addMonths(currentDate, 1), 'MMM yyyy')}
                    </span>
                  </div>
                  {selectingDate === 'end' && tempRange.start && (
                    <div className="text-xs text-blue-600 font-medium">
                      Select end date
                    </div>
                  )}
                </div>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                  title="Next month"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0">
                {/* First Month Calendar */}
                {(() => {
                  const { emptyDays, days } = getCalendarDays(currentDate);
                  return (
                    <div className="w-full md:w-56">
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                          <div key={day} className="text-xs text-gray-500 text-center py-1">{day}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({length: emptyDays}, (_, i) => (
                          <div key={`empty-${i}`} className="w-8 h-8"></div>
                        ))}
                        {days.map((day) => {
                          const isSelected = isDateSelected(day);
                          const isInRange = isDateInRange(day);
                          const isInHoverRange = isDateInHoverRange(day);
                          const isStart = isStartDate(day);
                          const isEnd = isEndDate(day);
                          const isTodayDate = isToday(day);
                          const isInMainPeriod = isDateInMainRange(day);
                          const isDisabled = isInMainPeriod;

                          return (
                            <button
                              key={day.toISOString()}
                              onClick={() => !isDisabled && handleDateClick(day)}
                              onMouseEnter={() => !isDisabled && handleDateHover(day)}
                              onMouseLeave={handleDateLeave}
                              disabled={isDisabled}
                              className={clsx(
                                "w-8 h-8 text-sm flex items-center justify-center transition-all duration-150 relative",
                                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
                                isDisabled && "text-gray-300 bg-gray-50 cursor-not-allowed",
                                !isDisabled && !isSelected && !isInRange && !isInHoverRange && "text-gray-700 hover:bg-gray-100 rounded",
                                !isDisabled && isTodayDate && !isSelected && "bg-blue-50 text-blue-600 font-semibold rounded",
                                !isDisabled && (isInRange || isInHoverRange) && !isSelected && "bg-gray-100 text-gray-800",
                                !isDisabled && isSelected && "bg-green-500 text-white font-semibold shadow-sm",
                                !isDisabled && isStart && isEnd && "rounded",
                                !isDisabled && isStart && !isEnd && "rounded-l",
                                !isDisabled && isEnd && !isStart && "rounded-r",
                                !isDisabled && isSelected && "rounded",
                                !isDisabled && isInHoverRange && selectingDate === 'end' && "bg-gray-200 text-gray-900"
                              )}
                            >
                              {format(day, 'd')}
                              {isTodayDate && !isSelected && (
                                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Second Month Calendar */}
                {(() => {
                  const nextMonth = addMonths(currentDate, 1);
                  const { emptyDays, days } = getCalendarDays(nextMonth);
                  return (
                    <div className="w-full md:w-56">
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                          <div key={day} className="text-xs text-gray-500 text-center py-1">{day}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({length: emptyDays}, (_, i) => (
                          <div key={`empty-${i}`} className="w-8 h-8"></div>
                        ))}
                        {days.map((day) => {
                          const isSelected = isDateSelected(day);
                          const isInRange = isDateInRange(day);
                          const isInHoverRange = isDateInHoverRange(day);
                          const isStart = isStartDate(day);
                          const isEnd = isEndDate(day);
                          const isTodayDate = isToday(day);
                          const isInMainPeriod = isDateInMainRange(day);
                          const isDisabled = isInMainPeriod;

                          return (
                            <button
                              key={day.toISOString()}
                              onClick={() => !isDisabled && handleDateClick(day)}
                              onMouseEnter={() => !isDisabled && handleDateHover(day)}
                              onMouseLeave={handleDateLeave}
                              disabled={isDisabled}
                              className={clsx(
                                "w-8 h-8 text-sm flex items-center justify-center transition-all duration-150 relative",
                                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
                                isDisabled && "text-gray-300 bg-gray-50 cursor-not-allowed",
                                !isDisabled && !isSelected && !isInRange && !isInHoverRange && "text-gray-700 hover:bg-gray-100 rounded",
                                !isDisabled && isTodayDate && !isSelected && "bg-blue-50 text-blue-600 font-semibold rounded",
                                !isDisabled && (isInRange || isInHoverRange) && !isSelected && "bg-gray-100 text-gray-800",
                                !isDisabled && isSelected && "bg-green-500 text-white font-semibold shadow-sm",
                                !isDisabled && isStart && isEnd && "rounded",
                                !isDisabled && isStart && !isEnd && "rounded-l",
                                !isDisabled && isEnd && !isStart && "rounded-r",
                                !isDisabled && isSelected && "rounded",
                                !isDisabled && isInHoverRange && selectingDate === 'end' && "bg-gray-200 text-gray-900"
                              )}
                            >
                              {format(day, 'd')}
                              {isTodayDate && !isSelected && (
                                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Preset Options Sidebar */}
            <div className="border-l border-gray-200 py-4 px-3 bg-white w-44">
              <div className="space-y-1">
                {comparisonPresets.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePresetSelect(option.value)}
                    className="w-full text-left text-sm py-1.5 px-2 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
