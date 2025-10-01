"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { buildRecurringPlansUrl } from '@/lib/config/phpApi';
import { safeFetch, parseAPIResponse, logError } from '@/lib/utils/errorHandling';
import { cachedFetch } from '@/lib/cache/apiCache';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface PlanDataPoint {
  date: string;
  value: number;
  comparisonValue?: number;
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
 * Aggregate daily data to weekly on the frontend
 */
function aggregateToWeekly(dailyData: PlanDataPoint[]): PlanDataPoint[] {
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
        comparisonValue: point.comparisonValue !== undefined ? 0 : undefined
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
 * Fetch recurring plans data for a specific metric
 */
async function fetchMetricData(
  metric: string,
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

  const mainUrl = buildRecurringPlansUrl(metric, searchParams);

  // Fetch main period data
  const mainResponse = await cachedFetch<RecurringPlansResponse>(mainUrl, {
    ttl: 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate: 10 * 60 * 1000
  });

  const mainData: PlanDataPoint[] = mainResponse.data.trendData.map(point => ({
    date: point.date,
    value: point.value
  }));

  // Fetch comparison period data if requested
  let comparisonData: PlanDataPoint[] = [];
  if (comparisonRange) {
    const compSearchParams = new URLSearchParams({
      startDate: format(comparisonRange.startDate, 'yyyy-MM-dd'),
      endDate: format(comparisonRange.endDate, 'yyyy-MM-dd'),
      granularity: 'daily'
    });

    if (appealIds) compSearchParams.set('appealId', appealIds);
    if (fundIds) compSearchParams.set('fundId', fundIds);

    const compUrl = buildRecurringPlansUrl(metric, compSearchParams);

    try {
      const compResponse = await cachedFetch<RecurringPlansResponse>(compUrl, {
        ttl: 5 * 60 * 1000,
        staleWhileRevalidate: 10 * 60 * 1000
      });

      comparisonData = compResponse.data.trendData.map(point => ({
        date: point.date,
        value: point.value
      }));
    } catch (error) {
      logError(error, 'useRecurringPlansData.fetchComparison');
    }
  }

  // Merge comparison data into main data
  const dailyData = mainData.map((point, index) => ({
    ...point,
    comparisonValue: comparisonData[index]?.value
  }));

  // Generate weekly aggregation
  const weeklyData = aggregateToWeekly(dailyData);

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
    dateRange.startDate,
    dateRange.endDate,
    comparisonRange?.startDate,
    comparisonRange?.endDate,
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
