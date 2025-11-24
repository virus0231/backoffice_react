/**
 * Custom hook for fetching website monitoring data
 *
 * Fetches data from the monitoring dashboard API with caching and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { MonitoringDashboardResponse } from '@/types/monitoring';
import { cachedFetch } from '@/lib/cache/apiCache';
import { logError, formatErrorForDisplay } from '@/lib/utils/errorHandling';

interface UseMonitoringDataReturn {
  data: MonitoringDashboardResponse | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Hook to fetch monitoring dashboard data
 * @param autoRefresh - Whether to auto-refresh data (default: false)
 * @param refreshInterval - Refresh interval in ms (default: 60000 = 1 minute)
 */
export function useMonitoringData(
  autoRefresh = false,
  refreshInterval = 60000
): UseMonitoringDataReturn {
  const [data, setData] = useState<MonitoringDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await cachedFetch<MonitoringDashboardResponse>(
        'https://website-uptime-monitor-jet.vercel.app/api/dashboard',
        {},
        {
          ttl: 1 * 60 * 1000, // 1 minute cache
          useLocalStorage: false, // Don't persist to localStorage (real-time data)
          dedupe: true,
        }
      );

      setData(response);
    } catch (err) {
      logError(err, 'Error fetching monitoring data');
      const { message } = formatErrorForDisplay(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    data,
    isLoading,
    error,
    retry: fetchData,
  };
}
