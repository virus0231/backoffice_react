"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { buildRecurringRevenueUrl } from '@/lib/config/phpApi';
import { logError } from '@/lib/utils/errorHandling';
import { cachedFetch } from '@/lib/cache/apiCache';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface RevenueDataPoint {
  date: string;
  value: number;
  comparisonValue?: number;
  comparisonDate?: string;
}

interface DonationAmountRange {
  amount_range: string;
  plan_count: number;
  percentage: number;
}

interface MetricData {
  daily: RevenueDataPoint[];
  weekly: RevenueDataPoint[];
}

interface RecurringRevenueData {
  mrr: MetricData;
  shareOfRevenue: MetricData;
  donationAmounts: DonationAmountRange[];
  isLoading: boolean;
  hasError: boolean;
  error: string | null;
}

interface RecurringRevenueResponse {
  data: {
    metric: string;
    trendData: Array<{
      date: string;
      value?: number;
      mrr?: number;
      amount_range?: string;
      plan_count?: number;
      percentage?: number;
    }>;
  };
}

/**
 * Aggregate daily data to weekly by taking last value (for MRR snapshots)
 */
function aggregateToWeeklyLast(dailyData: RevenueDataPoint[]): RevenueDataPoint[] {
  if (dailyData.length === 0) return [];

  const weeklyMap = new Map<string, { points: RevenueDataPoint[] }>();

  dailyData.forEach(point => {
    const date = new Date(point.date);
    // Get Monday of the week
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    const weekKey = format(monday, 'yyyy-MM-dd');

    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, { points: [] });
    }

    weeklyMap.get(weekKey)!.points.push(point);
  });

  // Take the last point of each week
  const result: RevenueDataPoint[] = [];
  weeklyMap.forEach((weekData, weekKey) => {
    const lastPoint = weekData.points[weekData.points.length - 1];
    if (lastPoint) {
      result.push({
        date: weekKey,
        value: lastPoint.value,
        comparisonValue: lastPoint.comparisonValue,
        comparisonDate: lastPoint.comparisonDate
      });
    }
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Fetch MRR data
 */
async function fetchMRRData(
  dateRange: DateRange,
  comparisonRange: DateRange | null,
  appealIds: string | null,
  fundIds: string | null
): Promise<MetricData> {
  const searchParams = new URLSearchParams({
    startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
    endDate: format(dateRange.endDate, 'yyyy-MM-dd'),
    granularity: 'daily'
  });

  if (appealIds) searchParams.set('appealId', appealIds);
  if (fundIds) searchParams.set('fundId', fundIds);

  const mainUrl = buildRecurringRevenueUrl('mrr', searchParams);

  // Fetch main period data
  const mainResponse = await cachedFetch<RecurringRevenueResponse>(mainUrl, undefined, {
    ttl: 5 * 60 * 1000 // 5 minutes
  });

  const mainData: RevenueDataPoint[] = mainResponse.data.trendData.map(point => ({
    date: point.date,
    value: Number(point.value) || 0
  }));

  // Fetch comparison period data if requested
  let comparisonData: RevenueDataPoint[] = [];
  if (comparisonRange) {
    const compSearchParams = new URLSearchParams({
      startDate: format(comparisonRange.startDate, 'yyyy-MM-dd'),
      endDate: format(comparisonRange.endDate, 'yyyy-MM-dd'),
      granularity: 'daily'
    });

    if (appealIds) compSearchParams.set('appealId', appealIds);
    if (fundIds) compSearchParams.set('fundId', fundIds);

    const compUrl = buildRecurringRevenueUrl('mrr', compSearchParams);

    try {
      const compResponse = await cachedFetch<RecurringRevenueResponse>(compUrl, undefined, {
        ttl: 5 * 60 * 1000
      });

      comparisonData = compResponse.data.trendData.map(point => ({
        date: point.date,
        value: Number(point.value) || 0
      }));
    } catch (error) {
      logError(error, 'useRecurringRevenueData.fetchMRRComparison');
    }
  }

  // Merge comparison data into main data
  const dailyData = mainData.map((point, index) => ({
    ...point,
    comparisonValue: comparisonData[index]?.value,
    comparisonDate: comparisonData[index]?.date
  }));

  // Generate weekly aggregation
  const weeklyData = aggregateToWeeklyLast(dailyData);

  return {
    daily: dailyData,
    weekly: weeklyData
  };
}

/**
 * Fetch share of revenue data
 */
async function fetchShareOfRevenueData(
  dateRange: DateRange,
  comparisonRange: DateRange | null,
  appealIds: string | null,
  fundIds: string | null
): Promise<MetricData> {
  const searchParams = new URLSearchParams({
    startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
    endDate: format(dateRange.endDate, 'yyyy-MM-dd'),
    granularity: 'daily'
  });

  if (appealIds) searchParams.set('appealId', appealIds);
  if (fundIds) searchParams.set('fundId', fundIds);

  const mainUrl = buildRecurringRevenueUrl('share-of-revenue', searchParams);

  // Fetch main period data
  const mainResponse = await cachedFetch<RecurringRevenueResponse>(mainUrl, undefined, {
    ttl: 5 * 60 * 1000
  });

  const mainData: RevenueDataPoint[] = mainResponse.data.trendData.map(point => ({
    date: point.date,
    value: Number(point.value) || 0
  }));

  // Fetch comparison period data if requested
  let comparisonData: RevenueDataPoint[] = [];
  if (comparisonRange) {
    const compSearchParams = new URLSearchParams({
      startDate: format(comparisonRange.startDate, 'yyyy-MM-dd'),
      endDate: format(comparisonRange.endDate, 'yyyy-MM-dd'),
      granularity: 'daily'
    });

    if (appealIds) compSearchParams.set('appealId', appealIds);
    if (fundIds) compSearchParams.set('fundId', fundIds);

    const compUrl = buildRecurringRevenueUrl('share-of-revenue', compSearchParams);

    try {
      const compResponse = await cachedFetch<RecurringRevenueResponse>(compUrl, undefined, {
        ttl: 5 * 60 * 1000
      });

      comparisonData = compResponse.data.trendData.map(point => ({
        date: point.date,
        value: Number(point.value) || 0
      }));
    } catch (error) {
      logError(error, 'useRecurringRevenueData.fetchShareOfRevenueComparison');
    }
  }

  // Merge comparison data into main data
  const dailyData = mainData.map((point, index) => ({
    ...point,
    comparisonValue: comparisonData[index]?.value,
    comparisonDate: comparisonData[index]?.date
  }));

  // Generate weekly aggregation
  const weeklyData = aggregateToWeeklyLast(dailyData);

  return {
    daily: dailyData,
    weekly: weeklyData
  };
}

/**
 * Fetch donation amounts distribution
 */
async function fetchDonationAmounts(
  endDate: Date,
  appealIds: string | null,
  fundIds: string | null
): Promise<DonationAmountRange[]> {
  const searchParams = new URLSearchParams({
    startDate: format(endDate, 'yyyy-MM-dd'), // Not used by API, but required
    endDate: format(endDate, 'yyyy-MM-dd'),
    granularity: 'daily'
  });

  if (appealIds) searchParams.set('appealId', appealIds);
  if (fundIds) searchParams.set('fundId', fundIds);

  const url = buildRecurringRevenueUrl('donation-amounts', searchParams);

  const response = await cachedFetch<RecurringRevenueResponse>(url, undefined, {
    ttl: 5 * 60 * 1000
  });

  return response.data.trendData.map(item => ({
    amount_range: item.amount_range || '',
    plan_count: Number(item.plan_count) || 0,
    percentage: Number(item.percentage) || 0
  }));
}

/**
 * Custom hook to fetch recurring revenue data
 */
export function useRecurringRevenueData(
  dateRange: DateRange,
  comparisonRange: DateRange | null,
  appealIds: string | null,
  fundIds: string | null
): RecurringRevenueData {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mrr, setMrr] = useState<MetricData>({ daily: [], weekly: [] });
  const [shareOfRevenue, setShareOfRevenue] = useState<MetricData>({ daily: [], weekly: [] });
  const [donationAmounts, setDonationAmounts] = useState<DonationAmountRange[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setIsLoading(true);
      setHasError(false);
      setError(null);

      try {
        // Fetch MRR, share of revenue, and donation amounts in parallel
        const [mrrData, shareData, amountsData] = await Promise.all([
          fetchMRRData(dateRange, comparisonRange, appealIds, fundIds),
          fetchShareOfRevenueData(dateRange, comparisonRange, appealIds, fundIds),
          fetchDonationAmounts(dateRange.endDate, appealIds, fundIds)
        ]);

        if (isMounted) {
          setMrr(mrrData);
          setShareOfRevenue(shareData);
          setDonationAmounts(amountsData);
          setIsLoading(false);
        }
      } catch (err) {
        logError(err, 'useRecurringRevenueData');
        if (isMounted) {
          setHasError(true);
          setError(err instanceof Error ? err.message : 'Failed to fetch recurring revenue data');
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
    comparisonRange?.startDate,
    comparisonRange?.endDate,
    appealIds,
    fundIds
  ]);

  return {
    mrr,
    shareOfRevenue,
    donationAmounts,
    isLoading,
    hasError,
    error
  };
}
