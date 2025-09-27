import React from 'react';
import { render, screen } from '@testing-library/react';
import PrimaryRevenueDashboard from '@/components/dashboard/PrimaryRevenueDashboard';
import { FilterProvider } from '@/providers/FilterProvider';

// Minimal fetch mock to avoid network in children
beforeAll(() => {
  // @ts-ignore
  global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ data: { currentPeriod: { totalAmount: 0, donationCount: 0 }, trendData: [] } }) });
});

describe('PrimaryRevenueDashboard', () => {
  it('renders three sections and view toggle', () => {
    render(
      <FilterProvider>
        <PrimaryRevenueDashboard />
      </FilterProvider>
    );

    expect(screen.getByText(/Revenue Overview/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Daily/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Weekly/i })).toBeInTheDocument();

    expect(screen.getByText(/Raised/i)).toBeInTheDocument();
    expect(screen.getByText(/First Installments/i)).toBeInTheDocument();
    expect(screen.getByText(/One-time Donations/i)).toBeInTheDocument();
  });
});

