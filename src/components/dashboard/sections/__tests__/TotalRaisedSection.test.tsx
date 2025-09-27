import React from 'react';
import { render, screen } from '@testing-library/react';
import TotalRaisedSection from '@/components/dashboard/sections/TotalRaisedSection';
import { FilterProvider } from '@/providers/FilterProvider';

beforeEach(() => {
  // @ts-ignore
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({
      data: {
        currentPeriod: { totalAmount: 12345, donationCount: 67 },
        trendData: [ { date: '2025-01-01', amount: 100 } ]
      }
    })
  });
});

describe('TotalRaisedSection', () => {
  it('shows metrics and chart area', async () => {
    render(
      <FilterProvider>
        <TotalRaisedSection granularity="daily" />
      </FilterProvider>
    );

    expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Donations:/i)).toBeInTheDocument();
    expect(screen.getByText(/Raised/i)).toBeInTheDocument();
  });
});

