"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import apiClient from '@/lib/api/client';
import { logError } from '@/lib/utils/errorHandling';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface PlanDataPoint {
  date: string;
  value: number;
  comparisonValue?: number;
  comparisonDate?: string;
}

interface MetricData {
  daily: PlanDataPoint[];
  weekly: PlanDataPoint[];
}

interface RecurringPlansData {
  activePlans: MetricData;
  newPlans: MetricData;
  canceledPlans: MetricData;
  isLoading: boolean;
  hasError: boolean;
  error: string | null;
}

interface RecurringPlansResponse {
  data: {
    metric: string;
    trendData: Array<{
      date: string;
      value: number;
    }>;
  };
}

/**
 * Aggregate daily data to weekly by summing values (for new/canceled plans)
 */
function aggregateToWeeklySum(dailyData: PlanDataPoint[]): PlanDataPoint[] {
  if (dailyData.length === 0) return [];

  const weeklyMap = new Map<string, PlanDataPoint>();

  dailyData.forEach(point => {
    const date = new Date(point.date);
    // Get Monday of the week
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    const weekKey = format(monday, 'yyyy-MM-dd');

    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, {
        date: weekKey,
        value: 0,
        comparisonValue: point.comparisonValue !== undefined ? 0 : undefined,
        comparisonDate: point.comparisonDate
      });
    }

    const weekData = weeklyMap.get(weekKey)!;
    weekData.value += point.value;
    if (point.comparisonValue !== undefined && weekData.comparisonValue !== undefined) {
      weekData.comparisonValue += point.comparisonValue;
    }
  });

  return Array.from(weeklyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Aggregate daily data to weekly by taking last value (for active plans snapshots)
 */
function aggregateToWeeklyLast(dailyData: PlanDataPoint[]): PlanDataPoint[] {
  if (dailyData.length === 0) return [];

  const weeklyMap = new Map<string, { points: PlanDataPoint[] }>();

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
  const result: PlanDataPoint[] = [];
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
 * Fetch recurring plans data for a specific metric
 */
async function fetchMetricData(
  metric: string,
  dateRange: DateRange,
  comparisonRange: DateRange | null,
  appealIds: string | null,
  fundIds: string | null
): Promise<MetricData> {
  const baseParams: Record<string, string> = {
    startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
    endDate: format(dateRange.endDate, 'yyyy-MM-dd'),
    granularity: 'daily',
    metric
  };

  if (appealIds) baseParams.appealId = appealIds;
  if (fundIds) baseParams.fundId = fundIds;

  const mainResponse = await apiClient.get('recurring-plans', baseParams);
  const mainData: PlanDataPoint[] = (mainResponse?.data?.trendData || []).map((point: any) => ({
    date: point.date,
    value: Number(point.value) || 0
  }));

  let comparisonData: PlanDataPoint[] = [];
  if (comparisonRange) {
    const comparisonParams: Record<string, string> = {
      startDate: format(comparisonRange.startDate, 'yyyy-MM-dd'),
      endDate: format(comparisonRange.endDate, 'yyyy-MM-dd'),
      granularity: 'daily',
      metric
    };

    if (appealIds) comparisonParams.appealId = appealIds;
    if (fundIds) comparisonParams.fundId = fundIds;

    try {
      const compResponse = await apiClient.get('recurring-plans', comparisonParams);
      comparisonData = (compResponse?.data?.trendData || []).map((point: any) => ({
        date: point.date,
        value: Number(point.value) || 0
      }));
    } catch (error) {
      logError(error, 'useRecurringPlansData.fetchComparison');
    }
  }

  const dailyData = mainData.map((point, index) => ({
    ...point,
    comparisonValue: comparisonData[index]?.value,
    comparisonDate: comparisonData[index]?.date
  }));

  const weeklyData = metric === 'active-plans'
    ? aggregateToWeeklyLast(dailyData)
    : aggregateToWeeklySum(dailyData);

  return {
    daily: dailyData,
    weekly: weeklyData
  };
}

/**
 * Custom hook to fetch recurring plans data
 */
export function useRecurringPlansData(
  dateRange: DateRange,
  comparisonRange: DateRange | null,
  appealIds: string | null,
  fundIds: string | null
): RecurringPlansData {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePlans, setActivePlans] = useState<MetricData>({ daily: [], weekly: [] });
  const [newPlans, setNewPlans] = useState<MetricData>({ daily: [], weekly: [] });
  const [canceledPlans, setCanceledPlans] = useState<MetricData>({ daily: [], weekly: [] });

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setIsLoading(true);
      setHasError(false);
      setError(null);

      try {
        // Fetch all three metrics in parallel
        const [activeData, newData, canceledData] = await Promise.all([
          fetchMetricData('active-plans', dateRange, comparisonRange, appealIds, fundIds),
          fetchMetricData('new-plans', dateRange, comparisonRange, appealIds, fundIds),
          fetchMetricData('canceled-plans', dateRange, comparisonRange, appealIds, fundIds)
        ]);

        if (isMounted) {
          setActivePlans(activeData);
          setNewPlans(newData);
          setCanceledPlans(canceledData);
          setIsLoading(false);
        }
      } catch (err) {
        logError(err, 'useRecurringPlansData');
        if (isMounted) {
          setHasError(true);
          setError(err instanceof Error ? err.message : 'Failed to fetch recurring plans data');
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [
    dateRange,
    comparisonRange,
    appealIds,
    fundIds
  ]);

  return {
    activePlans,
    newPlans,
    canceledPlans,
    isLoading,
    hasError,
    error
  };
}
