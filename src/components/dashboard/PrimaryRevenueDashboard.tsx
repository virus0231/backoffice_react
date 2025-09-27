"use client";

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import DateRangePicker from '@/components/charts/DateRangePicker';
import ComparisonDatePicker from '@/components/charts/ComparisonDatePicker';
import { useRevenueData } from '@/hooks/useRevenueData';
import { useFilterContext } from '@/providers/FilterProvider';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

export default function PrimaryRevenueDashboard() {
  // Use global filter context for main date range
  const { dateRange, setDateRange, isHydrated } = useFilterContext();

  // Local state for comparison range and granularity
  const [comparisonRange, setComparisonRange] = useState<DateRange | null>(null);
  const [granularity, setGranularity] = useState<'daily' | 'weekly'>('daily');

  // Only fetch data if filters are hydrated
  const { totalRaised, firstInstallments, oneTime, isLoading, hasError } = useRevenueData(
    isHydrated ? dateRange : { startDate: new Date(), endDate: new Date() },
    granularity
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatShortCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `£${(amount / 1000).toFixed(0)}K`;
    }
    return `£${amount.toFixed(0)}`;
  };

  // Don't render until filters are hydrated
  if (!isHydrated) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <p className="text-red-600">Error loading revenue data</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h2 className="text-lg font-semibold text-gray-900">Raised</h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Picker - Connected to Global Filter */}
          <div className="flex items-center gap-2">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
            <ComparisonDatePicker
              value={comparisonRange}
              onChange={setComparisonRange}
            />
          </div>
          {/* Daily/Weekly Toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setGranularity('daily')}
              className={`px-3 py-1 text-sm rounded font-medium ${
                granularity === 'daily'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setGranularity('weekly')}
              className={`px-3 py-1 text-sm rounded font-medium ${
                granularity === 'weekly'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mt-2"></div>
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(totalRaised.totalAmount)}
            </div>
            <div className="text-sm text-gray-600">
              {totalRaised.totalCount.toLocaleString()} donations
            </div>
          </>
        )}
      </div>

      {/* Main Chart */}
      <div className="h-64">
        {isLoading ? (
          <div className="h-full bg-gray-100 rounded animate-pulse flex items-center justify-center">
            <span className="text-gray-500">Loading chart...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={totalRaised.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="mainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                interval="preserveStartEnd"
              />
              <YAxis hide />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#mainGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Sub-sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
        {/* First Installments */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900">First installments</h3>
            <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-600">?</span>
            </div>
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mt-1"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(firstInstallments.totalAmount)}
                </div>
                <div className="text-sm text-gray-600">
                  {firstInstallments.totalCount} installments
                </div>
              </>
            )}
          </div>
          <div className="h-24">
            {isLoading ? (
              <div className="h-full bg-gray-100 rounded animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={firstInstallments.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="firstInstallmentsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis hide />
                  <YAxis hide />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    fill="url(#firstInstallmentsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {isLoading ? '...' : formatShortCurrency(firstInstallments.totalAmount / (firstInstallments.chartData.length || 1))}
          </div>
        </div>

        {/* One-time Donations */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900">One-time donations</h3>
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mt-1"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(oneTime.totalAmount)}
                </div>
                <div className="text-sm text-gray-600">
                  {oneTime.totalCount} donations
                </div>
              </>
            )}
          </div>
          <div className="h-24">
            {isLoading ? (
              <div className="h-full bg-gray-100 rounded animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={oneTime.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="oneTimeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis hide />
                  <YAxis hide />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    fill="url(#oneTimeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {isLoading ? '...' : formatShortCurrency(oneTime.totalAmount / (oneTime.chartData.length || 1))}
          </div>
        </div>
      </div>
    </div>
  );
}