import React from 'react';
import { render, screen } from '@testing-library/react';
import ComparisonTable from '@/components/charts/ComparisonTable';

describe('ComparisonTable', () => {
  it('renders rows with current and comparison values', () => {
    render(<ComparisonTable data={[{ date: '2024-01-01', current: 10, comparison: 8 }]} />);
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });
});

