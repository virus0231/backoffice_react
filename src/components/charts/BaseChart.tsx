"use client";

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import type { OverlayPoint } from '@/lib/utils/comparisonOverlay';

interface BaseChartProps {
  data: OverlayPoint[];
  height?: number;
}

export default function BaseChart({ data, height = 240 }: BaseChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="current" name="Current" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="comparison" name="Comparison" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

