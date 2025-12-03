"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import apiClient from '@/lib/api/client';
import { logError } from '@/lib/utils/errorHandling';

interface PaymentMethodRawData {
  payment_method: string;
  donation_count: number | null;
  total_raised: number | null;
}

interface PaymentMethodStats {
  paymentMethod: string;
  donations: number;
  totalRaised: number;
}

interface PaymentMethodChartDataPoint {
  date: string;
  paymenttype: string;
  amount: number;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface UsePaymentMethodsDataResult {
  chartData: { [key: string]: any }[];
  tableData: PaymentMethodStats[];
  isLoading: boolean;
  hasError: boolean;
  error: string | null;
}

// Calculate median from array of numbers
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    const val1 = sorted[mid - 1];
    const val2 = sorted[mid];
    return val1 !== undefined && val2 !== undefined ? (val1 + val2) / 2 : 0;
  } else {
    const val = sorted[mid];
    return val !== undefined ? val : 0;
  }
}

// Process raw data to calculate stats
function processTableData(rawData: PaymentMethodRawData[]): PaymentMethodStats[] {
  return rawData
    .map((r) => ({
      paymentMethod: String(r.payment_method || ''),
      donations: typeof r.donation_count === 'number' ? r.donation_count : 0,
      totalRaised: typeof r.total_raised === 'number' ? r.total_raised : 0,
    }))
    .filter((r) => r.paymentMethod !== '')
    .sort((a, b) => b.totalRaised - a.totalRaised);
}

// Transform chart data to group by date
function transformChartData(rawChartData: PaymentMethodChartDataPoint[]): { [key: string]: any }[] {
  const grouped = rawChartData.reduce((acc, row) => {
    const date = row.date;
    if (!acc[date]) {
      acc[date] = { date };
    }
    acc[date][row.paymenttype] = row.amount;
    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
}

export function usePaymentMethodsData(
  dateRange: DateRange,
  granularity: 'daily' | 'weekly',
  appealIds: string | null,
  fundIds: string | null
): UsePaymentMethodsDataResult {
  const [chartData, setChartData] = useState<{ [key: string]: any }[]>([]);
  const [tableData, setTableData] = useState<PaymentMethodStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          granularity,
          metric: 'chart'
        };
        if (appealIds) chartParams.appealId = appealIds;
        if (fundIds) chartParams.fundId = fundIds;

        const tableParams: Record<string, string> = {
          startDate,
          endDate,
          metric: 'table'
        };
        if (appealIds) tableParams.appealId = appealIds;
        if (fundIds) tableParams.fundId = fundIds;

        const [chartResponse, tableResponse] = await Promise.all([
          apiClient.get('payment-methods', chartParams),
          apiClient.get('payment-methods', tableParams)
        ]);

        if (!isMounted) return;

        const toNum = (v: unknown, fallback = 0): number => {
          if (v === null || v === undefined) return fallback;
          if (typeof v === 'number') return Number.isFinite(v) ? v : fallback;
          if (typeof v === 'string') {
            if (v.trim() === '') return fallback;
            const n = parseFloat(v);
            return Number.isFinite(n) ? n : fallback;
          }
          const n = Number(v);
          return Number.isFinite(n) ? n : fallback;
        };

        const transformedChartData = transformChartData(
          (chartResponse.data?.chartData || []).map((d: any) => ({
            date: String(d.date || ''),
            paymenttype: String(d.paymenttype || ''),
            amount: toNum(d.amount, 0)
          }))
        );

        const processedTableData = processTableData(
          (tableResponse.data?.tableData || []).map((r: any) => ({
            payment_method: String(r.payment_method || ''),
            donation_count: r.donation_count === null ? 0 : toNum(r.donation_count, 0),
            total_raised: r.total_raised === null ? 0 : toNum(r.total_raised, 0),
          }))
        );

        setChartData(transformedChartData);
        setTableData(processedTableData);
        setIsLoading(false);
      } catch (err) {
        logError(err, 'usePaymentMethodsData');
        if (isMounted) {
          setHasError(true);
          setError(err instanceof Error ? err.message : 'Failed to fetch payment methods data');
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [dateRange.startDate, dateRange.endDate, granularity, appealIds, fundIds]);

  return {
    chartData,
    tableData,
    isLoading,
    hasError,
    error
  };
}
