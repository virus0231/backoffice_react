'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TributeChartData {
  date: string;
  [tribute: string]: number | string;
}

interface TributeStats {
  tribute: string;
  color: string;
  donations: number;
  oneTimeMedian: number;
  recurringMedian: number;
  totalRaised: number;
}

// Tribute colors for the chart
const TRIBUTE_COLORS: { [key: string]: string } = {
  'Not selected': '#3b82f6',
  'In memory': '#a855f7',
  'In honor': '#ef4444',
};

// Mock data generator
const generateMockData = (): { chartData: TributeChartData[], stats: TributeStats[] } => {
  const tributes: TributeStats[] = [
    { tribute: 'Not selected', color: '#3b82f6', donations: 50, oneTimeMedian: 30.00, recurringMedian: 42.00, totalRaised: 6425.30 },
    { tribute: 'In memory', color: '#a855f7', donations: 6, oneTimeMedian: 1250.28, recurringMedian: 11.80, totalRaised: 1385.28 },
    { tribute: 'In honor', color: '#ef4444', donations: 4, oneTimeMedian: 57.10, recurringMedian: 36.90, totalRaised: 188.00 },
  ];

  // Generate chart data
  const chartData: TributeChartData[] = [];
  const startDate = new Date('2024-09-03');
  const endDate = new Date('2024-10-03');

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dataPoint: TributeChartData = { date: dateStr };

    tributes.forEach(t => {
      // Generate random data with some variance
      const baseAmount = t.totalRaised / 30;
      dataPoint[t.tribute] = Math.random() * baseAmount * 3;
    });

    chartData.push(dataPoint);
  }

  return {
    chartData,
    stats: tributes
  };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const date = new Date(label);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Sort by value descending and take entries with non-zero values
    const sortedPayload = [...payload]
      .filter((entry: any) => entry.value > 0)
      .sort((a: any, b: any) => b.value - a.value);

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
        <p className="text-sm font-medium text-gray-900 mb-2">{formattedDate}</p>
        <div className="space-y-1.5">
          {sortedPayload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm text-gray-600 truncate">{entry.name}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                ${entry.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function TributesDashboard() {
  const [granularity, setGranularity] = useState<'daily' | 'weekly'>('daily');

  const { chartData, stats } = generateMockData();

  // Calculate max value for Y-axis
  const allValues = chartData.flatMap(d =>
    Object.entries(d)
      .filter(([key]) => key !== 'date')
      .map(([, value]) => value as number)
  );
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 1000;
  const yAxisMax = Math.ceil(maxValue / 1000) * 1000;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-1">
            <span className="text-gray-400">❤️</span>
            Tributes
          </h2>
          <p className="text-sm text-gray-600">Dedicated donations shown by tribute type.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Daily/Weekly Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setGranularity('daily')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                granularity === 'daily'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setGranularity('weekly')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                granularity === 'weekly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              domain={[0, yAxisMax]}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            {stats.map((tribute, index) => (
              <Line
                key={`${tribute.tribute}-${index}`}
                type="monotone"
                dataKey={tribute.tribute}
                stroke={tribute.color}
                strokeWidth={2}
                dot={false}
                name={tribute.tribute}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Table */}
      <div className="border-t border-gray-200 pt-4">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Tribute</th>
              <th className="pb-3 text-xs font-medium text-gray-500 uppercase text-right">Donations</th>
              <th className="pb-3 text-xs font-medium text-gray-500 uppercase text-right">
                One-time <span className="text-blue-600 underline decoration-dotted cursor-help">median</span>
              </th>
              <th className="pb-3 text-xs font-medium text-gray-500 uppercase text-right">
                Recurring <span className="text-blue-600 underline decoration-dotted cursor-help">median</span>
              </th>
              <th className="pb-3 text-xs font-medium text-gray-500 uppercase text-right">Total raised</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, index) => (
              <tr key={`${stat.tribute}-${index}`} className="border-t border-gray-100">
                <td className="py-3 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: stat.color }}
                    ></div>
                    <span>{stat.tribute}</span>
                  </div>
                </td>
                <td className="py-3 text-sm text-gray-900 text-right">{stat.donations}</td>
                <td className="py-3 text-sm text-gray-900 text-right">${stat.oneTimeMedian.toFixed(2)}</td>
                <td className="py-3 text-sm text-gray-900 text-right">${stat.recurringMedian.toFixed(2)}</td>
                <td className="py-3 text-sm font-semibold text-gray-900 text-right">
                  ${stat.totalRaised.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
