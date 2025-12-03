"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import apiClient from '@/lib/api/client';
import { logError } from '@/lib/utils/errorHandling';

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

        const chartParams: Record<string, string> = {
          startDate,
          endDate,
          metric: 'chart'
        };

        const tableParams: Record<string, string> = {
          startDate,
          endDate,
          metric: 'table'
        };

        if (appealIds) {
          chartParams.appealId = appealIds;
          tableParams.appealId = appealIds;
        }
        if (fundIds) {
          chartParams.fundId = fundIds;
          tableParams.fundId = fundIds;
        }

        const [chartResponse, tableResponse] = await Promise.all([
          apiClient.get('frequencies', chartParams),
          apiClient.get('frequencies', tableParams)
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

          const normalizedChart = (chartResponse.data?.chartData || []).map((d: any) => ({
            date: String(d.date || ''),
            monthly: toNum(d.monthly, 0),
            one_time: toNum(d.one_time, 0),
            yearly: toNum(d.yearly, 0),
            weekly: toNum(d.weekly, 0),
            daily: toNum(d.daily, 0),
          }));

          const normalizedTable = (tableResponse.data?.tableData || []).map((r: any) => ({
            frequency: String(r.frequency || ''),
            donations: Math.round(toNum(r.donations, 0)),
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
