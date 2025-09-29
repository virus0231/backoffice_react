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

export function useRevenueData(
  dateRange: DateRange,
  granularity: 'daily' | 'weekly' = 'daily',
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

  const fetchData = useCallback(async (endpoint: string, setData: Dispatch<SetStateAction<RevenueData>>) => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null, isRetriable: false }));

      // Fetch main data
      const params = new URLSearchParams({
        startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
        endDate: format(dateRange.endDate, 'yyyy-MM-dd'),
        granularity: granularity
      });

      // Add filter parameters if provided
      if (appealId) {
        params.append('appealId', appealId);
      }
      if (fundId) {
        params.append('fundId', fundId);
      }
      if (frequency && frequency !== 'all') {
        params.append('frequency', frequency);
      }

      const mainUrl = buildAnalyticsUrl(endpoint, params);

      // Use cached fetch with 5-minute TTL
      const mainResult: RevenueResponse = await cachedFetch(mainUrl, {}, {
        ttl: 5 * 60 * 1000, // 5 minutes
        useLocalStorage: true,
        dedupe: true
      });

      // Fetch comparison data if comparison range is provided
      let comparisonResult: RevenueResponse | null = null;
      if (comparisonRange) {
        const comparisonParams = new URLSearchParams({
          startDate: format(comparisonRange.startDate, 'yyyy-MM-dd'),
          endDate: format(comparisonRange.endDate, 'yyyy-MM-dd'),
          granularity: granularity
        });

        // Add same filter parameters for comparison
        if (appealId) {
          comparisonParams.append('appealId', appealId);
        }
        if (fundId) {
          comparisonParams.append('fundId', fundId);
        }
        if (frequency && frequency !== 'all') {
          comparisonParams.append('frequency', frequency);
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
          comparisonCount: Number(comparisonPoint?.count || 0)
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
  }, [dateRange.startDate, dateRange.endDate, granularity, appealId, fundId, frequency, comparisonRange]);

  useEffect(() => {
    // Fetch all three data sources in parallel
    Promise.all([
      fetchData('total-raised', setTotalRaisedData),
      fetchData('first-installments', setFirstInstallmentsData),
      fetchData('one-time-donations', setOneTimeData)
    ]);
  }, [dateRange.startDate, dateRange.endDate, granularity, comparisonRange?.startDate, comparisonRange?.endDate, appealId, fundId, frequency, fetchData]);

  const retry = useCallback(() => {
    Promise.all([
      fetchData('total-raised', setTotalRaisedData),
      fetchData('first-installments', setFirstInstallmentsData),
      fetchData('one-time-donations', setOneTimeData)
    ]);
  }, [fetchData]);

  return {
    totalRaised: totalRaisedData,
    firstInstallments: firstInstallmentsData,
    oneTime: oneTimeData,
    isLoading: totalRaisedData.isLoading || firstInstallmentsData.isLoading || oneTimeData.isLoading,
    hasError: !!(totalRaisedData.error || firstInstallmentsData.error || oneTimeData.error),
    retry
  };
}
