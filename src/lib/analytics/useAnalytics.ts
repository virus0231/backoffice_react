"use client";

import { useEffect, useMemo, useState } from 'react';
import { useFilterStore } from '@/stores/filterStore';

export interface AnalyticsQueryParams {
  startDate: string;
  endDate: string;
  appealId: number | null;
  fundId: number | null;
  frequency: string;
  compareStartDate?: string | null;
  compareEndDate?: string | null;
}

export const buildAnalyticsQueryParams = (state: ReturnType<typeof useFilterStore.getState>, chartId?: string): AnalyticsQueryParams => {
  const { dateRange, selectedAppeal, selectedFund, frequency, comparisons } = state;
  const cmp = chartId ? comparisons[chartId] : undefined;

  return {
    startDate: dateRange.startDate.toISOString(),
    endDate: dateRange.endDate.toISOString(),
    appealId: selectedAppeal?.id ?? null,
    fundId: selectedFund?.id ?? null,
    frequency,
    compareStartDate: cmp?.enabled && cmp.startDate ? new Date(cmp.startDate).toISOString() : null,
    compareEndDate: cmp?.enabled && cmp.endDate ? new Date(cmp.endDate).toISOString() : 
      null,
  };
};

export function useAnalytics(endpoint: string, chartId?: string) {
  const store = useFilterStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(() => buildAnalyticsQueryParams(store, chartId), [store.dateRange, store.selectedAppeal, store.selectedFund, store.frequency, store.comparisons, chartId]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = new URL(endpoint, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
        });
        const res = await fetch(url.toString());
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to fetch');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [endpoint, JSON.stringify(params)]);

  return { data, loading, error, params };
}

