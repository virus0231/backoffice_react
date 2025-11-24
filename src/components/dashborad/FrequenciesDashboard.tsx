"use client";

import { useState } from "react";
import DateRangePicker from "@/components/filters/DateRangePicker";
import type { DateRange } from "@/types/filters";
import { useFilterContext } from "@/providers/FilterProvider";
import { useFrequenciesData } from "@/hooks/useFrequenciesData";
import LoadingState from "@/components/common/LoadingState";
import ChartErrorFallback from "@/components/common/ChartErrorFallback";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Frequency types with their colors (matching database values)
const FREQUENCIES = [
  { key: 'monthly', label: 'Monthly', color: '#8b5cf6' },
  { key: 'one_time', label: 'One-time', color: '#6366f1' },
  { key: 'yearly', label: 'Yearly', color: '#ec4899' },
  { key: 'weekly', label: 'Weekly', color: '#14b8a6' },
  { key: 'daily', label: 'Daily', color: '#06b6d4' },
];

interface FrequencyData {
  frequency: string;
  donations: number;
  totalRaised: number;
}

export default function FrequenciesDashboard() {
  // Get global filter context
  const {
    dateRange: globalDateRange,
    isHydrated,
    selectedAppeals,
    selectedFunds
  } = useFilterContext();

  // Local state for date range override
  const [localDateRange, setLocalDateRange] = useState<DateRange | null>(null);
  const [granularity, setGranularity] = useState<"daily" | "weekly">("daily");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use local date range if set, otherwise use global
  const effectiveDateRange = localDateRange || globalDateRange;

  // Fetch real data from API
  const appealIds = selectedAppeals.length > 0 ? selectedAppeals.map(a => a.id).join(',') : null;
  const fundIds = selectedFunds.length > 0 ? selectedFunds.map(f => f.id).join(',') : null;

  const {
    chartData,
    tableData,
    isLoading,
    hasError,
    error
  } = useFrequenciesData(
    effectiveDateRange,
    appealIds,
    fundIds
  );

  // Pagination
  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = tableData.slice(startIndex, endIndex);

  // Calculate legend totals from paginated data only
  const paginatedFrequencies = paginatedData.map(d => d.frequency.toLowerCase());
  const visibleFrequencies = FREQUENCIES.filter(freq =>
    paginatedFrequencies.includes(freq.label.toLowerCase())
  );

  const legendTotals = visibleFrequencies.map(freq => {
    const total = tableData.find(d => d.frequency.toLowerCase() === freq.label.toLowerCase())?.totalRaised || 0;
    return { ...freq, total };
  });

  // Filter chart data to only include visible frequency keys
  const visibleKeys = visibleFrequencies.map(f => f.key);
  const filteredChartData = chartData.map(dataPoint => {
    const filtered: any = { date: dataPoint.date };
    visibleKeys.forEach(key => {
      filtered[key] = dataPoint[key as keyof typeof dataPoint] || 0;
    });
    return filtered;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Sort payload by value in descending order
      const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px]">
          <div className="text-sm font-medium text-gray-900 mb-2">{label}</div>
          {sortedPayload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs mb-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-gray-700">{entry.name}</span>
              </div>
              <span className="font-medium text-gray-900">${entry.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Show loading state
  if (!isHydrated || isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState size="lg" message="Loading frequencies data..." fullHeight />
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className="space-y-6">
        <ChartErrorFallback
          error={new Error(error || "Failed to load frequencies data")}
          resetError={() => window.location.reload()}
          title="Failed to load frequencies data"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequencies</h2>
          <p className="text-sm text-gray-600 mt-1">Donations shown by frequency.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            value={effectiveDateRange}
            onChange={(range) => setLocalDateRange(range)}
          />
          <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
            <button
              onClick={() => setGranularity("daily")}
              className={`px-3 py-1 text-xs rounded transition-all ${
                granularity === "daily"
                  ? "bg-white text-gray-900 shadow-sm font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setGranularity("weekly")}
              className={`px-3 py-1 text-xs rounded transition-all ${
                granularity === "weekly"
                  ? "bg-white text-gray-900 shadow-sm font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Weekly
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart key={`frequencies-chart-page-${currentPage}`} data={filteredChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
                domain={[0, 'auto']}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                content={() => (
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-6 px-4">
                    {legendTotals.map((freq) => (
                      <div key={freq.key} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: freq.color }}></div>
                        <span className="text-xs text-gray-700">{freq.label}</span>
                        <span className="text-xs font-medium text-gray-900">${freq.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
              {visibleFrequencies.map((freq) => (
                <Line
                  key={freq.key}
                  type="monotone"
                  dataKey={freq.key}
                  stroke={freq.color}
                  strokeWidth={2}
                  dot={false}
                  name={freq.label}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Donation frequency
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Donations
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Average donation
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Total raised
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((row, index) => {
              const freq = FREQUENCIES.find(f => f.label.toLowerCase() === row.frequency.toLowerCase());
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: freq?.color || '#gray' }}></div>
                      <span className="text-sm text-gray-900">{row.frequency}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {row.donations}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    ${((row.totalRaised || 0) / (row.donations || 1)).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    ${row.totalRaised.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              Showing {startIndex + 1}-{Math.min(endIndex, tableData.length)} of {tableData.length} frequencies
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
