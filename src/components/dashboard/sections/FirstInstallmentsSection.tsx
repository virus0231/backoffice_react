"use client";

import React, { useMemo } from 'react';
import ChartWrapper from '@/components/charts/ChartWrapper';
import AreaOverlayChart from '@/components/charts/AreaOverlayChart';
import { overlayByIndex } from '@/lib/utils/comparisonOverlay';
import { useAnalytics } from '@/lib/analytics/useAnalytics';
import type { Granularity } from '@/components/charts/configs/areaChartConfig';
import PercentageChangeBadge from '@/components/charts/PercentageChangeBadge';

interface Props { granularity: Granularity }

export default function FirstInstallmentsSection({ granularity }: Props) {
  const { data, loading, error } = useAnalytics(`/api/v1/analytics/first-installments?granularity=${granularity}`, 'firstInstallments');

  const overlay = useMemo(() => {
    const current = (data?.data?.trendData || data?.current || [])
      .map((p: any) => ({ date: p.date, value: p.amount ?? p.value }))
    const comparison = (data?.data?.comparisonTrend || data?.comparison || [])
      ?.map((p: any) => ({ date: p.date, value: p.amount ?? p.value }))
    return overlayByIndex(current, comparison);
  }, [data]);

  return (
    <ChartWrapper chartId="firstInstallments" title="First Installments" enableComparison>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="text-sm text-slate-500">New Recurring Revenue</div>
          <div className="text-2xl font-semibold">
            {typeof data?.data?.currentPeriod?.totalAmount === 'number'
              ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(data.data.currentPeriod.totalAmount)
              : '—'}
          </div>
          <div className="text-xs text-slate-500">Installments: {data?.data?.currentPeriod?.donationCount ?? '—'}</div>
        </div>
        <div>
          <PercentageChangeBadge
            current={data?.data?.currentPeriod?.totalAmount}
            comparison={data?.data?.comparisonPeriod?.totalAmount}
          />
        </div>
      </div>

      {loading ? (
        <div className="h-full animate-pulse">
          <div className="h-5 w-1/3 bg-slate-200 rounded mb-3" />
          <div className="h-48 w-full bg-slate-100 rounded" />
        </div>
      ) : error ? (
        <div className="h-full flex items-center justify-center text-red-600">{String(error)}</div>
      ) : (
        <AreaOverlayChart data={overlay} granularity={granularity} />
      )}
    </ChartWrapper>
  );
}
