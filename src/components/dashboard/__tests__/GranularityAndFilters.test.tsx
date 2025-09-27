import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PrimaryRevenueDashboard from '@/components/dashboard/PrimaryRevenueDashboard';
import { FilterProvider } from '@/providers/FilterProvider';
import { useFilterStore } from '@/stores/filterStore';

describe('Granularity and Filter propagation', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ data: { currentPeriod: { totalAmount: 0, donationCount: 0 }, trendData: [] } }) });
  });

  it('applies Weekly granularity to all section requests', async () => {
    render(
      <FilterProvider>
        <PrimaryRevenueDashboard />
      </FilterProvider>
    );

    const weekly = screen.getByRole('button', { name: /Weekly/i });
    fireEvent.click(weekly);

    await waitFor(() => {
      // @ts-ignore
      const calls = (global.fetch as jest.Mock).mock.calls.map((c: any[]) => String(c[0]));
      expect(calls.some(u => u.includes('/api/v1/analytics/total-raised') && u.includes('granularity=weekly'))).toBe(true);
      expect(calls.some(u => u.includes('/api/v1/analytics/first-installments') && u.includes('granularity=weekly'))).toBe(true);
      expect(calls.some(u => u.includes('/api/v1/analytics/one-time-donations') && u.includes('granularity=weekly'))).toBe(true);
    });
  });

  it('propagates frequency filter to all sections', async () => {
    render(
      <FilterProvider>
        <PrimaryRevenueDashboard />
      </FilterProvider>
    );

    // Update frequency in store
    useFilterStore.getState().setFrequency('recurring');

    await waitFor(() => {
      // @ts-ignore
      const calls = (global.fetch as jest.Mock).mock.calls.map((c: any[]) => String(c[0]));
      expect(calls.some(u => u.includes('/api/v1/analytics/total-raised') && u.includes('frequency=recurring'))).toBe(true);
      expect(calls.some(u => u.includes('/api/v1/analytics/first-installments') && u.includes('frequency=recurring'))).toBe(true);
      expect(calls.some(u => u.includes('/api/v1/analytics/one-time-donations') && u.includes('frequency=recurring'))).toBe(true);
    });
  });
});

