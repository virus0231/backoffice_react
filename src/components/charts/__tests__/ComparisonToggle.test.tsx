import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import ComparisonToggle from '@/components/charts/ComparisonToggle';
import { useFilterStore } from '@/stores/filterStore';

const dr = (s: string, e: string) => ({ startDate: new Date(s), endDate: new Date(e), preset: 'custom' as const });

describe('ComparisonToggle', () => {
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

  it('enables comparison and shows controls', () => {
    render(<ComparisonToggle chartId="unit-chart" />);
    const checkbox = screen.getByRole('checkbox', { name: /enable comparison/i });
    expect(checkbox).toBeInTheDocument();
    fireEvent.click(checkbox);

    expect(screen.getByText(/edit/i)).toBeInTheDocument();
    expect(screen.getByText(/clear/i)).toBeInTheDocument();
  });
});

