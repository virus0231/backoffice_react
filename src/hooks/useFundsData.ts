"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { buildFundsDataUrl } from '@/lib/config/phpApi';
import { cachedFetch } from '@/lib/cache/apiCache';
import { logError } from '@/lib/utils/errorHandling';

interface FundRawData {
  fund_id: number;
  fund_name: string;
  appeal_id: number | null;
  appeal_name: string | null;
  amount: number | null;
  freq: number | null;
  totalamount: number | null;
}

interface FundStats {
  fundId: number;
  fundName: string;
  appealId: number | null;
  appealName: string | null;
  donations: number;
  oneTimeMedian: number;
  recurringMedian: number;
  totalRaised: number;
}

interface FundChartDataPoint {
  date: string;
  fund_id: number;
  fund_name: string;
  appeal_id: number | null;
  appeal_name: string | null;
  amount: number;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface UseFundsDataResult {
  chartData: { [key: string]: any }[];
  tableData: FundStats[];
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
function processTableData(rawData: FundRawData[]): FundStats[] {
  // Group by fund
  const grouped = rawData.reduce((acc, row) => {
    const fundKey = `${row.fund_id}`;
    if (!acc[fundKey]) {
      acc[fundKey] = {
        fundId: row.fund_id,
        fundName: row.fund_name,
        appealId: row.appeal_id,
        appealName: row.appeal_name,
        oneTimeAmounts: [],
        recurringAmounts: [],
        totalRaised: 0,
        donationCount: 0
      };
    }

    // Only process if row has valid data
    if (row.amount !== null && row.freq !== null && row.totalamount !== null) {
      if (row.freq === 0) {
        acc[fundKey].oneTimeAmounts.push(row.amount);
      } else if (row.freq > 0) {
        acc[fundKey].recurringAmounts.push(row.amount);
      }
      acc[fundKey].totalRaised += row.totalamount;
      acc[fundKey].donationCount++;
    }

    return acc;
  }, {} as Record<string, { fundId: number, fundName: string, appealId: number | null, appealName: string | null, oneTimeAmounts: number[], recurringAmounts: number[], totalRaised: number, donationCount: number }>);

  // Calculate stats for each fund
  return Object.values(grouped).map(data => ({
    fundId: data.fundId,
    fundName: data.fundName,
    appealId: data.appealId,
    appealName: data.appealName,
    donations: data.donationCount,
    oneTimeMedian: calculateMedian(data.oneTimeAmounts),
    recurringMedian: calculateMedian(data.recurringAmounts),
    totalRaised: data.totalRaised
  })).sort((a, b) => b.totalRaised - a.totalRaised);
}

// Transform chart data to group by date
function transformChartData(rawChartData: FundChartDataPoint[]): { [key: string]: any }[] {
  const grouped = rawChartData.reduce((acc, row) => {
    const date = row.date;
    if (!acc[date]) {
      acc[date] = { date };
    }
    // Use fund_id as key for the amount
    acc[date][`fund_${row.fund_id}`] = row.amount;
    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
}

export function useFundsData(
  dateRange: DateRange,
  granularity: 'daily' | 'weekly',
  appealIds: string | null
): UseFundsDataResult {
  const [chartData, setChartData] = useState<{ [key: string]: any }[]>([]);
  const [tableData, setTableData] = useState<FundStats[]>([]);
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

        const tableParams = new URLSearchParams({
          startDate,
          endDate
        });
        if (appealIds) tableParams.set('appealId', appealIds);

        const chartUrl = buildFundsDataUrl('chart', chartParams);
        const tableUrl = buildFundsDataUrl('table', tableParams);

        const [chartResponse, tableResponse] = await Promise.all([
          cachedFetch<{ success: boolean; data: { chartData: FundChartDataPoint[] } }>(chartUrl, undefined, { ttl: 5 * 60 * 1000 }),
          cachedFetch<{ success: boolean; data: { tableData: FundRawData[] } }>(tableUrl, undefined, { ttl: 5 * 60 * 1000 })
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
            fund_id: toNum(d.fund_id, 0),
            fund_name: String(d.fund_name || ''),
            appeal_id: d.appeal_id === null ? null : toNum(d.appeal_id, 0),
            appeal_name: d.appeal_name === null ? null : String(d.appeal_name),
            amount: toNum(d.amount, 0)
          }))
        );

        const processedTableData = processTableData(
          (tableResponse.data.tableData || []).map((r: any) => ({
            fund_id: toNum(r.fund_id, 0),
            fund_name: String(r.fund_name || ''),
            appeal_id: r.appeal_id === null ? null : toNum(r.appeal_id, 0),
            appeal_name: r.appeal_name === null ? null : String(r.appeal_name),
            amount: r.amount === null ? null : toNum(r.amount, 0),
            freq: r.freq === null ? null : toNum(r.freq, 0),
            totalamount: r.totalamount === null ? null : toNum(r.totalamount, 0)
          }))
        );

        setChartData(transformedChartData);
        setTableData(processedTableData);
        setIsLoading(false);
      } catch (err) {
        logError(err, 'useFundsData');
        if (isMounted) {
          setHasError(true);
          setError(err instanceof Error ? err.message : 'Failed to fetch funds data');
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [dateRange.startDate, dateRange.endDate, granularity, appealIds]);

  return {
    chartData,
    tableData,
    isLoading,
    hasError,
    error
  };
}
