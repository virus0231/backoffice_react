'use client';

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FundData {
  date: string;
  amount: number;
  fundName: string;
}

interface FundStats {
  name: string;
  donations: number;
  oneTimeMedian: number;
  recurringMedian: number;
  totalRaised: number;
}

// Mock data for the chart
const generateMockData = (): FundData[] => {
  const data: FundData[] = [];
  const startDate = new Date('2024-09-03');
  const endDate = new Date('2024-10-03');

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];

    if (d >= new Date('2024-09-24')) {
      const amount = Math.random() * 800 + 200;
      data.push({
        date: dateStr,
        amount: amount,
        fundName: 'General fund'
      });
    } else {
      data.push({
        date: dateStr,
        amount: 0,
        fundName: 'General fund'
      });
    }
  }

  return data;
};

// Mock stats data
const mockStats: FundStats[] = [
  {
    name: 'General fund',
    donations: 47,
    oneTimeMedian: 18.26,
    recurringMedian: 52.60,
    totalRaised: 2984.23
  }
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const date = new Date(data.date);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 mb-2">{formattedDate}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-sm text-gray-600">{data.fundName}</span>
          <span className="text-sm font-semibold ml-auto">${data.amount.toFixed(2)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function FundsDashboard() {
  const [granularity, setGranularity] = useState<'daily' | 'weekly'>('daily');
  const chartData = generateMockData();

  // Calculate max value for Y-axis
  const maxValue = Math.max(...chartData.map(d => d.amount));
  const yAxisMax = Math.ceil(maxValue / 500) * 500;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-1">
            <span className="text-gray-400">🎯</span>
            Funds
          </h2>
          <p className="text-sm text-gray-600">Donations shown by the supporter's chosen fund.</p>
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
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fundGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#fundGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Table */}
      <div className="border-t border-gray-200 pt-4">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Fund</th>
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
            {mockStats.map((stat) => (
              <tr key={stat.name} className="border-t border-gray-100">
                <td className="py-3 text-sm text-gray-900 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                  {stat.name}
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
