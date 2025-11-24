"use client";

import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from 'react';
import { format } from 'date-fns';
import { buildAnalyticsUrl } from '@/lib/config/phpApi';
import { safeFetch, parseAPIResponse, logError, formatErrorForDisplay } from '@/lib/utils/errorHandling';
import { cachedFetch } from '@/lib/cache/apiCache';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface RevenueDataPoint {
  date: string;
  amount: number;
  count: number;
  comparisonAmount?: number;
  comparisonCount?: number;
  comparisonDate?: string;
}

interface RevenueData {
  totalAmount: number;
  totalCount: number;
  comparisonTotalAmount?: number;
  comparisonTotalCount?: number;
  chartData: RevenueDataPoint[];
  isLoading: boolean;
  error: string | null;
  isRetriable?: boolean;
}

interface RevenueResponse {
  data: {
    totalAmount: number;
    totalCount: number;
    trendData: Array<{
      period: string;
      amount: number;
      count: number;
    }>;
  };
}

// Helper function to aggregate daily data into weekly
function aggregateToWeekly(dailyData: RevenueDataPoint[]): RevenueDataPoint[] {
  if (dailyData.length === 0) return [];

  const weeklyMap = new Map<string, RevenueDataPoint>();

  dailyData.forEach(point => {
    const date = new Date(point.date);
    // Get the start of the week (Monday)
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust so Monday is start
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    const weekKey = format(weekStart, 'yyyy-MM-dd');

    // Calculate comparison week if comparison date exists
    let comparisonWeekKey: string | undefined;
    if (point.comparisonDate) {
      const compDate = new Date(point.comparisonDate);
      const compDayOfWeek = compDate.getDay();
      const compDiff = compDayOfWeek === 0 ? -6 : 1 - compDayOfWeek;
      const compWeekStart = new Date(compDate);
      compWeekStart.setDate(compDate.getDate() + compDiff);
      compWeekStart.setHours(0, 0, 0, 0);
      comparisonWeekKey = format(compWeekStart, 'yyyy-MM-dd');
    }

    const existing = weeklyMap.get(weekKey);
    if (existing) {
      existing.amount += point.amount;
      existing.count += point.count;
      if (point.comparisonAmount !== undefined) {
        existing.comparisonAmount = (existing.comparisonAmount || 0) + point.comparisonAmount;
      }
      if (point.comparisonCount !== undefined) {
        existing.comparisonCount = (existing.comparisonCount || 0) + point.comparisonCount;
      }
      // Keep the first comparison date for the week
      if (!existing.comparisonDate && comparisonWeekKey) {
        existing.comparisonDate = comparisonWeekKey;
      }
    } else {
      weeklyMap.set(weekKey, {
        date: weekKey,
        amount: point.amount,
        count: point.count,
        comparisonAmount: point.comparisonAmount,
        comparisonCount: point.comparisonCount,
        comparisonDate: comparisonWeekKey
      });
    }
  });

  return Array.from(weeklyMap.values()).sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function useRevenueData(
  dateRange: DateRange,
  comparisonRange?: DateRange | null,
  appealId?: string | null,
  fundId?: string | null,
  frequency?: string
) {
  const [totalRaisedData, setTotalRaisedData] = useState<RevenueData>({
    totalAmount: 0,
    totalCount: 0,
    chartData: [],
    isLoading: true,
    error: null
  });

  const [firstInstallmentsData, setFirstInstallmentsData] = useState<RevenueData>({
    totalAmount: 0,
    totalCount: 0,
    chartData: [],
    isLoading: true,
    error: null
  });

  const [oneTimeData, setOneTimeData] = useState<RevenueData>({
    totalAmount: 0,
    totalCount: 0,
    chartData: [],
    isLoading: true,
    error: null
  });

  const fetchData = useCallback(async (endpoint: string, setData: Dispatch<SetStateAction<RevenueData>>, endpointFrequency?: string) => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null, isRetriable: false }));

      // Fetch main data (always daily)
      const params = new URLSearchParams({
        startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
        endDate: format(dateRange.endDate, 'yyyy-MM-dd'),
        granularity: 'daily'
      });

      // Add filter parameters if provided
      if (appealId) {
        params.append('appealId', appealId);
      }
      if (fundId) {
        params.append('fundId', fundId);
      }

      // Use endpoint-specific frequency if provided, otherwise use global frequency
      const effectiveFrequency = endpointFrequency || frequency;
      if (effectiveFrequency && effectiveFrequency !== 'all') {
        params.append('frequency', effectiveFrequency);
      }

      const mainUrl = buildAnalyticsUrl(endpoint, params);

      // Use cached fetch with 5-minute TTL
      const mainResult: RevenueResponse = await cachedFetch(mainUrl, {}, {
        ttl: 5 * 60 * 1000, // 5 minutes
        useLocalStorage: true,
        dedupe: true
      });

      // Fetch comparison data if comparison range is provided (always daily)
      let comparisonResult: RevenueResponse | null = null;
      if (comparisonRange) {
        const comparisonParams = new URLSearchParams({
          startDate: format(comparisonRange.startDate, 'yyyy-MM-dd'),
          endDate: format(comparisonRange.endDate, 'yyyy-MM-dd'),
          granularity: 'daily'
        });

        // Add same filter parameters for comparison
        if (appealId) {
          comparisonParams.append('appealId', appealId);
        }
        if (fundId) {
          comparisonParams.append('fundId', fundId);
        }

        // Use endpoint-specific frequency if provided, otherwise use global frequency
        const effectiveFrequency = endpointFrequency || frequency;
        if (effectiveFrequency && effectiveFrequency !== 'all') {
          comparisonParams.append('frequency', effectiveFrequency);
        }

        try {
          const comparisonUrl = buildAnalyticsUrl(endpoint, comparisonParams);

          // Use cached fetch for comparison data too
          comparisonResult = await cachedFetch(comparisonUrl, {}, {
            ttl: 5 * 60 * 1000, // 5 minutes
            useLocalStorage: true,
            dedupe: true
          });
        } catch (comparisonError) {
          // Log comparison error but don't fail main request
          logError(comparisonError, `Comparison data fetch failed for ${endpoint}`);
        }
      }

      // Merge main and comparison data
      const mainTrendData = mainResult.data.trendData || [];
      const comparisonTrendData = comparisonResult?.data.trendData || [];

      // Create a map of comparison data by date for easy lookup
      const comparisonMap = new Map();
      comparisonTrendData.forEach((point: any, index: number) => {
        // Map comparison data by index since dates might be different
        comparisonMap.set(index, point);
      });

      const chartData = mainTrendData.map((point: any, index: number) => {
        const comparisonPoint = comparisonMap.get(index);
        return {
          date: point.period,
          amount: Number(point.amount || 0),
          count: Number(point.count || 0),
          comparisonAmount: Number(comparisonPoint?.amount || 0),
          comparisonCount: Number(comparisonPoint?.count || 0),
          comparisonDate: comparisonPoint?.period
        };
      });

      setData({
        totalAmount: Number(mainResult.data.totalAmount || 0),
        totalCount: Number(mainResult.data.totalCount || 0),
        comparisonTotalAmount: comparisonResult ? Number(comparisonResult.data.totalAmount || 0) : undefined,
        comparisonTotalCount: comparisonResult ? Number(comparisonResult.data.totalCount || 0) : undefined,
        chartData,
        isLoading: false,
        error: null,
        isRetriable: false
      });

    } catch (error) {
      logError(error, `Error fetching ${endpoint} data`);
      const { message, isRetriable } = formatErrorForDisplay(error);

      setData(prev => ({
        ...prev,
        isLoading: false,
        error: message,
        isRetriable
      }));
    }
  }, [dateRange.startDate, dateRange.endDate, appealId, fundId, frequency, comparisonRange]);

  useEffect(() => {
    // Fetch all three data sources in parallel (always daily data)
    // Total raised uses global frequency filter
    // First installments and one-time donations use their specific frequency types
    Promise.all([
      fetchData('total-raised', setTotalRaisedData), // Uses global frequency
      fetchData('first-installments', setFirstInstallmentsData, 'recurring-first'), // Always recurring-first
      fetchData('one-time-donations', setOneTimeData, 'one-time') // Always one-time
    ]);
  }, [dateRange.startDate, dateRange.endDate, comparisonRange?.startDate, comparisonRange?.endDate, appealId, fundId, frequency, fetchData]);

  const retry = useCallback(() => {
    Promise.all([
      fetchData('total-raised', setTotalRaisedData), // Uses global frequency
      fetchData('first-installments', setFirstInstallmentsData, 'recurring-first'), // Always recurring-first
      fetchData('one-time-donations', setOneTimeData, 'one-time') // Always one-time
    ]);
  }, [fetchData]);

  // Compute weekly aggregations from daily data
  const totalRaisedWeekly = {
    ...totalRaisedData,
    chartData: aggregateToWeekly(totalRaisedData.chartData)
  };

  const firstInstallmentsWeekly = {
    ...firstInstallmentsData,
    chartData: aggregateToWeekly(firstInstallmentsData.chartData)
  };

  const oneTimeWeekly = {
    ...oneTimeData,
    chartData: aggregateToWeekly(oneTimeData.chartData)
  };

  return {
    totalRaised: {
      daily: totalRaisedData,
      weekly: totalRaisedWeekly
    },
    firstInstallments: {
      daily: firstInstallmentsData,
      weekly: firstInstallmentsWeekly
    },
    oneTime: {
      daily: oneTimeData,
      weekly: oneTimeWeekly
    },
    isLoading: totalRaisedData.isLoading || firstInstallmentsData.isLoading || oneTimeData.isLoading,
    hasError: !!(totalRaisedData.error || firstInstallmentsData.error || oneTimeData.error),
    retry
  };
}
