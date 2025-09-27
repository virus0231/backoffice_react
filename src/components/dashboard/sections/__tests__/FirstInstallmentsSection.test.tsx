import React from 'react';
import { render, screen } from '@testing-library/react';
import FirstInstallmentsSection from '@/components/dashboard/sections/FirstInstallmentsSection';
import { FilterProvider } from '@/providers/FilterProvider';

beforeEach(() => {
  // @ts-ignore
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({
      data: {
        currentPeriod: { totalAmount: 2345, donationCount: 12 },
        trendData: [ { date: '2025-01-01', amount: 50 } ]
      }
    })
  });
});

describe('FirstInstallmentsSection', () => {
  it('shows metrics labels', () => {
    render(
      <FilterProvider>
        <FirstInstallmentsSection granularity="daily" />
      </FilterProvider>
    );

    expect(screen.getByText(/New Recurring Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Installments:/i)).toBeInTheDocument();
  });
});

