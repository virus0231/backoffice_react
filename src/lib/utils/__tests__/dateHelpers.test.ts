/**
 * Tests for date helper utilities
 */

import {
  getDateRangeForPreset,
  datePresetOptions,
  validateDateRange,
  formatDateRangeDisplay,
  getDefaultDateRange
} from '../dateHelpers';
import { DateRange, DatePreset } from '@/types/filters';
import { addDays, subDays, startOfToday, endOfToday } from 'date-fns';

describe('dateHelpers', () => {
  describe('getDateRangeForPreset', () => {
    it('should return correct range for today preset', () => {
      const result = getDateRangeForPreset('today');

      expect(result.preset).toBe('today');
      expect(result.startDate).toEqual(startOfToday());
      expect(result.endDate).toEqual(endOfToday());
    });

    it('should return correct range for last7days preset', () => {
      const result = getDateRangeForPreset('last7days');
      const today = new Date();

      expect(result.preset).toBe('last7days');
      expect(result.startDate.toDateString()).toEqual(subDays(today, 6).toDateString());
      expect(result.endDate.toDateString()).toEqual(endOfToday().toDateString());
    });

    it('should return correct range for custom preset', () => {
      const result = getDateRangeForPreset('custom');
      const today = new Date();

      expect(result.preset).toBe('custom');
      expect(result.startDate.toDateString()).toEqual(subDays(today, 30).toDateString());
    });

    it('should handle all preset options', () => {
      const presets: DatePreset[] = [
        'today', 'yesterday', 'last7days', 'last14days', 'last30days',
        'thisWeek', 'thisMonth', 'thisYear', 'lastWeek', 'lastMonth', 'lastYear'
      ];

      presets.forEach(preset => {
        const result = getDateRangeForPreset(preset);
        expect(result.preset).toBe(preset);
        expect(result.startDate).toBeInstanceOf(Date);
        expect(result.endDate).toBeInstanceOf(Date);
        expect(result.startDate.getTime()).toBeLessThanOrEqual(result.endDate.getTime());
      });
    });
  });

  describe('datePresetOptions', () => {
    it('should include all expected preset options', () => {
      const expectedLabels = [
        'Today', 'Yesterday', 'Last 7 Days', 'Last 14 Days', 'Last 30 Days',
        'This Week', 'This Month', 'This Year', 'Last Week', 'Last Month', 'Last Year',
        'Custom Range'
      ];

      expect(datePresetOptions).toHaveLength(12);
      datePresetOptions.forEach((option, index) => {
        expect(expectedLabels).toContain(option.label);
        expect(typeof option.range).toBe('function');
      });
    });

    it('should have working range functions', () => {
      datePresetOptions.forEach(option => {
        const range = option.range();
        expect(range.startDate).toBeInstanceOf(Date);
        expect(range.endDate).toBeInstanceOf(Date);
        expect(range.preset).toBe(option.value);
      });
    });
  });

  describe('validateDateRange', () => {
    it('should validate correct date ranges', () => {
      const validRange: DateRange = {
        startDate: subDays(new Date(), 7),
        endDate: new Date(),
        preset: 'last7days'
      };

      const result = validateDateRange(validRange);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid date objects', () => {
      const invalidRange: DateRange = {
        startDate: new Date('invalid'),
        endDate: new Date(),
        preset: 'custom'
      };

      const result = validateDateRange(invalidRange);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid date format');
    });

    it('should reject start date after end date', () => {
      const invalidRange: DateRange = {
        startDate: new Date(),
        endDate: subDays(new Date(), 1),
        preset: 'custom'
      };

      const result = validateDateRange(invalidRange);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Start date cannot be after end date');
    });

    it('should reject future end dates', () => {
      const invalidRange: DateRange = {
        startDate: new Date(),
        endDate: addDays(new Date(), 1),
        preset: 'custom'
      };

      const result = validateDateRange(invalidRange);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('End date cannot be in the future');
    });

    it('should reject date ranges that are too large', () => {
      const invalidRange: DateRange = {
        startDate: subDays(new Date(), 2000), // More than 5 years
        endDate: new Date(),
        preset: 'custom'
      };

      const result = validateDateRange(invalidRange);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Date range cannot exceed 5 years');
    });
  });

  describe('formatDateRangeDisplay', () => {
    it('should return preset label for preset ranges', () => {
      const range: DateRange = {
        startDate: startOfToday(),
        endDate: endOfToday(),
        preset: 'today'
      };

      const result = formatDateRangeDisplay(range);
      expect(result).toBe('Today');
    });

    it('should return formatted date range for custom ranges', () => {
      const range: DateRange = {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        preset: 'custom'
      };

      const result = formatDateRangeDisplay(range);
      expect(result).toMatch(/Jan 1, 2023 - Jan 31, 2023/);
    });

    it('should handle range without preset', () => {
      const range: DateRange = {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31')
      };

      const result = formatDateRangeDisplay(range);
      expect(result).toMatch(/Jan 1, 2023 - Jan 31, 2023/);
    });
  });

  describe('getDefaultDateRange', () => {
    it('should return last 30 days as default', () => {
      const result = getDefaultDateRange();

      expect(result.preset).toBe('last30days');
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });
  });
});