import React from 'react';
import { render, screen } from '@testing-library/react';
import OneTimeDonationsSection from '@/components/dashboard/sections/OneTimeDonationsSection';
import { FilterProvider } from '@/providers/FilterProvider';

beforeEach(() => {
  // @ts-ignore
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({
      data: {
        currentPeriod: { totalAmount: 3456, donationCount: 23 },
        trendData: [ { date: '2025-01-01', amount: 75 } ]
      }
    })
  });
});

describe('OneTimeDonationsSection', () => {
  it('shows metrics labels', () => {
    render(
      <FilterProvider>
        <OneTimeDonationsSection granularity="daily" />
      </FilterProvider>
    );

    expect(screen.getByText(/Single Gift Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Donations:/i)).toBeInTheDocument();
  });
});

