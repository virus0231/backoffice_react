"use client";

import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from 'react';
import { format } from 'date-fns';
import apiClient from '@/lib/api/client';
import { logError, formatErrorForDisplay } from '@/lib/utils/errorHandling';

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
  success: boolean;
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

  const fetchData = useCallback(
    async (
      kind: string,
      setData: Dispatch<SetStateAction<RevenueData>>,
      endpointFrequency?: string
    ) => {
      try {
        setData((prev) => ({ ...prev, isLoading: true, error: null, isRetriable: false }));

        const baseParams: Record<string, string> = {
          startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
          endDate: format(dateRange.endDate, 'yyyy-MM-dd'),
          granularity: 'daily',
          kind,
        };

        if (appealId) {
          baseParams.appealId = appealId;
        }
        if (fundId) {
          baseParams.fundId = fundId;
        }

        const effectiveFrequency = endpointFrequency || frequency;
        if (effectiveFrequency && effectiveFrequency !== 'all') {
          baseParams.frequency = effectiveFrequency;
        }

        const mainResult: RevenueResponse = await apiClient.get('analytics', baseParams);
        if (!mainResult?.success) {
          throw new Error(mainResult?.['message'] || 'Failed to fetch analytics data');
        }

        let comparisonResult: RevenueResponse | null = null;
        if (comparisonRange) {
          const comparisonParams: Record<string, string> = {
            startDate: format(comparisonRange.startDate, 'yyyy-MM-dd'),
            endDate: format(comparisonRange.endDate, 'yyyy-MM-dd'),
            granularity: 'daily',
            kind,
          };

          if (appealId) comparisonParams.appealId = appealId;
          if (fundId) comparisonParams.fundId = fundId;
          if (effectiveFrequency && effectiveFrequency !== 'all') {
            comparisonParams.frequency = effectiveFrequency;
          }

          try {
            comparisonResult = await apiClient.get('analytics', comparisonParams);
          } catch (comparisonError) {
            logError(comparisonError, `Comparison data fetch failed for ${kind}`);
          }
        }

        const mainTrendData = mainResult?.data?.trendData || [];
        const comparisonTrendData = comparisonResult?.data?.trendData || [];

        const chartData = mainTrendData.map((point: any, index: number) => {
          const comparisonPoint = comparisonTrendData[index];
          return {
            date: point.period || point.date,
            amount: Number(point.amount || 0),
            count: Number(point.count || 0),
            comparisonAmount: Number(comparisonPoint?.amount || 0),
            comparisonCount: Number(comparisonPoint?.count || 0),
            comparisonDate: comparisonPoint?.period || comparisonPoint?.date,
          };
        });

        setData({
          totalAmount: Number(mainResult?.data?.totalAmount || 0),
          totalCount: Number(mainResult?.data?.totalCount || 0),
          comparisonTotalAmount: comparisonResult ? Number(comparisonResult?.data?.totalAmount || 0) : undefined,
          comparisonTotalCount: comparisonResult ? Number(comparisonResult?.data?.totalCount || 0) : undefined,
          chartData,
          isLoading: false,
          error: null,
          isRetriable: false,
        });
      } catch (error) {
        logError(error, `Error fetching ${kind} data`);
        const { message, isRetriable } = formatErrorForDisplay(error);

        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
          isRetriable,
        }));
      }
    },
    [dateRange.startDate, dateRange.endDate, appealId, fundId, frequency, comparisonRange]
  );

  useEffect(() => {
    Promise.all([
      fetchData('total-raised', setTotalRaisedData),
      fetchData('first-installments', setFirstInstallmentsData, 'recurring-first'),
      fetchData('one-time-donations', setOneTimeData, 'one-time'),
    ]);
  }, [
    dateRange.startDate,
    dateRange.endDate,
    comparisonRange?.startDate,
    comparisonRange?.endDate,
    appealId,
    fundId,
    frequency,
    fetchData,
  ]);

  const retry = useCallback(() => {
    Promise.all([
      fetchData('total-raised', setTotalRaisedData),
      fetchData('first-installments', setFirstInstallmentsData, 'recurring-first'),
      fetchData('one-time-donations', setOneTimeData, 'one-time'),
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
