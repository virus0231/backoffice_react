"use client";

import React from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface SimpleLineChartProps {
  data: Array<{ date: string; value: number }>;
  color?: string;
  height?: number;
  showAxes?: boolean;
}

export default function SimpleLineChart({
  data,
  color = "#3b82f6",
  height = 120,
  showAxes = false
}: SimpleLineChartProps) {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      // Format the date
      const formatDate = (dateStr: string) => {
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            return dateStr;
          }
          return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        } catch {
          return dateStr;
        }
      };

      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[140px]">
          <div className="text-xs text-gray-600 mb-1">
            {formatDate(data.date)}
          </div>
          <div className="text-lg font-bold text-gray-900">
            {data.value}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        {showAxes && (
          <>
            <XAxis
              dataKey="date"
              hide={!showAxes}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickFormatter={(value) => {
                try {
                  const date = new Date(value);
                  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                } catch {
                  return value;
                }
              }}
            />
            <YAxis hide />
          </>
        )}
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${color})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
