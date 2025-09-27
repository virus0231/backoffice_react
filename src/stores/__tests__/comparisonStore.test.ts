import { act } from '@testing-library/react';
import { useFilterStore } from '@/stores/filterStore';

const dr = (s: string, e: string) => ({ startDate: new Date(s), endDate: new Date(e), preset: 'custom' as const });

describe('comparison state in filterStore', () => {
  beforeEach(() => {
    // Reset store to defaults with known date range
    act(() => {
      useFilterStore.setState({
        dateRange: dr('2024-02-01', '2024-02-10'),
        selectedAppeal: null,
        selectedFund: null,
        frequency: 'all',
        isLoading: false,
        lastValidationError: null,
        hydrated: true,
        comparisons: {},
      } as any);
    });
  });

  it('toggles comparison on and sets a previous period by default', () => {
    const id = 'chart-1';
    act(() => {
      useFilterStore.getState().toggleChartComparison(id, true);
    });

    const c = useFilterStore.getState().getChartComparison(id);
    expect(c).not.toBeNull();
    expect(c!.enabled).toBe(true);
    expect(c!.startDate).toBeInstanceOf(Date);
    expect(c!.endDate).toBeInstanceOf(Date);
  });

  it('rejects overlapping ranges via setChartComparison', () => {
    const id = 'chart-2';
    // Overlapping with main 2024-02-01..10
    act(() => {
      useFilterStore.getState().setChartComparison(id, {
        enabled: true,
        startDate: new Date('2024-02-05'),
        endDate: new Date('2024-02-08'),
        preset: 'custom'
      });
    });
    expect(useFilterStore.getState().lastValidationError).toMatch(/overlap/i);
  });
});

