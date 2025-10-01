"use client";

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import DateRangePicker from '@/components/filters/DateRangePicker';
import ComparisonDatePicker from '@/components/charts/ComparisonDatePicker';
import { useRevenueData } from '@/hooks/useRevenueData';
import { useFilterContext } from '@/providers/FilterProvider';
import { DateRange } from '@/types/filters';

export default function PrimaryRevenueDashboard() {
  // Get global filter context
  const {
    dateRange: globalDateRange,
    selectedAppeals,
    selectedFunds,
    frequency,
    isHydrated
  } = useFilterContext();

  // Local state for chart's own overrides (optional - falls back to global)
  const [localDateRange, setLocalDateRange] = useState<DateRange | null>(null);
  const [comparisonRange, setComparisonRange] = useState<DateRange | null>(null);
  const [granularity, setGranularity] = useState<'daily' | 'weekly'>('daily');

  // Use local date range if set, otherwise use global
  const effectiveDateRange = localDateRange || globalDateRange;

  // Only fetch data if filters are hydrated
  // Convert appeal and fund arrays to comma-separated ID strings
  const appealIds = selectedAppeals.length > 0
    ? selectedAppeals.map(a => a.id).join(',')
    : null;
  const fundIds = selectedFunds.length > 0
    ? selectedFunds.map(f => f.id).join(',')
    : null;

  const revenueData = useRevenueData(
    isHydrated ? effectiveDateRange : { startDate: new Date(), endDate: new Date() },
    comparisonRange,
    appealIds,
    fundIds,
    frequency
  );

  // Select data based on granularity (instant switching, no API calls)
  const totalRaised = granularity === 'daily' ? revenueData.totalRaised.daily : revenueData.totalRaised.weekly;
  const firstInstallments = granularity === 'daily' ? revenueData.firstInstallments.daily : revenueData.firstInstallments.weekly;
  const oneTime = granularity === 'daily' ? revenueData.oneTime.daily : revenueData.oneTime.weekly;
  const isLoading = revenueData.isLoading;
  const hasError = revenueData.hasError;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatShortCurrency = (amount: number) => {
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 0
    });
    return formatter.format(amount);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label, title }: any) => {
    if (active && payload && payload.length) {
      const mainData = payload.find((p: any) => p.dataKey === 'amount' || p.dataKey === 'comparisonAmount');

      // Format the current period date
      const formatDate = (dateStr: string) => {
        try {
          const date = new Date(dateStr);
          // Check if date is valid
          if (isNaN(date.getTime())) {
            return dateStr;
          }
          return date.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        } catch {
          return dateStr;
        }
      };

      const currentDate = mainData?.payload?.date || label;
      const comparisonDate = mainData?.payload?.comparisonDate;

      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[220px]">
          <div className="text-sm font-medium text-gray-900 mb-2">
            {title || 'Total Raised'}
          </div>

          {/* Current Period Data */}
          <div className="space-y-1 mb-2">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-medium text-gray-500">Current Period</div>
              <div className="text-xs text-gray-600">{formatDate(currentDate)}</div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-sm font-semibold text-blue-700">
                {formatCurrency(mainData?.payload?.amount || 0)}
              </span>
            </div>
            {mainData?.payload?.count !== undefined && mainData?.payload?.count !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Count:</span>
                <span className="text-sm text-gray-700">
                  {mainData.payload.count.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Comparison Period Data */}
          {comparisonRange && mainData?.payload?.comparisonAmount !== undefined && comparisonDate && (
            <div className="space-y-1 border-t border-gray-100 pt-2">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-medium text-gray-500">Comparison Period</div>
                <div className="text-xs text-gray-600">{formatDate(comparisonDate)}</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-sm font-semibold text-orange-600">
                  {formatCurrency(mainData.payload.comparisonAmount)}
                </span>
              </div>
              {mainData?.payload?.comparisonCount !== undefined && mainData?.payload?.comparisonCount !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Count:</span>
                  <span className="text-sm text-gray-700">
                    {mainData.payload.comparisonCount.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Percentage Change */}
              {mainData.payload.comparisonAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Change:</span>
                  <span className={`text-sm font-medium ${
                    mainData.payload.amount > mainData.payload.comparisonAmount ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {((mainData.payload.amount - mainData.payload.comparisonAmount) / mainData.payload.comparisonAmount * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Don't render until filters are hydrated
  if (!isHydrated) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex justify-between">
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="flex gap-1">
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                Unable to Load Revenue Data
              </h3>
              <p className="text-sm text-red-700 mb-4">
                We encountered an error while fetching your revenue data. This could be due to a network issue or a temporary problem with our servers.
              </p>
              <button
                onClick={() => revenueData.retry()}
                className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left side - Range Status Indicator */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Range Status Indicator */}
          {localDateRange ? (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">Custom Range</span>
          ) : (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">Global Range</span>
          )}
          {/* Reset to Global button */}
          {localDateRange && (
            <button
              onClick={() => setLocalDateRange(null)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors"
              title="Reset to global date range"
            >
              Reset
            </button>
          )}
        </div>

        {/* Right side - Date pickers and Granularity */}
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            value={effectiveDateRange}
            onChange={(range) => setLocalDateRange(range)}
          />
          <ComparisonDatePicker
            value={comparisonRange}
            onChange={setComparisonRange}
            mainDateRange={effectiveDateRange}
          />
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setGranularity('daily')}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all ${
                granularity === 'daily'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setGranularity('weekly')}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all ${
                granularity === 'weekly'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
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
            {comparisonRange && (
              <div className="h-4 bg-gray-200 rounded w-24 mt-1"></div>
            )}
          </div>
        ) : comparisonRange ? (
          // Side-by-side layout when comparing
          <div className="grid grid-cols-2 gap-8">
            {/* Current Period */}
            <div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(totalRaised.totalAmount)}
                </div>
                {totalRaised.comparisonTotalAmount !== undefined && totalRaised.comparisonTotalAmount > 0 && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    totalRaised.totalAmount > totalRaised.comparisonTotalAmount
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {totalRaised.totalAmount > totalRaised.comparisonTotalAmount ? '↗' : '↘'}
                    {Math.abs(((totalRaised.totalAmount - totalRaised.comparisonTotalAmount) / totalRaised.comparisonTotalAmount * 100)).toFixed(0)}%
                  </div>
                )}
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <div className="text-sm text-gray-600">
                  {(Number(totalRaised?.totalCount ?? 0)).toLocaleString()} donations
                </div>
                {totalRaised.comparisonTotalCount !== undefined && totalRaised.comparisonTotalCount > 0 && (
                  <div className={`text-xs font-medium ${
                    totalRaised.totalCount > totalRaised.comparisonTotalCount
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {totalRaised.totalCount > totalRaised.comparisonTotalCount ? '↗' : '↘'}
                    {Math.abs(((totalRaised.totalCount - totalRaised.comparisonTotalCount) / totalRaised.comparisonTotalCount * 100)).toFixed(0)}%
                  </div>
                )}
              </div>
            </div>

            {/* Comparison Period */}
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Comparable period</div>
              <div className="text-2xl font-bold text-gray-700">
                {formatCurrency(totalRaised.comparisonTotalAmount || 0)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {(Number(totalRaised?.comparisonTotalCount ?? 0)).toLocaleString()} donations
              </div>
            </div>
          </div>
        ) : (
          // Normal layout without comparison
          <>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(totalRaised.totalAmount)}
            </div>
            <div className="text-sm text-gray-600">
              {(Number(totalRaised?.totalCount ?? 0)).toLocaleString()} donations
            </div>
          </>
        )}
      </div>

      {/* Main Chart */}
      <div className="h-64 min-h-[16rem]">
        {isLoading ? (
          <div className="h-full bg-gray-100 rounded animate-pulse flex items-center justify-center">
            <div className="text-center">
              <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm text-gray-600">Loading chart data...</span>
            </div>
          </div>
        ) : totalRaised.chartData.length === 0 ? (
          <div className="h-full bg-gray-50 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm font-medium text-gray-900 mb-1">No Data Available</p>
              <p className="text-sm text-gray-500">There's no revenue data for the selected period.</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={totalRaised.chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="mainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="comparisonGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                interval="preserveStartEnd"
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
              <Tooltip
                content={<CustomTooltip title="Total Raised" />}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              {/* Comparison Area (rendered first, so it appears behind) */}
              {comparisonRange && (
                <Area
                  type="monotone"
                  dataKey="comparisonAmount"
                  stroke="#f97316"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="url(#comparisonGradient)"
                />
              )}
              {/* Main Area */}
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

      {/* Chart Legend */}
      {comparisonRange && (
        <div className="flex items-center justify-center gap-6 text-xs sm:text-sm bg-gray-50 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-blue-500 rounded-sm"></div>
            <span className="text-gray-700 font-medium">Current Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-orange-500 rounded-sm opacity-60" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 4px)'
            }}></div>
            <span className="text-gray-700 font-medium">Comparison Period</span>
          </div>
        </div>
      )}

      {/* Sub-sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
        {/* First Installments */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900">First installments</h3>
            <div className="relative group">
              <div className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors">
                <span className="text-xs text-gray-600">?</span>
              </div>
              <div className="absolute left-0 top-6 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
                <div className="font-medium mb-1">First Installments</div>
                <p className="text-gray-300">The initial payment of recurring donations. This represents new recurring donors who have made their first contribution.</p>
                <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            </div>
            {comparisonRange && (
              <span className="text-xs text-gray-500 ml-auto">Comparable period</span>
            )}
          </div>

          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mt-1"></div>
            </div>
          ) : comparisonRange ? (
            // Side-by-side comparison layout
            <div className="grid grid-cols-2 gap-4">
              {/* Current Period */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(firstInstallments.totalAmount)}
                  </div>
                  {firstInstallments.comparisonTotalAmount !== undefined && firstInstallments.comparisonTotalAmount > 0 && (
                    <div className={`text-xs font-medium ${
                      firstInstallments.totalAmount > firstInstallments.comparisonTotalAmount
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {firstInstallments.totalAmount > firstInstallments.comparisonTotalAmount ? '↗' : '↘'}
                      {Math.abs(((firstInstallments.totalAmount - firstInstallments.comparisonTotalAmount) / firstInstallments.comparisonTotalAmount * 100)).toFixed(0)}%
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-sm text-gray-600">
                    {firstInstallments.totalCount} installments
                  </div>
                  {firstInstallments.comparisonTotalCount !== undefined && firstInstallments.comparisonTotalCount > 0 && (
                    <div className={`text-xs font-medium ${
                      firstInstallments.totalCount > firstInstallments.comparisonTotalCount
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {firstInstallments.totalCount > firstInstallments.comparisonTotalCount ? '↗' : '↘'}
                      {Math.abs(((firstInstallments.totalCount - firstInstallments.comparisonTotalCount) / firstInstallments.comparisonTotalCount * 100)).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>

              {/* Comparison Period */}
              <div className="space-y-1">
                <div className="text-xl font-bold text-gray-700">
                  {formatCurrency(firstInstallments.comparisonTotalAmount || 0)}
                </div>
                <div className="text-sm text-gray-600">
                  {firstInstallments.comparisonTotalCount || 0} installments
                </div>
              </div>
            </div>
          ) : (
            // Normal layout without comparison
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(firstInstallments.totalAmount)}
              </div>
              <div className="text-sm text-gray-600">
                {firstInstallments.totalCount} installments
              </div>
            </div>
          )}
          <div className="h-24 min-h-[6rem]">
            {isLoading ? (
              <div className="h-full bg-gray-100 rounded animate-pulse"></div>
            ) : firstInstallments.chartData.length === 0 ? (
              <div className="h-full bg-gray-50 rounded border border-dashed border-gray-300 flex items-center justify-center">
                <p className="text-xs text-gray-500">No data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={firstInstallments.chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="firstInstallmentsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="firstInstallmentsComparisonGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis hide />
                  <YAxis hide />
                  <Tooltip
                    content={<CustomTooltip title="First Installments" />}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  {/* Comparison Area */}
                  {comparisonRange && (
                    <Area
                      type="monotone"
                      dataKey="comparisonAmount"
                      stroke="#f97316"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      fill="url(#firstInstallmentsComparisonGradient)"
                    />
                  )}
                  {/* Main Area */}
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
        </div>

        {/* One-time Donations */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900">One-time donations</h3>
            {comparisonRange && (
              <span className="text-xs text-gray-500 ml-auto">Comparable period</span>
            )}
          </div>

          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mt-1"></div>
            </div>
          ) : comparisonRange ? (
            // Side-by-side comparison layout
            <div className="grid grid-cols-2 gap-4">
              {/* Current Period */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(oneTime.totalAmount)}
                  </div>
                  {oneTime.comparisonTotalAmount !== undefined && oneTime.comparisonTotalAmount > 0 && (
                    <div className={`text-xs font-medium ${
                      oneTime.totalAmount > oneTime.comparisonTotalAmount
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {oneTime.totalAmount > oneTime.comparisonTotalAmount ? '↗' : '↘'}
                      {Math.abs(((oneTime.totalAmount - oneTime.comparisonTotalAmount) / oneTime.comparisonTotalAmount * 100)).toFixed(0)}%
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-sm text-gray-600">
                    {oneTime.totalCount} donations
                  </div>
                  {oneTime.comparisonTotalCount !== undefined && oneTime.comparisonTotalCount > 0 && (
                    <div className={`text-xs font-medium ${
                      oneTime.totalCount > oneTime.comparisonTotalCount
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {oneTime.totalCount > oneTime.comparisonTotalCount ? '↗' : '↘'}
                      {Math.abs(((oneTime.totalCount - oneTime.comparisonTotalCount) / oneTime.comparisonTotalCount * 100)).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>

              {/* Comparison Period */}
              <div className="space-y-1">
                <div className="text-xl font-bold text-gray-700">
                  {formatCurrency(oneTime.comparisonTotalAmount || 0)}
                </div>
                <div className="text-sm text-gray-600">
                  {oneTime.comparisonTotalCount || 0} donations
                </div>
              </div>
            </div>
          ) : (
            // Normal layout without comparison
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(oneTime.totalAmount)}
              </div>
              <div className="text-sm text-gray-600">
                {oneTime.totalCount} donations
              </div>
            </div>
          )}
          <div className="h-24 min-h-[6rem]">
            {isLoading ? (
              <div className="h-full bg-gray-100 rounded animate-pulse"></div>
            ) : oneTime.chartData.length === 0 ? (
              <div className="h-full bg-gray-50 rounded border border-dashed border-gray-300 flex items-center justify-center">
                <p className="text-xs text-gray-500">No data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={oneTime.chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="oneTimeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="oneTimeComparisonGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis hide />
                  <YAxis hide />
                  <Tooltip
                    content={<CustomTooltip title="One-time Donations" />}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  {/* Comparison Area */}
                  {comparisonRange && (
                    <Area
                      type="monotone"
                      dataKey="comparisonAmount"
                      stroke="#f97316"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      fill="url(#oneTimeComparisonGradient)"
                    />
                  )}
                  {/* Main Area */}
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
        </div>
      </div>
    </div>
  );
}






