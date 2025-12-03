"use client";

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';
import { logError } from '@/lib/utils/errorHandling';

interface RetentionCohort {
  cohort: string;
  count: number;
  retention: number[]; // Array of 12 retention percentages (0-11 months)
}

interface UseRetentionDataResult {
  retentionData: RetentionCohort[];
  isLoading: boolean;
  hasError: boolean;
  error: string | null;
}

export function useRetentionData(
  appealIds: string | null,
  fundIds: string | null,
  asOf?: string | null
): UseRetentionDataResult {
  const [retentionData, setRetentionData] = useState<RetentionCohort[]>([]);
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
        const params: Record<string, string> = {};

        if (appealIds) params.appealId = appealIds;
        if (fundIds) params.fundId = fundIds;
        if (asOf) params.asOf = asOf;

        const response = await apiClient.get('retention', params);

        if (!isMounted) return;

        const normalizedData = (response.data?.retentionData || []).map((cohort: any) => ({
          cohort: String(cohort.cohort || ''),
          count: typeof cohort.count === 'number' ? cohort.count : 0,
          retention: Array.isArray(cohort.retention) ? cohort.retention.map((r: any) => {
            const val = typeof r === 'number' ? r : parseFloat(r);
            return Number.isFinite(val) ? val : 0;
          }) : []
        }));

        setRetentionData(normalizedData);
        setIsLoading(false);
      } catch (err) {
        logError(err, 'useRetentionData');
        if (isMounted) {
          setHasError(true);
          setError(err instanceof Error ? err.message : 'Failed to fetch retention data');
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [appealIds, fundIds, asOf]);

  return {
    retentionData,
    isLoading,
    hasError,
    error
  };
}
