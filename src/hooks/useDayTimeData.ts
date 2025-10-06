"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { buildDayTimeUrl } from '@/lib/config/phpApi';
import { cachedFetch } from '@/lib/cache/apiCache';
import { logError } from '@/lib/utils/errorHandling';

interface DayTimeRawData {
  day_of_week: number; // 0=Monday, 1=Tuesday, ..., 6=Sunday
  hour_of_day: number; // 0-23
  donation_count: number;
  total_raised: number;
}

interface DayTimeHeatmapCell {
  dayOfWeek: number;
  hourOfDay: number;
  donationCount: number;
  totalRaised: number;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface UseDayTimeDataResult {
  heatmapData: DayTimeHeatmapCell[][];
  isLoading: boolean;
  hasError: boolean;
  error: string | null;
}

// Transform sparse API data into 7x24 grid
function transformToGrid(rawData: DayTimeRawData[]): DayTimeHeatmapCell[][] {
  // Create a 7x24 grid initialized with zeros
  const grid: DayTimeHeatmapCell[][] = [];
  for (let day = 0; day < 7; day++) {
    grid[day] = [];
    for (let hour = 0; hour < 24; hour++) {
      grid[day][hour] = {
        dayOfWeek: day,
        hourOfDay: hour,
        donationCount: 0,
        totalRaised: 0
      };
    }
  }

  // Fill in actual data from API
  rawData.forEach((item) => {
    const day = item.day_of_week;
    const hour = item.hour_of_day;
    if (day >= 0 && day < 7 && hour >= 0 && hour < 24) {
      grid[day][hour] = {
        dayOfWeek: day,
        hourOfDay: hour,
        donationCount: item.donation_count,
        totalRaised: item.total_raised
      };
    }
  });

  return grid;
}

export function useDayTimeData(
  dateRange: DateRange,
  appealIds: string | null,
  fundIds: string | null
): UseDayTimeDataResult {
  const [heatmapData, setHeatmapData] = useState<DayTimeHeatmapCell[][]>([]);
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
        const startDate = format(dateRange.startDate, 'yyyy-MM-dd');
        const endDate = format(dateRange.endDate, 'yyyy-MM-dd');

        const searchParams = new URLSearchParams({
          startDate,
          endDate
        });

        if (appealIds) searchParams.set('appealId', appealIds);
        if (fundIds) searchParams.set('fundId', fundIds);

        const url = buildDayTimeUrl(searchParams);

        const response = await cachedFetch<{ success: boolean; data: { heatmapData: DayTimeRawData[] } }>(
          url,
          undefined,
          { ttl: 5 * 60 * 1000 } // 5 minutes
        );

        if (!isMounted) return;

        const toNum = (v: unknown, fallback = 0): number => {
          if (v === null || v === undefined) return fallback;
          if (typeof v === 'number') return Number.isFinite(v) ? v : fallback;
          if (typeof v === 'string') {
            if (v.trim() === '') return fallback;
            const n = parseFloat(v);
            return Number.isFinite(n) ? n : fallback;
          }
          const n = Number(v);
          return Number.isFinite(n) ? n : fallback;
        };

        const normalizedData = (response.data.heatmapData || []).map((d: any) => ({
          day_of_week: toNum(d.day_of_week, 0),
          hour_of_day: toNum(d.hour_of_day, 0),
          donation_count: toNum(d.donation_count, 0),
          total_raised: toNum(d.total_raised, 0)
        }));

        const grid = transformToGrid(normalizedData);
        setHeatmapData(grid);
        setIsLoading(false);
      } catch (err) {
        logError(err, 'useDayTimeData');
        if (isMounted) {
          setHasError(true);
          setError(err instanceof Error ? err.message : 'Failed to fetch day and time data');
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [dateRange.startDate, dateRange.endDate, appealIds, fundIds]);

  return {
    heatmapData,
    isLoading,
    hasError,
    error
  };
}
