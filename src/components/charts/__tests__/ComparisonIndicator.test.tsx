import React from 'react';
import { render, screen } from '@testing-library/react';

import ComparisonIndicator from '@/components/charts/ComparisonIndicator';
import { useFilterStore } from '@/stores/filterStore';

const dr = (s: string, e: string) => ({ startDate: new Date(s), endDate: new Date(e), preset: 'custom' as const });

describe('ComparisonIndicator', () => {
  beforeEach(() => {
    useFilterStore.setState({
      dateRange: dr('2024-03-01', '2024-03-10'),
      selectedAppeal: null,
      selectedFund: null,
      frequency: 'all',
      isLoading: false,
      lastValidationError: null,
      hydrated: true,
      comparisons: {},
    } as any);
  });

  it('renders inactive state by default', () => {
    render(<ComparisonIndicator chartId="chart-a" />);
    expect(screen.getByText(/no comparison/i)).toBeInTheDocument();
  });
});

