'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DateRangePicker from "@/components/filters/DateRangePicker";
import { DateRange } from "@/types/filters";
import { useFilterContext } from "@/providers/FilterProvider";
import { useFundsData } from "@/hooks/useFundsData";
import LoadingState from "@/components/common/LoadingState";
import ChartErrorFallback from "@/components/common/ChartErrorFallback";

// Color palette for funds
const FUND_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#ef4444', // red
  '#14b8a6', // teal
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const date = new Date(label);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Sort by value descending and take top entries with non-zero values
    const sortedPayload = [...payload]
      .filter((entry: any) => entry.value > 0)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10);

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

export default function FundsDashboard() {
  // Get global filter context
  const {
    dateRange: globalDateRange,
    isHydrated,
    selectedAppeals
  } = useFilterContext();

  // Local state for date range override
  const [localDateRange, setLocalDateRange] = useState<DateRange | null>(null);
  const [granularity, setGranularity] = useState<'daily' | 'weekly'>('daily');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use local date range if set, otherwise use global
  const effectiveDateRange = localDateRange || globalDateRange;

  // Fetch real data from API
  const appealIds = selectedAppeals.length > 0 ? selectedAppeals.map(a => a.id).join(',') : null;

  const { chartData, tableData, isLoading, hasError, error } = useFundsData(
    effectiveDateRange,
    granularity,
    appealIds
  );

  // Pagination
  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = tableData.slice(startIndex, endIndex);

  // Create fund configuration from paginated data for chart
  const fundConfig = paginatedData.map((fund, index) => ({
    fundId: fund.fundId,
    fundName: fund.fundName,
    appealName: fund.appealName,
    color: FUND_COLORS[(startIndex + index) % FUND_COLORS.length],
    total: fund.totalRaised
  }));

  // Filter chart data to only include current page funds
  const currentFundIds = paginatedData.map(f => `fund_${f.fundId}`);
  const filteredChartData = chartData.map(dataPoint => {
    const filtered: any = { date: dataPoint.date };
    currentFundIds.forEach(fundKey => {
      filtered[fundKey] = dataPoint[fundKey] || 0;
    });
    return filtered;
  });

  // Show loading state
  if (!isHydrated || isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <LoadingState size="lg" message="Loading funds data..." fullHeight />
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ChartErrorFallback
          error={new Error(error || "Failed to load funds data")}
          resetError={() => window.location.reload()}
          title="Failed to load funds data"
        />
      </div>
    );
  }

  // Calculate max value for Y-axis from filtered data
  const maxValue = Math.max(
    ...filteredChartData.flatMap(d =>
      Object.keys(d)
        .filter(k => k.startsWith('fund_'))
        .map(k => d[k])
    ),
    0
  );
  // Use dynamic scaling based on actual data
  const yAxisMax = maxValue <= 10 ? Math.ceil(maxValue) :
                   maxValue <= 50 ? Math.ceil(maxValue / 10) * 10 :
                   maxValue <= 100 ? Math.ceil(maxValue / 10) * 10 :
                   maxValue <= 500 ? Math.ceil(maxValue / 50) * 50 :
                   Math.ceil(maxValue / 100) * 100;

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
          <DateRangePicker
            value={effectiveDateRange}
            onChange={(range) => setLocalDateRange(range)}
          />
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
            key={`funds-chart-page-${currentPage}`}
            data={filteredChartData}
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
              domain={[0, 'auto']}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            {fundConfig.map((fund) => (
              <Line
                key={fund.fundId}
                type="monotone"
                dataKey={`fund_${fund.fundId}`}
                stroke={fund.color}
                strokeWidth={2}
                dot={false}
                name={fund.fundName}
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
              <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Fund</th>
              <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Appeal</th>
              <th className="pb-3 text-xs font-medium text-gray-500 uppercase text-right">Donations</th>
              <th className="pb-3 text-xs font-medium text-gray-500 uppercase text-right">
                Average donation
              </th>
              <th className="pb-3 text-xs font-medium text-gray-500 uppercase text-right">Total raised</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((stat, index) => {
              const globalIndex = startIndex + index;
              const color = FUND_COLORS[globalIndex % FUND_COLORS.length];
              return (
                <tr key={stat.fundId} className="border-t border-gray-100">
                  <td className="py-3 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></div>
                      {stat.fundName}
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {stat.appealName || '-'}
                  </td>
                  <td className="py-3 text-sm text-gray-900 text-right">{stat.donations}</td>
                  <td className="py-3 text-sm text-gray-900 text-right">${((stat.totalRaised || 0) / (stat.donations || 1)).toFixed(2)}</td>
                  <td className="py-3 text-sm font-semibold text-gray-900 text-right">
                    ${stat.totalRaised.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, tableData.length)} of {tableData.length} funds
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
