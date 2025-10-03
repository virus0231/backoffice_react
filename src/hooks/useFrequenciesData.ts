"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { buildFrequenciesUrl } from '@/lib/config/phpApi';
import { logError } from '@/lib/utils/errorHandling';
import { cachedFetch } from '@/lib/cache/apiCache';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface ChartDataPoint {
  date: string;
  monthly: number;
  one_time: number;
  yearly: number;
  weekly: number;
  daily: number;
}

interface TableDataRow {
  frequency: string;
  donations: number;
  averageAmount: number;
  medianAmount: number;
  totalRaised: number;
}

interface FrequenciesData {
  chartData: ChartDataPoint[];
  tableData: TableDataRow[];
  isLoading: boolean;
  hasError: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch frequencies data
 */
export function useFrequenciesData(
  dateRange: DateRange,
  appealIds: string | null,
  fundIds: string | null
): FrequenciesData {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [tableData, setTableData] = useState<TableDataRow[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setIsLoading(true);
      setHasError(false);
      setError(null);

      try {
        const startDate = format(dateRange.startDate, 'yyyy-MM-dd');
        const endDate = format(dateRange.endDate, 'yyyy-MM-dd');

        // Build search params for chart data
        const chartParams = new URLSearchParams({
          startDate,
          endDate
        });

        if (appealIds) chartParams.set('appealId', appealIds);
        if (fundIds) chartParams.set('fundId', fundIds);

        // Build search params for table data
        const tableParams = new URLSearchParams({
          startDate,
          endDate
        });

        if (appealIds) tableParams.set('appealId', appealIds);
        if (fundIds) tableParams.set('fundId', fundIds);

        // Use the URL builder
        const chartUrl = buildFrequenciesUrl('chart', chartParams);
        const tableUrl = buildFrequenciesUrl('table', tableParams);

        // Debug URLs can be useful during development
        // console.warn('Frequencies API URLs:', { chartUrl, tableUrl });

        // Fetch both chart and table data in parallel
        const [chartResponse, tableResponse] = await Promise.all([
          cachedFetch<{ success: boolean; data: { chartData: ChartDataPoint[] } }>(chartUrl, undefined, {
            ttl: 5 * 60 * 1000 // 5 minutes
          }),
          cachedFetch<{ success: boolean; data: { tableData: TableDataRow[] } }>(tableUrl, undefined, {
            ttl: 5 * 60 * 1000
          })
        ]);

        if (isMounted) {
          // Normalize potential string numbers coming from the API
          const toNum = (v: unknown, fallback = 0): number => {
            // Handle null/undefined
            if (v === null || v === undefined) return fallback;

            // Handle numbers
            if (typeof v === 'number') return Number.isFinite(v) ? v : fallback;

            // Handle strings
            if (typeof v === 'string') {
              // Handle empty strings
              if (v.trim() === '') return fallback;
              const n = parseFloat(v);
              return Number.isFinite(n) ? n : fallback;
            }

            // Try to convert anything else
            const n = Number(v);
            return Number.isFinite(n) ? n : fallback;
          };

          const normalizedChart = (chartResponse.data.chartData || []).map((d: any) => ({
            date: String(d.date || ''),
            monthly: toNum(d.monthly, 0),
            one_time: toNum(d.one_time, 0),
            yearly: toNum(d.yearly, 0),
            weekly: toNum(d.weekly, 0),
            daily: toNum(d.daily, 0),
          }));

          const normalizedTable = (tableResponse.data.tableData || []).map((r: any) => ({
            frequency: String(r.frequency || ''),
            donations: Math.round(toNum(r.donations, 0)),
            averageAmount: toNum(r.averageAmount, 0),
            medianAmount: toNum(r.medianAmount, 0),
            totalRaised: toNum(r.totalRaised, 0),
          }));

          setChartData(normalizedChart);
          setTableData(normalizedTable);
          setIsLoading(false);
        }
      } catch (err) {
        logError(err, 'useFrequenciesData');
        if (isMounted) {
          setHasError(true);
          setError(err instanceof Error ? err.message : 'Failed to fetch frequencies data');
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [
    dateRange.startDate,
    dateRange.endDate,
    appealIds,
    fundIds
  ]);

  return {
    chartData,
    tableData,
    isLoading,
    hasError,
    error
  };
}
