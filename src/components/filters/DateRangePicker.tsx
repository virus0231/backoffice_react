'use client';

/**
 * DateRangePicker component for universal filter system
 * Provides preset date options and custom date range selection
 */

import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';

import { DateRange, DatePreset, DatePresetOption } from '@/types/filters';
import {
  datePresetOptions,
  getDateRangeForPreset,
  formatDateRangeDisplay
} from '@/lib/utils/dateHelpers';

type NullableDateRange = {
  startDate: Date | null;
  endDate: Date | null;
  preset?: DatePreset | null;
};

interface DateRangePickerProps {
  value: DateRange | NullableDateRange;
  onChange: (range: DateRange) => void;
  className?: string;
  disabled?: boolean;
  presetOptions?: DatePresetOption[];
  placeholder?: string;
}

export default function DateRangePicker({
  value,
  onChange,
  className,
  disabled = false,
  presetOptions = datePresetOptions,
  placeholder = 'Select date range'
}: DateRangePickerProps) {
  const normalizedValue: NullableDateRange = {
    startDate: value.startDate ?? null,
    endDate: value.endDate ?? null,
    preset: value.preset ?? null
  };

  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectingDate, setSelectingDate] = useState<'start' | 'end' | null>(null);
  const [tempRange, setTempRange] = useState<{start: Date | null, end: Date | null}>({
    start: normalizedValue.startDate,
    end: normalizedValue.endDate
  });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [activePreset, setActivePreset] = useState<DatePreset | null>(normalizedValue.preset || null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Update internal state when value prop changes
  useEffect(() => {
    setTempRange({ start: normalizedValue.startDate, end: normalizedValue.endDate });
    setActivePreset(normalizedValue.preset || null);
  }, [normalizedValue.startDate, normalizedValue.endDate, normalizedValue.preset]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updateDropdownPosition = useCallback(() => {
    if (typeof window === 'undefined' || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownWidth = 660; // approximate width of calendar + presets
    const padding = 12;
    const maxLeft = window.scrollX + window.innerWidth - dropdownWidth - padding;
    const left = Math.max(padding + window.scrollX, Math.min(rect.left + window.scrollX, maxLeft));
    const top = rect.bottom + window.scrollY + 8;

    setDropdownPosition({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;

    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);

    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [isOpen, updateDropdownPosition]);

  const handleDateClick = useCallback((date: Date) => {
    if (!selectingDate) {
      // Start new selection
      setTempRange({ start: date, end: null });
      setSelectingDate('end');
      setActivePreset('custom');
    } else if (selectingDate === 'end') {
      // Complete the range
      const start = tempRange.start ?? date;
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
      setActivePreset('custom');
      setIsOpen(false);
    }
  }, [selectingDate, tempRange.start, onChange]);

  const resetSelection = useCallback(() => {
    setSelectingDate(null);
    setHoveredDate(null);
    setTempRange({ start: normalizedValue.startDate, end: normalizedValue.endDate });
  }, [normalizedValue.startDate, normalizedValue.endDate]);

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
        case 'Enter':
          if (selectingDate === 'end' && tempRange.start && hoveredDate) {
            handleDateClick(hoveredDate);
          }
          break;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, selectingDate, tempRange.start, hoveredDate, handleDateClick, resetSelection, handlePrevMonth, handleNextMonth]);

  const handlePresetSelect = (preset: DatePreset) => {
    const newRange = getDateRangeForPreset(preset);
    onChange(newRange);
    setTempRange({ start: newRange.startDate, end: newRange.endDate });
    setActivePreset(preset);
    setSelectingDate(null);
    setHoveredDate(null);
    setIsOpen(false);
  };


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

  return (
    <div className={clsx('relative', className)}>
      {/* Date Range Display Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (disabled) return;
          if (!isOpen) updateDropdownPosition();
          setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className={clsx(
          'flex items-center justify-between w-full px-4 py-2.5 text-sm',
          'bg-white border border-gray-300 rounded-lg shadow-sm',
          'hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20',
          'transition-colors duration-200',
          disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
          className
        )}
      >
        <div className="flex items-center">
          <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-700">
            {normalizedValue.startDate && normalizedValue.endDate
              ? formatDateRangeDisplay({
                  startDate: normalizedValue.startDate,
                  endDate: normalizedValue.endDate,
                  preset: (normalizedValue.preset as DatePreset) || 'custom'
                })
              : placeholder}
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
      {isOpen && !disabled && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: 'absolute', top: dropdownPosition.top, left: dropdownPosition.left, zIndex: 50 }}
          className="bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <div className="flex">
            {/* Calendar Section */}
            <div className="p-6">
              {/* Header with navigation and selection info */}
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
                  {selectingDate === null && tempRange.start && tempRange.end && (
                    <div className="text-xs text-green-600 font-medium">
                      {formatDateRangeDisplay({startDate: tempRange.start, endDate: tempRange.end, preset: 'custom'})}
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

              {/* Selection helper hidden to match desired UI */}

              <div className="flex space-x-8">
                {/* First Month Calendar */}
                {(() => {
                  const { emptyDays, days } = getCalendarDays(currentDate);
                  return (
                    <div className="w-56">
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                          <div key={day} className="text-xs text-gray-500 text-center py-1">{day}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells for start of month */}
                        {Array.from({length: emptyDays}, (_, i) => (
                          <div key={`empty-${i}`} className="w-8 h-8"></div>
                        ))}
                        {/* Month days */}
                        {days.map((day) => {
                          const isSelected = isDateSelected(day);
                          const isInRange = isDateInRange(day);
                          const isInHoverRange = isDateInHoverRange(day);
                          const isStart = isStartDate(day);
                          const isEnd = isEndDate(day);
                          const isTodayDate = isToday(day);

                          return (
                            <button
                              key={day.toISOString()}
                              onClick={() => handleDateClick(day)}
                              onMouseEnter={() => handleDateHover(day)}
                              onMouseLeave={handleDateLeave}
                              className={clsx(
                                "w-8 h-8 text-sm flex items-center justify-center transition-all duration-150 relative",
                                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
                                // Base styling
                                !isSelected && !isInRange && !isInHoverRange && "text-gray-700 hover:bg-gray-100 rounded",
                                // Today styling
                                isTodayDate && !isSelected && "bg-blue-50 text-blue-600 font-semibold rounded",
                                // Range styling (light gray fill like reference)
                                (isInRange || isInHoverRange) && !isSelected && "bg-gray-100 text-gray-800",
                                // Selected dates (start/end)
                                isSelected && "bg-green-500 text-white font-semibold shadow-sm",
                                // Rounded corners for range
                                isStart && isEnd && "rounded",
                                isStart && !isEnd && "rounded-l",
                                isEnd && !isStart && "rounded-r",
                                isSelected && "rounded",
                                // Hover preview for range selection
                                isInHoverRange && selectingDate === 'end' && "bg-gray-200 text-gray-900"
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
                    <div className="w-56">
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                          <div key={day} className="text-xs text-gray-500 text-center py-1">{day}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells for start of month */}
                        {Array.from({length: emptyDays}, (_, i) => (
                          <div key={`empty-${i}`} className="w-8 h-8"></div>
                        ))}
                        {/* Month days */}
                        {days.map((day) => {
                          const isSelected = isDateSelected(day);
                          const isInRange = isDateInRange(day);
                          const isInHoverRange = isDateInHoverRange(day);
                          const isStart = isStartDate(day);
                          const isEnd = isEndDate(day);
                          const isTodayDate = isToday(day);

                          return (
                            <button
                              key={day.toISOString()}
                              onClick={() => handleDateClick(day)}
                              onMouseEnter={() => handleDateHover(day)}
                              onMouseLeave={handleDateLeave}
                              className={clsx(
                                "w-8 h-8 text-sm flex items-center justify-center transition-all duration-150 relative",
                                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
                                // Base styling
                                !isSelected && !isInRange && !isInHoverRange && "text-gray-700 hover:bg-gray-100 rounded",
                                // Today styling
                                isTodayDate && !isSelected && "bg-blue-50 text-blue-600 font-semibold rounded",
                                // Range styling (light gray fill like reference)
                                (isInRange || isInHoverRange) && !isSelected && "bg-gray-100 text-gray-800",
                                // Selected dates (start/end)
                                isSelected && "bg-green-500 text-white font-semibold shadow-sm",
                                // Rounded corners for range
                                isStart && isEnd && "rounded",
                                isStart && !isEnd && "rounded-l",
                                isEnd && !isStart && "rounded-r",
                                isSelected && "rounded",
                                // Hover preview for range selection
                                isInHoverRange && selectingDate === 'end' && "bg-gray-200 text-gray-900"
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

            {/* Preset Options Sidebar (right) */}
            <div className="border-l border-gray-200 py-4 px-3 bg-white w-44">
              <div className="space-y-1">
                {presetOptions
                  .filter(option => option.value !== 'custom')
                  .map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePresetSelect(option.value)}
                    className={clsx(
                      "w-full text-left text-sm py-1.5 px-2 rounded-md",
                      activePreset === option.value
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
