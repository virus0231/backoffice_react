"use client";

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import type { OverlayPoint } from '@/lib/utils/comparisonOverlay';
import { areaGradientIds, chartColors } from '@/components/charts/configs/areaChartConfig';
import type { Granularity } from '@/components/charts/configs/areaChartConfig';
import { format as fmt } from 'date-fns';

interface AreaOverlayChartProps {
  data: OverlayPoint[];
  height?: number;
  granularity?: Granularity;
}

export default function AreaOverlayChart({ data, height = 240, granularity = 'daily' }: AreaOverlayChartProps) {
  const tickFormatter = (value: any) => {
    try {
      const d = new Date(value);
      if (granularity === 'weekly') {
        return `Wk of ${fmt(d, 'yyyy-MM-dd')}`;
      }
      return fmt(d, 'MM-dd');
    } catch {
      return String(value);
    }
  };
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <defs>
            <linearGradient id={areaGradientIds.primary} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColors.primary.fillFrom} />
              <stop offset="95%" stopColor={chartColors.primary.fillTo} />
            </linearGradient>
            <linearGradient id={areaGradientIds.comparison} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColors.comparison.fillFrom} />
              <stop offset="95%" stopColor={chartColors.comparison.fillTo} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={tickFormatter} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip wrapperStyle={{ outline: 'none' }} cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4' }} />
          <Legend />
          <Area type="monotone" dataKey="current" name="Current" stroke={chartColors.primary.stroke} strokeWidth={2} activeDot={{ r: 4 }} isAnimationActive fill={`url(#${areaGradientIds.primary})`} />
          <Area type="monotone" dataKey="comparison" name="Comparison" stroke={chartColors.comparison.stroke} strokeWidth={2} strokeDasharray="5 5" activeDot={{ r: 3 }} isAnimationActive fill={`url(#${areaGradientIds.comparison})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
