"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { buildPaymentMethodsUrl } from '@/lib/config/phpApi';
import { cachedFetch } from '@/lib/cache/apiCache';
import { logError } from '@/lib/utils/errorHandling';

interface PaymentMethodRawData {
  payment_method: string;
  amount: number | null;
  freq: number | null;
  totalamount: number | null;
}

interface PaymentMethodStats {
  paymentMethod: string;
  donations: number;
  oneTimeMedian: number;
  recurringMedian: number;
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
  // Group by payment method
  const grouped = rawData.reduce((acc, row) => {
    const method = row.payment_method;
    if (!acc[method]) {
      acc[method] = {
        oneTimeAmounts: [],
        recurringAmounts: [],
        totalRaised: 0,
        donationCount: 0
      };
    }

    // Only process if row has valid data
    if (row.amount !== null && row.freq !== null && row.totalamount !== null) {
      if (row.freq === 0) {
        acc[method].oneTimeAmounts.push(row.amount);
      } else if (row.freq > 0) {
        acc[method].recurringAmounts.push(row.amount);
      }
      acc[method].totalRaised += row.totalamount;
      acc[method].donationCount++;
    }

    return acc;
  }, {} as Record<string, { oneTimeAmounts: number[], recurringAmounts: number[], totalRaised: number, donationCount: number }>);

  // Calculate stats for each payment method
  return Object.entries(grouped).map(([method, data]) => ({
    paymentMethod: method,
    donations: data.donationCount,
    oneTimeMedian: calculateMedian(data.oneTimeAmounts),
    recurringMedian: calculateMedian(data.recurringAmounts),
    totalRaised: data.totalRaised
  })).sort((a, b) => b.totalRaised - a.totalRaised);
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

        const chartParams = new URLSearchParams({
          startDate,
          endDate,
          granularity
        });
        if (appealIds) chartParams.set('appealId', appealIds);
        if (fundIds) chartParams.set('fundId', fundIds);

        const tableParams = new URLSearchParams({
          startDate,
          endDate
        });
        if (appealIds) tableParams.set('appealId', appealIds);
        if (fundIds) tableParams.set('fundId', fundIds);

        const chartUrl = buildPaymentMethodsUrl('chart', chartParams);
        const tableUrl = buildPaymentMethodsUrl('table', tableParams);

        const [chartResponse, tableResponse] = await Promise.all([
          cachedFetch<{ success: boolean; data: { chartData: PaymentMethodChartDataPoint[] } }>(chartUrl, undefined, { ttl: 5 * 60 * 1000 }),
          cachedFetch<{ success: boolean; data: { tableData: PaymentMethodRawData[] } }>(tableUrl, undefined, { ttl: 5 * 60 * 1000 })
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
          (chartResponse.data.chartData || []).map((d: any) => ({
            date: String(d.date || ''),
            paymenttype: String(d.paymenttype || ''),
            amount: toNum(d.amount, 0)
          }))
        );

        const processedTableData = processTableData(
          (tableResponse.data.tableData || []).map((r: any) => ({
            payment_method: String(r.payment_method || ''),
            amount: r.amount === null ? null : toNum(r.amount, 0),
            freq: r.freq === null ? null : toNum(r.freq, 0),
            totalamount: r.totalamount === null ? null : toNum(r.totalamount, 0)
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
