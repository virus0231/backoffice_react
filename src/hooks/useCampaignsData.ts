"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import apiClient from '@/lib/api/client';
import { logError } from '@/lib/utils/errorHandling';

interface CampaignRawData {
  appeal_id: number;
  appeal_name: string;
  donation_count: number | null;
  total_raised: number | null;
}

interface CampaignStats {
  appealId: number;
  appealName: string;
  donations: number;
  totalRaised: number;
}

interface CampaignChartDataPoint {
  date: string;
  appeal_id: number;
  appeal_name: string;
  amount: number;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface UseCampaignsDataResult {
  chartData: { [key: string]: any }[];
  tableData: CampaignStats[];
  isLoading: boolean;
  hasError: boolean;
  error: string | null;
}

function processTableData(rawData: CampaignRawData[]): CampaignStats[] {
  return rawData
    .map((r) => ({
      appealId: r.appeal_id,
      appealName: r.appeal_name,
      donations: typeof r.donation_count === 'number' ? r.donation_count : 0,
      totalRaised: typeof r.total_raised === 'number' ? r.total_raised : 0,
    }))
    .sort((a, b) => b.totalRaised - a.totalRaised);
}

function transformChartData(rawChartData: CampaignChartDataPoint[]): { [key: string]: any }[] {
  const grouped = rawChartData.reduce((acc, row) => {
    const date = row.date;
    if (!acc[date]) {
      acc[date] = { date };
    }
    acc[date][`appeal_${row.appeal_id}`] = row.amount;
    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
}

export function useCampaignsData(
  dateRange: DateRange,
  granularity: 'daily' | 'weekly',
  appealIds: string | null
): UseCampaignsDataResult {
  const [chartData, setChartData] = useState<{ [key: string]: any }[]>([]);
  const [tableData, setTableData] = useState<CampaignStats[]>([]);
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

        const chartParams: Record<string, string> = {
          startDate,
          endDate,
          granularity,
          metric: 'chart'
        };
        if (appealIds) chartParams.appealId = appealIds;

        const tableParams: Record<string, string> = {
          startDate,
          endDate,
          metric: 'table'
        };
        if (appealIds) tableParams.appealId = appealIds;

        const [chartResponse, tableResponse] = await Promise.all([
          apiClient.get('funds', chartParams),
          apiClient.get('funds', tableParams)
        ]);

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

          const transformedChartData = transformChartData(
          (chartResponse.data?.chartData || []).map((d: any) => ({
            date: String(d.date || ''),
            appeal_id: toNum(d.appeal_id, 0),
            appeal_name: String(d.appeal_name || ''),
            amount: toNum(d.amount, 0)
          }))
        );

        const processedTableData = processTableData(
          (tableResponse.data?.tableData || []).map((r: any) => ({
            appeal_id: toNum(r.appeal_id, 0),
            appeal_name: String(r.appeal_name || ''),
            donation_count: r.donation_count === null ? 0 : toNum(r.donation_count, 0),
            total_raised: r.total_raised === null ? 0 : toNum(r.total_raised, 0),
          }))
        );

        setChartData(transformedChartData);
        setTableData(processedTableData);
        setIsLoading(false);
      } catch (err) {
        logError(err, 'useCampaignsData');
        if (isMounted) {
          setHasError(true);
          setError(err instanceof Error ? err.message : 'Failed to fetch campaigns data');
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [dateRange.startDate, dateRange.endDate, granularity, appealIds]);

  return {
    chartData,
    tableData,
    isLoading,
    hasError,
    error
  };
}
