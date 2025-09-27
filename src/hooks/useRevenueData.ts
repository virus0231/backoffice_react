"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface RevenueDataPoint {
  date: string;
  amount: number;
  count: number;
}

interface RevenueData {
  totalAmount: number;
  totalCount: number;
  chartData: RevenueDataPoint[];
  isLoading: boolean;
  error: string | null;
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

export function useRevenueData(dateRange: DateRange, granularity: 'daily' | 'weekly' = 'daily') {
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

  const fetchData = async (endpoint: string, setData: (data: RevenueData) => void) => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      const params = new URLSearchParams({
        startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
        endDate: format(dateRange.endDate, 'yyyy-MM-dd'),
        granularity: granularity
      });

      const response = await fetch(`/api/analytics/${endpoint}?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint} data`);
      }

      const result: RevenueResponse = await response.json();

      const chartData = result.data.trendData.map(point => ({
        date: point.period,
        amount: point.amount,
        count: point.count
      }));

      setData({
        totalAmount: result.data.totalAmount,
        totalCount: result.data.totalCount,
        chartData,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error(`Error fetching ${endpoint} data:`, error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  useEffect(() => {
    // Fetch all three data sources in parallel
    Promise.all([
      fetchData('total-raised', setTotalRaisedData),
      fetchData('first-installments', setFirstInstallmentsData),
      fetchData('one-time-donations', setOneTimeData)
    ]);
  }, [dateRange.startDate, dateRange.endDate, granularity]);

  return {
    totalRaised: totalRaisedData,
    firstInstallments: firstInstallmentsData,
    oneTime: oneTimeData,
    isLoading: totalRaisedData.isLoading || firstInstallmentsData.isLoading || oneTimeData.isLoading,
    hasError: !!(totalRaisedData.error || firstInstallmentsData.error || oneTimeData.error)
  };
}