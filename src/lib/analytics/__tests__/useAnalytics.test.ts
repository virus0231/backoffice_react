import { buildAnalyticsQueryParams } from '@/lib/analytics/useAnalytics';
import { useFilterStore } from '@/stores/filterStore';

const dr = (s: string, e: string) => ({ startDate: new Date(s), endDate: new Date(e), preset: 'custom' as const });

describe('buildAnalyticsQueryParams', () => {
  it('includes comparison dates when enabled for chart', () => {
    useFilterStore.setState({
      dateRange: dr('2024-04-01', '2024-04-10'),
      selectedAppeal: null,
      selectedFund: null,
      frequency: 'all',
      comparisons: {
        'chart-1': { enabled: true, startDate: new Date('2024-03-20'), endDate: new Date('2024-03-29'), preset: 'custom' }
      },
      isLoading: false,
      lastValidationError: null,
      hydrated: true,
    } as any);

    const params = buildAnalyticsQueryParams(useFilterStore.getState(), 'chart-1');
    expect(params.compareStartDate).toBeTruthy();
    expect(params.compareEndDate).toBeTruthy();
  });

  it('omits comparison when disabled', () => {
    useFilterStore.setState({
      dateRange: dr('2024-04-01', '2024-04-10'),
      selectedAppeal: null,
      selectedFund: null,
      frequency: 'all',
      comparisons: {},
      isLoading: false,
      lastValidationError: null,
      hydrated: true,
    } as any);
    const params = buildAnalyticsQueryParams(useFilterStore.getState(), 'chart-x');
    expect(params.compareStartDate).toBeNull();
    expect(params.compareEndDate).toBeNull();
  });
});

