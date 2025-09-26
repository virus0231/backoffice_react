/**
 * Tests for filter store (Zustand)
 */

import { renderHook, act } from '@testing-library/react';
import { useFilterStore, useFilterParams, useHasActiveFilters } from '../filterStore';
import { getDefaultDateRange } from '@/lib/utils/dateHelpers';
import { Appeal, Fund } from '@/types/filters';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('filterStore', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();

    // Mock localStorage to return null (no persisted data)
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('initial state', () => {
    it('should have correct default values', () => {
      const { result } = renderHook(() => useFilterStore());

      expect(result.current.selectedAppeal).toBeNull();
      expect(result.current.selectedFund).toBeNull();
      expect(result.current.frequency).toBe('all');
      expect(result.current.dateRange.preset).toBe('last30days');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.lastValidationError).toBeNull();
    });
  });

  describe('date range actions', () => {
    it('should update date range with valid range', () => {
      const { result } = renderHook(() => useFilterStore());
      const newRange = getDefaultDateRange();

      act(() => {
        result.current.setDateRange(newRange);
      });

      expect(result.current.dateRange).toEqual(newRange);
      expect(result.current.lastValidationError).toBeNull();
    });

    it('should set validation error for invalid date range', () => {
      const { result } = renderHook(() => useFilterStore());
      const invalidRange = {
        startDate: new Date('invalid'),
        endDate: new Date(),
        preset: 'custom' as const
      };

      act(() => {
        result.current.setDateRange(invalidRange);
      });

      expect(result.current.lastValidationError).toBeTruthy();
    });
  });

  describe('appeal actions', () => {
    it('should update selected appeal', () => {
      const { result } = renderHook(() => useFilterStore());
      const appeal: Appeal = {
        id: 1,
        appeal_name: 'Test Appeal',
        status: 'active',
        start_date: new Date(),
        end_date: null
      };

      act(() => {
        result.current.setAppeal(appeal);
      });

      expect(result.current.selectedAppeal).toEqual(appeal);
      expect(result.current.lastValidationError).toBeNull();
    });

    it('should clear fund when appeal changes', () => {
      const { result } = renderHook(() => useFilterStore());

      const appeal1: Appeal = {
        id: 1,
        appeal_name: 'Appeal 1',
        status: 'active',
        start_date: new Date(),
        end_date: null
      };

      const fund: Fund = {
        id: 1,
        fund_name: 'Test Fund',
        is_active: true,
        appeal_id: 1
      };

      const appeal2: Appeal = {
        id: 2,
        appeal_name: 'Appeal 2',
        status: 'active',
        start_date: new Date(),
        end_date: null
      };

      // Set initial appeal and fund
      act(() => {
        result.current.setAppeal(appeal1);
        result.current.setFund(fund);
      });

      expect(result.current.selectedFund).toEqual(fund);

      // Change appeal - should clear fund since it's from different appeal
      act(() => {
        result.current.setAppeal(appeal2);
      });

      expect(result.current.selectedAppeal).toEqual(appeal2);
      expect(result.current.selectedFund).toBeNull();
    });

    it('should clear appeal', () => {
      const { result } = renderHook(() => useFilterStore());
      const appeal: Appeal = {
        id: 1,
        appeal_name: 'Test Appeal',
        status: 'active',
        start_date: new Date(),
        end_date: null
      };

      act(() => {
        result.current.setAppeal(appeal);
      });

      expect(result.current.selectedAppeal).toEqual(appeal);

      act(() => {
        result.current.setAppeal(null);
      });

      expect(result.current.selectedAppeal).toBeNull();
    });
  });

  describe('fund actions', () => {
    it('should update selected fund', () => {
      const { result } = renderHook(() => useFilterStore());
      const fund: Fund = {
        id: 1,
        fund_name: 'Test Fund',
        is_active: true
      };

      act(() => {
        result.current.setFund(fund);
      });

      expect(result.current.selectedFund).toEqual(fund);
      expect(result.current.lastValidationError).toBeNull();
    });
  });

  describe('frequency actions', () => {
    it('should update frequency', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setFrequency('one-time');
      });

      expect(result.current.frequency).toBe('one-time');
      expect(result.current.lastValidationError).toBeNull();
    });
  });

  describe('clear and reset actions', () => {
    it('should clear all filters', () => {
      const { result } = renderHook(() => useFilterStore());

      const appeal: Appeal = {
        id: 1,
        appeal_name: 'Test Appeal',
        status: 'active',
        start_date: new Date(),
        end_date: null
      };

      // Set some values
      act(() => {
        result.current.setAppeal(appeal);
        result.current.setFrequency('one-time');
      });

      expect(result.current.selectedAppeal).toEqual(appeal);
      expect(result.current.frequency).toBe('one-time');

      // Clear all
      act(() => {
        result.current.clearAllFilters();
      });

      expect(result.current.selectedAppeal).toBeNull();
      expect(result.current.selectedFund).toBeNull();
      expect(result.current.frequency).toBe('all');
      expect(result.current.dateRange.preset).toBe('last30days');
    });

    it('should reset to defaults', () => {
      const { result } = renderHook(() => useFilterStore());

      // Set some values
      act(() => {
        result.current.setFrequency('recurring');
        result.current.setValidationError('Test error');
      });

      expect(result.current.frequency).toBe('recurring');
      expect(result.current.lastValidationError).toBe('Test error');

      // Reset
      act(() => {
        result.current.resetToDefaults();
      });

      expect(result.current.frequency).toBe('all');
      expect(result.current.lastValidationError).toBeNull();
    });
  });

  describe('loading state', () => {
    it('should manage loading state', () => {
      const { result } = renderHook(() => useFilterStore());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});

describe('useFilterParams', () => {
  it('should return correct API parameters', () => {
    const { result: storeResult } = renderHook(() => useFilterStore());
    const { result: paramsResult } = renderHook(() => useFilterParams());

    const appeal: Appeal = {
      id: 1,
      appeal_name: 'Test Appeal',
      status: 'active',
      start_date: new Date(),
      end_date: null
    };

    act(() => {
      storeResult.current.setAppeal(appeal);
      storeResult.current.setFrequency('one-time');
    });

    const params = paramsResult.current;
    expect(params.appealId).toBe(1);
    expect(params.frequency).toBe('one-time');
    expect(params.fundId).toBeNull();
    expect(typeof params.startDate).toBe('string');
    expect(typeof params.endDate).toBe('string');
  });
});

describe('useHasActiveFilters', () => {
  it('should detect active filters', () => {
    // Create separate hook instances to avoid state interference
    const { result: hasActiveResult } = renderHook(() => {
      const store = useFilterStore();
      const hasActive = useHasActiveFilters();
      return { store, hasActive };
    });

    // Initially no active filters (fresh store with defaults)
    act(() => {
      hasActiveResult.current.store.resetToDefaults();
    });

    expect(hasActiveResult.current.hasActive).toBe(false);

    // Set an appeal
    const appeal: Appeal = {
      id: 1,
      appeal_name: 'Test Appeal',
      status: 'active',
      start_date: new Date(),
      end_date: null
    };

    act(() => {
      hasActiveResult.current.store.setAppeal(appeal);
    });

    expect(hasActiveResult.current.hasActive).toBe(true);

    // Clear filters
    act(() => {
      hasActiveResult.current.store.clearAllFilters();
    });

    expect(hasActiveResult.current.hasActive).toBe(false);
  });
});