'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as flags from 'country-flag-icons/react/3x2';
import DateRangePicker from "@/components/filters/DateRangePicker";
import { DateRange } from "@/types/filters";
import { useFilterContext } from "@/providers/FilterProvider";
import { useCountriesData } from "@/hooks/useCountriesData";
import LoadingState from "@/components/common/LoadingState";
import ChartErrorFallback from "@/components/common/ChartErrorFallback";
import { getISO2Code, getCountryName, getCountryColor } from "@/lib/utils/countryMapping";

// Helper function to get Flag component
const getFlagComponent = (countryCode: string) => {
  const iso2 = getISO2Code(countryCode);
  if (!iso2) return null;

  // Check if flag exists in library
  try {
    const FlagComponent = (flags as any)[iso2];
    return FlagComponent || null;
  } catch {
    return null;
  }
};

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
          {sortedPayload.map((entry: any, index: number) => {
            const FlagComponent = getFlagComponent(entry.name);

            return (
              <div key={index} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  {FlagComponent ? (
                    <FlagComponent className="w-5 h-4 flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-4 flex-shrink-0 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                      <span className="text-[8px] text-gray-500 font-medium">{getISO2Code(entry.name)}</span>
                    </div>
                  )}
                  <span className="text-sm text-gray-600 truncate">{getCountryName(entry.name)}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                  ${entry.value.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function CountriesDashboard() {
  // Get global filter context
  const {
    dateRange: globalDateRange,
    isHydrated,
    selectedAppeals,
    selectedFunds
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
  const fundIds = selectedFunds.length > 0 ? selectedFunds.map(f => f.id).join(',') : null;

  const { chartData, tableData, isLoading, hasError, error } = useCountriesData(
    effectiveDateRange,
    granularity,
    appealIds,
    fundIds
  );

  // Show loading state
  if (!isHydrated || isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <LoadingState size="lg" message="Loading countries data..." fullHeight />
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ChartErrorFallback
          error={new Error(error || "Failed to load countries data")}
          resetError={() => window.location.reload()}
          title="Failed to load countries data"
        />
      </div>
    );
  }

  // Pagination
  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStats = tableData.slice(startIndex, endIndex);

  // Calculate max value for Y-axis based on current page countries
  const currentCountryCodes = currentStats.map(s => s.countryCode);
  const allValues = chartData.flatMap(d =>
    Object.entries(d)
      .filter(([key]) => key !== 'date' && currentCountryCodes.includes(key))
      .map(([, value]) => value as number)
  );
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 1000;
  const yAxisMax = Math.ceil(maxValue / 1000) * 1000 || 1000;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-1">
            <span className="text-gray-400">🌍</span>
            Countries
          </h2>
          <p className="text-sm text-gray-600">Donations shown by geolocation.</p>
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
            {currentStats.map((country) => (
              <Line
                key={country.countryCode}
                type="monotone"
                dataKey={country.countryCode}
                stroke={getCountryColor(country.countryCode)}
                strokeWidth={2}
                dot={false}
                name={country.countryCode}
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
              <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Country</th>
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
            {currentStats.map((stat, index) => {
              const FlagComponent = getFlagComponent(stat.countryCode);
              const countryName = getCountryName(stat.countryCode);

              return (
                <tr key={`${stat.countryCode}-${startIndex + index}`} className="border-t border-gray-100">
                  <td className="py-3 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: getCountryColor(stat.countryCode) }}
                      ></div>
                      {FlagComponent ? (
                        <FlagComponent className="w-5 h-4 flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-4 flex-shrink-0 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                          <span className="text-[8px] text-gray-500 font-medium">{getISO2Code(stat.countryCode)}</span>
                        </div>
                      )}
                      <span>{countryName}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-900 text-right">{stat.donations}</td>
                  <td className="py-3 text-sm text-gray-900 text-right">${stat.oneTimeMedian.toFixed(2)}</td>
                  <td className="py-3 text-sm text-gray-900 text-right">${stat.recurringMedian.toFixed(2)}</td>
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
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                      currentPage === page
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{tableData.length} records</span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
