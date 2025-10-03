'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as flags from 'country-flag-icons/react/3x2';

interface CountryChartData {
  date: string;
  [country: string]: number | string;
}

interface CountryStats {
  country: string;
  countryCode: string;
  donations: number;
  oneTimeMedian: number;
  recurringMedian: number;
  totalRaised: number;
}

// Country colors for the chart
const COUNTRY_COLORS: { [key: string]: string } = {
  'United Kingdom': '#3b82f6',
  'Ireland': '#10b981',
  'United States of America': '#ef4444',
  'Austria': '#ec4899',
  'Singapore': '#f97316',
  'Germany': '#eab308',
  'Canada': '#06b6d4',
  'Mexico': '#8b5cf6',
  'Saudi Arabia': '#14b8a6',
  'Netherlands': '#f59e0b',
  'Egypt': '#a855f7',
  'United Arab Emirates': '#3b82f6',
  'Sweden': '#10b981',
  'New Zealand': '#6366f1',
  'Pakistan': '#22c55e',
  'Australia': '#8b5cf6',
  'Turkey': '#ef4444',
  'Oman': '#f97316',
  'France': '#ec4899',
};

// Country code mapping
const COUNTRY_CODES: { [key: string]: string } = {
  'United Kingdom': 'GB',
  'Ireland': 'IE',
  'United States of America': 'US',
  'Austria': 'AT',
  'Singapore': 'SG',
  'Germany': 'DE',
  'Canada': 'CA',
  'Mexico': 'MX',
  'Saudi Arabia': 'SA',
  'Netherlands': 'NL',
  'Egypt': 'EG',
  'United Arab Emirates': 'AE',
  'Sweden': 'SE',
  'New Zealand': 'NZ',
  'Pakistan': 'PK',
  'Australia': 'AU',
  'Turkey': 'TR',
  'Oman': 'OM',
  'France': 'FR',
};

// Mock data generator
const generateMockData = (): { chartData: CountryChartData[], stats: CountryStats[] } => {
  const countries: CountryStats[] = [
    { country: 'United Kingdom', countryCode: 'GB', donations: 400, oneTimeMedian: 21.20, recurringMedian: 12.80, totalRaised: 25363.31 },
    { country: 'Ireland', countryCode: 'IE', donations: 17, oneTimeMedian: 27.36, recurringMedian: 54.39, totalRaised: 947.27 },
    { country: 'United States of America', countryCode: 'US', donations: 18, oneTimeMedian: 19.23, recurringMedian: 7.82, totalRaised: 682.76 },
    { country: 'Austria', countryCode: 'AT', donations: 1, oneTimeMedian: 628.93, recurringMedian: 0.00, totalRaised: 628.93 },
    { country: 'Singapore', countryCode: 'SG', donations: 1, oneTimeMedian: 102.14, recurringMedian: 0.00, totalRaised: 102.14 },
    { country: 'Germany', countryCode: 'DE', donations: 1, oneTimeMedian: 0.00, recurringMedian: 89.30, totalRaised: 89.30 },
    { country: 'Canada', countryCode: 'CA', donations: 10, oneTimeMedian: 4.42, recurringMedian: 14.07, totalRaised: 88.64 },
    { country: 'Mexico', countryCode: 'MX', donations: 1, oneTimeMedian: 0.00, recurringMedian: 78.02, totalRaised: 78.02 },
    { country: 'Saudi Arabia', countryCode: 'SA', donations: 2, oneTimeMedian: 10.00, recurringMedian: 51.04, totalRaised: 61.04 },
    { country: 'Netherlands', countryCode: 'NL', donations: 1, oneTimeMedian: 0.00, recurringMedian: 27.43, totalRaised: 27.43 },
    { country: 'Egypt', countryCode: 'EG', donations: 2, oneTimeMedian: 0.00, recurringMedian: 12.10, totalRaised: 24.20 },
    { country: 'United Arab Emirates', countryCode: 'AE', donations: 2, oneTimeMedian: 10.70, recurringMedian: 0.00, totalRaised: 21.40 },
    { country: 'Sweden', countryCode: 'SE', donations: 2, oneTimeMedian: 4.33, recurringMedian: 15.85, totalRaised: 20.18 },
    { country: 'New Zealand', countryCode: 'NZ', donations: 1, oneTimeMedian: 0.00, recurringMedian: 17.22, totalRaised: 17.22 },
    { country: 'Pakistan', countryCode: 'PK', donations: 1, oneTimeMedian: 16.52, recurringMedian: 0.00, totalRaised: 16.52 },
    { country: 'Australia', countryCode: 'AU', donations: 1, oneTimeMedian: 0.00, recurringMedian: 15.43, totalRaised: 15.43 },
    { country: 'Turkey', countryCode: 'TR', donations: 1, oneTimeMedian: 0.00, recurringMedian: 13.85, totalRaised: 13.85 },
    { country: 'Oman', countryCode: 'OM', donations: 1, oneTimeMedian: 10.70, recurringMedian: 0.00, totalRaised: 10.70 },
    { country: 'France', countryCode: 'FR', donations: 1, oneTimeMedian: 9.23, recurringMedian: 0.00, totalRaised: 9.23 },
  ];

  // Generate chart data
  const chartData: CountryChartData[] = [];
  const startDate = new Date('2024-09-03');
  const endDate = new Date('2024-10-03');

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dataPoint: CountryChartData = { date: dateStr };

    countries.forEach(c => {
      // Generate random data with some variance
      const baseAmount = c.totalRaised / 30;
      dataPoint[c.country] = Math.random() * baseAmount * 2;
    });

    chartData.push(dataPoint);
  }

  return {
    chartData,
    stats: countries
  };
};

// Helper function to get Flag component
const getFlagComponent = (countryCode: string) => {
  const FlagComponent = (flags as any)[countryCode];
  return FlagComponent;
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
            const countryCode = COUNTRY_CODES[entry.name];
            const FlagComponent = countryCode ? getFlagComponent(countryCode) : null;

            return (
              <div key={index} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  {FlagComponent && (
                    <FlagComponent className="w-5 h-4 flex-shrink-0" />
                  )}
                  <span className="text-sm text-gray-600 truncate">{entry.name}</span>
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
  const [granularity, setGranularity] = useState<'daily' | 'weekly'>('daily');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { chartData, stats } = generateMockData();

  // Pagination
  const totalPages = Math.ceil(stats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStats = stats.slice(startIndex, endIndex);

  // Calculate max value for Y-axis based on current page countries
  const currentCountryNames = currentStats.map(s => s.country);
  const allValues = chartData.flatMap(d =>
    Object.entries(d)
      .filter(([key]) => key !== 'date' && currentCountryNames.includes(key))
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
            <span className="text-gray-400">🌍</span>
            Countries
          </h2>
          <p className="text-sm text-gray-600">Donations shown by geolocation.</p>
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
            {currentStats.map((country, index) => (
              <Line
                key={`${country.country}-${index}`}
                type="monotone"
                dataKey={country.country}
                stroke={COUNTRY_COLORS[country.country] || '#3b82f6'}
                strokeWidth={2}
                dot={false}
                name={country.country}
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

              return (
                <tr key={`${stat.country}-${startIndex + index}`} className="border-t border-gray-100">
                  <td className="py-3 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: COUNTRY_COLORS[stat.country] || '#3b82f6' }}
                      ></div>
                      {FlagComponent && (
                        <FlagComponent className="w-5 h-4 flex-shrink-0" />
                      )}
                      <span>{stat.country}</span>
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{stats.length} records</span>
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
      </div>
    </div>
  );
}
