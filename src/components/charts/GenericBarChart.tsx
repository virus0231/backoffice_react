"use client";

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

type BarSeries = {
  key: string;
  name?: string;
  color?: string;
  stackId?: string;
};

interface GenericBarChartProps {
  data: any[];
  xKey: string;
  ySeries: BarSeries[];
  height?: number;
  horizontal?: boolean;
  grid?: boolean;
}

export default function GenericBarChart({
  data,
  xKey,
  ySeries,
  height = 260,
  horizontal = false,
  grid = true,
}: GenericBarChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
        >
          {grid && <CartesianGrid strokeDasharray="3 3" />}
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey={xKey} width={100} tick={{ fontSize: 12 }} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
            </>
          )}
          <Tooltip wrapperStyle={{ outline: 'none' }} />
          <Legend />
          {ySeries.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name || s.key}
              fill={s.color || '#3b82f6'}
              radius={4}
              stackId={s.stackId}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

