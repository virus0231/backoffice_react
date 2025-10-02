"use client";

import React from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface SimpleLineChartProps {
  data: Array<{ date: string; value: number; comparisonValue?: number; comparisonDate?: string }>;
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
  // Check if comparison data exists
  const hasComparison = data.some(point => point.comparisonValue !== undefined);

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
          return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        } catch {
          return dateStr;
        }
      };

      // Calculate percentage change if comparison exists
      let percentageChange = null;
      if (data.comparisonValue !== undefined && data.comparisonValue > 0) {
        const change = ((data.value - data.comparisonValue) / data.comparisonValue) * 100;
        percentageChange = change.toFixed(1);
      }

      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px]">
          {/* Current Period */}
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Current Period</div>
            <div className="text-xs text-gray-700 mb-1">{formatDate(data.date)}</div>
            <div className="text-lg font-bold text-blue-600">{data.value.toLocaleString()}</div>
          </div>

          {/* Comparison Period */}
          {data.comparisonValue !== undefined && (
            <>
              <div className="border-t border-gray-200 pt-3">
                <div className="text-xs text-gray-500 mb-1">Comparison Period</div>
                <div className="text-xs text-gray-700 mb-1">
                  {data.comparisonDate ? formatDate(data.comparisonDate) : formatDate(data.date)}
                </div>
                <div className="text-lg font-bold text-gray-500">{data.comparisonValue.toLocaleString()}</div>
              </div>

              {/* Change Percentage */}
              {percentageChange !== null && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500">Change:</div>
                  <div className={`text-sm font-semibold ${
                    parseFloat(percentageChange) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {parseFloat(percentageChange) >= 0 ? '+' : ''}{percentageChange}%
                  </div>
                </div>
              )}
            </>
          )}
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
          <linearGradient id={`gradient-comparison`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#9ca3af" stopOpacity={0.02} />
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
        {hasComparison && (
          <Area
            type="monotone"
            dataKey="comparisonValue"
            stroke="#9ca3af"
            strokeWidth={1.5}
            strokeOpacity={0.5}
            fill={`url(#gradient-comparison)`}
            dot={false}
          />
        )}
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
