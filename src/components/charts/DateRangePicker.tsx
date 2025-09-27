"use client";

import React, { useState, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const presetOptions = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'last7' },
  { label: 'Last 14 days', value: 'last14' },
  { label: 'Last 30 days', value: 'last30' },
  { label: 'This week', value: 'thisWeek' },
  { label: 'This month', value: 'thisMonth' },
  { label: 'This year', value: 'thisYear' },
  { label: 'Last week', value: 'lastWeek' },
  { label: 'Last month', value: 'lastMonth' },
  { label: 'Last year', value: 'lastYear' },
];

export default function DateRangePicker({ value, onChange, className = '' }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempRange, setTempRange] = useState<DateRange>(value);
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

  const getPresetDateRange = (preset: string): DateRange => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    switch (preset) {
      case 'today':
        return { startDate: today, endDate: today };
      case 'yesterday':
        return { startDate: yesterday, endDate: yesterday };
      case 'last7':
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 6);
        return { startDate: last7, endDate: today };
      case 'last14':
        const last14 = new Date(today);
        last14.setDate(last14.getDate() - 13);
        return { startDate: last14, endDate: today };
      case 'last30':
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 29);
        return { startDate: last30, endDate: today };
      case 'thisWeek':
        return { startDate: startOfWeek(today), endDate: endOfWeek(today) };
      case 'thisMonth':
        return { startDate: startOfMonth(today), endDate: endOfMonth(today) };
      case 'thisYear':
        return { startDate: new Date(today.getFullYear(), 0, 1), endDate: today };
      case 'lastWeek':
        const lastWeekStart = startOfWeek(subMonths(today, 0));
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = endOfWeek(lastWeekStart);
        return { startDate: lastWeekStart, endDate: lastWeekEnd };
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        return { startDate: startOfMonth(lastMonth), endDate: endOfMonth(lastMonth) };
      case 'lastYear':
        const lastYear = new Date(today.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
        return { startDate: lastYear, endDate: lastYearEnd };
      default:
        return value;
    }
  };

  const handlePresetClick = (preset: string) => {
    if (preset === 'all') {
      // Handle "All" preset - you might want to set a very wide range
      const allRange = {
        startDate: new Date(2020, 0, 1),
        endDate: new Date()
      };
      onChange(allRange);
    } else {
      const range = getPresetDateRange(preset);
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
        startDate: tempRange.startDate,
        endDate: date < tempRange.startDate ? tempRange.startDate : date
      };
      if (date < tempRange.startDate) {
        newRange.startDate = date;
        newRange.endDate = tempRange.startDate;
      }
      setTempRange(newRange);
      onChange(newRange);
      setIsOpen(false);
      setSelectingStart(true);
    }
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
            const isSelected = isSameDay(day, tempRange.startDate) || isSameDay(day, tempRange.endDate);
            const isInRange = day >= tempRange.startDate && day <= tempRange.endDate;
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`
                  text-sm p-1 rounded text-center h-8 w-8 hover:bg-gray-100
                  ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                  ${isSelected ? 'bg-green-500 text-white hover:bg-green-600' : ''}
                  ${isInRange && !isSelected ? 'bg-green-100' : ''}
                  ${isToday && !isSelected ? 'border border-gray-400' : ''}
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
        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 bg-white"
      >
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>
          {format(value.startDate, 'MMM d, yyyy')} – {format(value.endDate, 'MMM d, yyyy')}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[600px]">
          <div className="flex">
            {/* Presets Sidebar */}
            <div className="w-40 border-r border-gray-200 p-3">
              <div className="space-y-1">
                {presetOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handlePresetClick(option.value)}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded text-gray-700"
                  >
                    {option.label}
                  </button>
                ))}
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