/**
 * Comparison period validation utilities
 */

import {
  areIntervalsOverlapping,
  differenceInDays,
  endOfDay,
  endOfToday,
  isAfter,
  isBefore,
  startOfDay,
  subDays,
} from 'date-fns';

import type { DateRange } from '@/types/filters';
import { validateDateRange } from '@/lib/utils/dateHelpers';

export interface ComparisonValidationResult {
  isValid: boolean;
  error?: string;
}

export const rangesOverlap = (main: DateRange, compare: DateRange): boolean => {
  return areIntervalsOverlapping(
    { start: startOfDay(main.startDate), end: endOfDay(main.endDate) },
    { start: startOfDay(compare.startDate), end: endOfDay(compare.endDate) },
    { inclusive: true }
  );
};

/**
 * Validate comparison range against global constraints and main range.
 * Rules:
 * - Comparison range must be a valid date range
 * - Cannot overlap the main date range
 * - Cannot extend into the future
 * - Range length must be reasonable (<= 5 years)
 */
export const validateComparisonRange = (
  main: DateRange,
  compare: DateRange
): ComparisonValidationResult => {
  // Validate the comparison range itself
  const selfValidation = validateDateRange(compare);
  if (!selfValidation.isValid) {
    return { isValid: false, error: selfValidation.error || 'Invalid comparison range' };
  }

  // Prevent overlap with main range
  if (rangesOverlap(main, compare)) {
    return { isValid: false, error: 'Comparison period cannot overlap main period' };
  }

  // No future dates
  if (isAfter(compare.endDate, endOfToday())) {
    return { isValid: false, error: 'Comparison end date cannot be in the future' };
  }

  // Range length limit (mirror main validation ~5 years)
  const days = differenceInDays(compare.endDate, compare.startDate);
  if (days > 1825) {
    return { isValid: false, error: 'Comparison period cannot exceed 5 years' };
  }

  return { isValid: true };
};

export interface ResolutionResult {
  adjusted: DateRange;
  changed: boolean;
  reason?: string;
}

/**
 * Attempt to adjust a desired comparison range to avoid overlap with main range.
 * Strategy: shift the desired range backward day-by-day until no overlap or we hit a safe boundary.
 */
export const resolveRangeConflict = (
  main: DateRange,
  desired: DateRange,
  maxShiftDays: number = 60
): ResolutionResult => {
  if (!rangesOverlap(main, desired)) {
    return { adjusted: desired, changed: false };
  }

  const length = Math.max(1, differenceInDays(desired.endDate, desired.startDate));
  let start = desired.startDate;
  let end = desired.endDate;

  let shifted = 0;
  while (rangesOverlap(main, { startDate: start, endDate: end, preset: desired.preset || 'custom' })) {
    start = subDays(start, 1);
    end = subDays(end, 1);
    shifted += 1;

    if (shifted > maxShiftDays) {
      // If we still overlap or went too far, place it immediately before main range with same length
      const newEnd = subDays(main.startDate, 1);
      const newStart = subDays(newEnd, length);
      return {
        adjusted: { startDate: newStart, endDate: newEnd, preset: desired.preset || 'custom' },
        changed: true,
        reason: 'Auto-adjusted to avoid overlap',
      };
    }
  }

  return {
    adjusted: { startDate: start, endDate: end, preset: desired.preset || 'custom' },
    changed: true,
    reason: 'Shifted backward to avoid overlap',
  };
};

/**
 * Ensure comparison stays fully before or after the main period.
 * Prefers before (previous period). If desired is after main, keep it after; otherwise, set to previous period.
 */
export const coerceComparisonAwayFromMain = (main: DateRange, desired: DateRange): DateRange => {
  if (isBefore(desired.startDate, main.startDate) && isBefore(desired.endDate, main.startDate)) {
    return desired; // already before main
  }
  if (isAfter(desired.startDate, main.endDate) && isAfter(desired.endDate, main.endDate)) {
    return desired; // already after main
  }

  const length = Math.max(1, differenceInDays(desired.endDate, desired.startDate));
  const newEnd = subDays(main.startDate, 1);
  const newStart = subDays(newEnd, length);
  return { startDate: newStart, endDate: newEnd, preset: desired.preset || 'custom' };
};

