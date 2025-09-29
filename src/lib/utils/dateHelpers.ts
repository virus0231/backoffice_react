/**
 * Date utility functions for filter components
 */

import {
  startOfToday,
  endOfToday,
  startOfYesterday,
  endOfYesterday,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subWeeks,
  subMonths,
  subYears,
  isAfter,
  isBefore,
  isValid,
  differenceInDays
} from 'date-fns';

import { DateRange, DatePreset, DatePresetOption } from '@/types/filters';

/**
 * Generate date range for specific presets
 */
export const getDateRangeForPreset = (preset: DatePreset): DateRange => {
  const today = new Date();

  switch (preset) {
    case 'all':
      // All time - from 2 years ago to today (reasonable for most analytics)
      return {
        startDate: subYears(today, 2),
        endDate: endOfToday(),
        preset
      };
    case 'today':
      return {
        startDate: startOfToday(),
        endDate: endOfToday(),
        preset
      };

    case 'yesterday':
      return {
        startDate: startOfYesterday(),
        endDate: endOfYesterday(),
        preset
      };

    case 'last7days':
      return {
        startDate: subDays(today, 6), // Include today as the 7th day
        endDate: endOfToday(),
        preset
      };

    case 'last14days':
      return {
        startDate: subDays(today, 13), // Include today as the 14th day
        endDate: endOfToday(),
        preset
      };

    case 'last30days':
      return {
        startDate: subDays(today, 29), // Include today as the 30th day
        endDate: endOfToday(),
        preset
      };

    case 'thisWeek':
      return {
        startDate: startOfWeek(today, { weekStartsOn: 1 }), // Monday start
        endDate: endOfWeek(today, { weekStartsOn: 1 }),
        preset
      };

    case 'thisMonth':
      return {
        startDate: startOfMonth(today),
        endDate: endOfMonth(today),
        preset
      };

    case 'thisYear':
      return {
        startDate: startOfYear(today),
        endDate: endOfYear(today),
        preset
      };

    case 'lastWeek':
      const lastWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
      return {
        startDate: lastWeekStart,
        endDate: endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 }),
        preset
      };

    case 'lastMonth':
      const lastMonthStart = startOfMonth(subMonths(today, 1));
      return {
        startDate: lastMonthStart,
        endDate: endOfMonth(subMonths(today, 1)),
        preset
      };

    case 'lastYear':
      const lastYearStart = startOfYear(subYears(today, 1));
      return {
        startDate: lastYearStart,
        endDate: endOfYear(subYears(today, 1)),
        preset
      };

    case 'custom':
    default:
      return {
        startDate: subDays(today, 30),
        endDate: today,
        preset: 'custom'
      };
  }
};

/**
 * Available date preset options
 */
export const datePresetOptions: DatePresetOption[] = [
  {
    label: 'All',
    value: 'all',
    range: () => getDateRangeForPreset('all')
  },
  {
    label: 'Today',
    value: 'today',
    range: () => getDateRangeForPreset('today')
  },
  {
    label: 'Yesterday',
    value: 'yesterday',
    range: () => getDateRangeForPreset('yesterday')
  },
  {
    label: 'Last 7 days',
    value: 'last7days',
    range: () => getDateRangeForPreset('last7days')
  },
  {
    label: 'Last 14 days',
    value: 'last14days',
    range: () => getDateRangeForPreset('last14days')
  },
  {
    label: 'Last 30 days',
    value: 'last30days',
    range: () => getDateRangeForPreset('last30days')
  },
  {
    label: 'This week',
    value: 'thisWeek',
    range: () => getDateRangeForPreset('thisWeek')
  },
  {
    label: 'This month',
    value: 'thisMonth',
    range: () => getDateRangeForPreset('thisMonth')
  },
  {
    label: 'This year',
    value: 'thisYear',
    range: () => getDateRangeForPreset('thisYear')
  },
  {
    label: 'Last week',
    value: 'lastWeek',
    range: () => getDateRangeForPreset('lastWeek')
  },
  {
    label: 'Last month',
    value: 'lastMonth',
    range: () => getDateRangeForPreset('lastMonth')
  },
  {
    label: 'Last year',
    value: 'lastYear',
    range: () => getDateRangeForPreset('lastYear')
  },
  {
    label: 'Custom Range',
    value: 'custom',
    range: () => getDateRangeForPreset('custom')
  }
];

/**
 * Validate a date range
 */
export const validateDateRange = (dateRange: DateRange): { isValid: boolean; error?: string } => {
  const { startDate, endDate } = dateRange;

  // Check if dates are valid
  if (!isValid(startDate) || !isValid(endDate)) {
    return {
      isValid: false,
      error: 'Invalid date format'
    };
  }

  // Check if start date is after end date
  if (isAfter(startDate, endDate)) {
    return {
      isValid: false,
      error: 'Start date cannot be after end date'
    };
  }

  // Check if end date is too far in the future (allow up to end of current year)
  if (isAfter(endDate, endOfYear(new Date()))) {
    return {
      isValid: false,
      error: 'End date cannot be beyond current year'
    };
  }

  // Check if date range is too large (more than 3 years)
  const daysDifference = differenceInDays(endDate, startDate);
  if (daysDifference > 1095) { // 3 years approximately
    return {
      isValid: false,
      error: 'Date range cannot exceed 3 years'
    };
  }

  return { isValid: true };
};

/**
 * Format date range for display
 */
export const formatDateRangeDisplay = (dateRange: DateRange): string => {
  const { startDate, endDate, preset } = dateRange;

  if (preset && preset !== 'custom') {
    const option = datePresetOptions.find(opt => opt.value === preset);
    return option?.label || 'Custom Range';
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };

  const startFormatted = startDate.toLocaleDateString('en-US', formatOptions);
  const endFormatted = endDate.toLocaleDateString('en-US', formatOptions);

  return `${startFormatted} - ${endFormatted}`;
};

/**
 * Get default date range (last 30 days)
 */
export const getDefaultDateRange = (): DateRange => {
  return getDateRangeForPreset('last30days');
};

/**
 * Generate comparison date range based on main date range
 */
export const getComparisonDateRange = (option: string, baseRange: DateRange): DateRange => {
  const { startDate, endDate } = baseRange;
  const duration = endDate.getTime() - startDate.getTime();

  switch (option) {
    case 'previousPeriod':
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

/**
 * Comparison preset options based on main date range
 */
export const getComparisonPresetOptions = (mainDateRange: DateRange): DatePresetOption[] => [
  {
    label: 'Previous period',
    value: 'previousPeriod' as any,
    range: () => getComparisonDateRange('previousPeriod', mainDateRange)
  },
  {
    label: 'A month ago',
    value: 'monthAgo' as any,
    range: () => getComparisonDateRange('monthAgo', mainDateRange)
  },
  {
    label: 'A quarter ago',
    value: 'quarterAgo' as any,
    range: () => getComparisonDateRange('quarterAgo', mainDateRange)
  },
  {
    label: 'A year ago',
    value: 'yearAgo' as any,
    range: () => getComparisonDateRange('yearAgo', mainDateRange)
  },
  {
    label: 'No comparison',
    value: 'noComparison' as any,
    range: () => ({ startDate: mainDateRange.startDate, endDate: mainDateRange.startDate, preset: 'custom' })
  }
];
