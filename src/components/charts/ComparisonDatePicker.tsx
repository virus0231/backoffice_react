"use client";

import React, { useState, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface ComparisonDatePickerProps {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
  className?: string;
}

const comparisonOptions = [
  { label: 'Previous period', value: 'previous' },
  { label: 'A month ago', value: 'monthAgo' },
  { label: 'A quarter ago', value: 'quarterAgo' },
  { label: 'A year ago', value: 'yearAgo' },
];

export default function ComparisonDatePicker({ value, onChange, className = '' }: ComparisonDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempRange, setTempRange] = useState<DateRange | null>(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getComparisonDateRange = (option: string, baseRange: DateRange): DateRange => {
    const { startDate, endDate } = baseRange;
    const duration = endDate.getTime() - startDate.getTime();

    switch (option) {
      case 'previous':
        const prevStart = new Date(startDate.getTime() - duration - 24 * 60 * 60 * 1000);
        const prevEnd = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        return { startDate: prevStart, endDate: prevEnd };

      case 'monthAgo':
        const monthAgoStart = new Date(startDate);
        monthAgoStart.setMonth(monthAgoStart.getMonth() - 1);
        const monthAgoEnd = new Date(endDate);
        monthAgoEnd.setMonth(monthAgoEnd.getMonth() - 1);
        return { startDate: monthAgoStart, endDate: monthAgoEnd };

      case 'quarterAgo':
        const quarterAgoStart = new Date(startDate);
        quarterAgoStart.setMonth(quarterAgoStart.getMonth() - 3);
        const quarterAgoEnd = new Date(endDate);
        quarterAgoEnd.setMonth(quarterAgoEnd.getMonth() - 3);
        return { startDate: quarterAgoStart, endDate: quarterAgoEnd };

      case 'yearAgo':
        const yearAgoStart = new Date(startDate);
        yearAgoStart.setFullYear(yearAgoStart.getFullYear() - 1);
        const yearAgoEnd = new Date(endDate);
        yearAgoEnd.setFullYear(yearAgoEnd.getFullYear() - 1);
        return { startDate: yearAgoStart, endDate: yearAgoEnd };

      default:
        return baseRange;
    }
  };

  const handleOptionClick = (option: string) => {
    if (option === 'none') {
      onChange(null);
    } else {
      // For now, use a default base range - this should come from the main date picker
      const baseRange = {
        startDate: new Date(2025, 8, 1), // Sep 1, 2025
        endDate: new Date(2025, 8, 30)   // Sep 30, 2025
      };
      const range = getComparisonDateRange(option, baseRange);
      onChange(range);
    }
    setIsOpen(false);
  };

  const handleDateClick = (date: Date) => {
    if (selectingStart) {
      setTempRange({ startDate: date, endDate: date });
      setSelectingStart(false);
    } else {
      const newRange = {
        startDate: tempRange?.startDate || date,
        endDate: date < (tempRange?.startDate || date) ? (tempRange?.startDate || date) : date
      };
      if (date < (tempRange?.startDate || date)) {
        newRange.startDate = date;
        newRange.endDate = tempRange?.startDate || date;
      }
      setTempRange(newRange);
      onChange(newRange);
      setIsOpen(false);
      setSelectingStart(true);
    }
  };

  const handleNoComparison = () => {
    onChange(null);
    setIsOpen(false);
  };

  const renderCalendar = (monthOffset: number = 0) => {
    const month = addMonths(currentMonth, monthOffset);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          {monthOffset === 0 && (
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h3 className="font-medium text-sm">
            {format(month, 'MMM yyyy')}
          </h3>
          {monthOffset === 1 && (
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-xs text-gray-500 text-center p-1 font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const isCurrentMonth = isSameMonth(day, month);
            const isSelected = tempRange && (isSameDay(day, tempRange.startDate) || isSameDay(day, tempRange.endDate));
            const isInRange = tempRange && day >= tempRange.startDate && day <= tempRange.endDate;

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`
                  text-sm p-1 rounded text-center h-8 w-8 hover:bg-gray-100
                  ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                  ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                  ${isInRange && !isSelected ? 'bg-blue-100' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          px-3 py-1 text-sm border rounded hover:bg-gray-50 flex items-center gap-2
          ${value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700'}
        `}
      >
        {value ? (
          <span>Compare to {format(value.startDate, 'MMM d')} – {format(value.endDate, 'MMM d')}</span>
        ) : (
          <span>No comparison</span>
        )}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[500px]">
          <div className="flex">
            {/* Options Sidebar */}
            <div className="w-40 border-r border-gray-200 p-3">
              <div className="space-y-1">
                <button
                  onClick={handleNoComparison}
                  className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 border-b border-gray-200 mb-2"
                >
                  No comparison
                </button>
                {comparisonOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionClick(option.value)}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded text-gray-700"
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* No comparison button at bottom */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={handleNoComparison}
                  className="w-full px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  No comparison
                </button>
              </div>
            </div>

            {/* Calendar */}
            <div className="flex">
              {renderCalendar(0)}
              {renderCalendar(1)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}