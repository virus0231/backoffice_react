/**
 * Custom hook for fetching individual client monitoring history
 *
 * Fetches 24-hour monitoring data for a specific client with hourly aggregations
 */

import { useState, useEffect, useCallback } from 'react';
import { ClientHistoryResponse } from '@/types/monitoring';
import { cachedFetch } from '@/lib/cache/apiCache';
import { logError, formatErrorForDisplay } from '@/lib/utils/errorHandling';

interface UseClientHistoryReturn {
  data: ClientHistoryResponse | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Hook to fetch monitoring history for a specific client
 * @param clientName - The name of the client/website to fetch history for
 * @param enabled - Whether to fetch data (default: true)
 */
export function useClientHistory(
  clientName: string | null,
  enabled = true
): UseClientHistoryReturn {
  const [data, setData] = useState<ClientHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!clientName || !enabled) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const encodedName = encodeURIComponent(clientName);
      const url = `https://website-uptime-monitor-jet.vercel.app/api/client-history?name=${encodedName}`;

      const response = await cachedFetch<ClientHistoryResponse>(
        url,
        {},
        {
          ttl: 1 * 60 * 1000, // 1 minute cache
          useLocalStorage: false, // Don't persist (real-time data)
          dedupe: true,
        }
      );

      if (!response.success) {
        throw new Error(
          response.error || response.message || 'Failed to fetch client history'
        );
      }

      setData(response);
    } catch (err) {
      logError(err, `Error fetching history for ${clientName}`);
      const { message } = formatErrorForDisplay(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [clientName, enabled]);

  // Fetch data when clientName or enabled changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    retry: fetchData,
  };
}
