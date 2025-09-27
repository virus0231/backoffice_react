import React from 'react';
import { render, screen } from '@testing-library/react';

import FilterBar from '@/components/filters/FilterBar';
import { FilterProvider } from '@/providers/FilterProvider';
import { useFilterStore } from '@/stores/filterStore';

const dr = (s: string, e: string) => ({ startDate: new Date(s), endDate: new Date(e), preset: 'custom' as const });

describe('FilterBar comparison summary', () => {
  beforeEach(() => {
    useFilterStore.setState({
      dateRange: dr('2024-03-01', '2024-03-10'),
      selectedAppeal: null,
      selectedFund: null,
      frequency: 'all',
      isLoading: false,
      lastValidationError: null,
      hydrated: true,
      comparisons: {
        'chart-x': { enabled: true, startDate: new Date('2024-02-20'), endDate: new Date('2024-02-28'), preset: 'custom' }
      },
    } as any);
  });

  it('shows comparison summary when enabled for a chart', () => {
    render(
      <FilterProvider>
        <FilterBar />
      </FilterProvider>
    );

    expect(screen.getByText(/active filters/i)).toBeInTheDocument();
    expect(screen.getByText(/chart-x:/i)).toBeInTheDocument();
  });
});

