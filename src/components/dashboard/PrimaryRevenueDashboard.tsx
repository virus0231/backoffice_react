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
  const { totalRaised, firstInstallments, oneTime, isLoading, hasError } = useRevenueData(
    isHydrated ? effectiveDateRange : { startDate: new Date(), endDate: new Date() },
    granularity,
    comparisonRange,
    selectedAppeals.length > 0 ? selectedAppeals[0]?.toString() : null,
    selectedFunds.length > 0 ? selectedFunds[0]?.toString() : null,
    frequency
  );

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
      const comparisonData = payload.find((p: any) => p.dataKey === 'comparisonAmount');

      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[220px]">
          <div className="text-sm font-medium text-gray-900 mb-2">
            {title || 'Total Raised'}
          </div>
          <div className="text-xs text-gray-600 mb-3">
            {new Date(label).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>

          {/* Current Period Data */}
          <div className="space-y-1 mb-2">
            <div className="text-xs font-medium text-gray-500 mb-1">Current Period</div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-sm font-semibold text-blue-700">
                {formatCurrency(mainData?.payload?.amount || 0)}
              </span>
            </div>
            {mainData?.payload?.count && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Count:</span>
                <span className="text-sm text-gray-700">
                  {mainData.payload.count.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Comparison Period Data */}
          {comparisonRange && mainData?.payload?.comparisonAmount !== undefined && (
            <div className="space-y-1 border-t border-gray-100 pt-2">
              <div className="text-xs font-medium text-gray-500 mb-1">Comparison Period</div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-sm font-semibold text-orange-600">
                  {formatCurrency(mainData.payload.comparisonAmount)}
                </span>
              </div>
              {mainData?.payload?.comparisonCount && (
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
      <div className="text-center py-8">
        <p className="text-red-600">Error loading revenue data</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex items-center justify-between">
        {/* Left side - Chart specific controls */}
        <div className="flex items-center gap-2">
          <DateRangePicker
            value={effectiveDateRange}
            onChange={(range) => setLocalDateRange(range)}
          />
          <ComparisonDatePicker
            value={comparisonRange}
            onChange={setComparisonRange}
            mainDateRange={effectiveDateRange}
          />
          {/* Reset to Global button */}
          {localDateRange && (
            <button
              onClick={() => setLocalDateRange(null)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
              title="Reset to global date range"
            >
              Reset
            </button>
          )}
          {/* Range Status Indicator */}
          {localDateRange ? (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Custom Range</span>
          ) : (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Global Range</span>
          )}
        </div>

        {/* Right side - Granularity */}
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
        ) : (
          <>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(totalRaised.totalAmount)}
            </div>
            <div className="text-sm text-gray-600">
              {(Number(totalRaised?.totalCount ?? 0)).toLocaleString()} donations
            </div>
            {/* Comparison Data */}
            {comparisonRange && totalRaised.comparisonTotalAmount !== undefined && (
              <div className="flex items-center gap-3 text-sm">
                <div className="text-gray-500">
                  vs {formatCurrency(totalRaised.comparisonTotalAmount)}
                </div>
                {totalRaised.comparisonTotalAmount > 0 && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    totalRaised.totalAmount > totalRaised.comparisonTotalAmount
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {totalRaised.totalAmount > totalRaised.comparisonTotalAmount ? '↗' : '↘'}
                    {Math.abs(((totalRaised.totalAmount - totalRaised.comparisonTotalAmount) / totalRaised.comparisonTotalAmount * 100)).toFixed(1)}%
                  </div>
                )}
              </div>
            )}
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
                <linearGradient id="comparisonGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
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
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-blue-500 rounded-sm"></div>
            <span className="text-gray-600">Current Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-orange-500 rounded-sm opacity-60" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)'
            }}></div>
            <span className="text-gray-600">Comparison Period</span>
          </div>
        </div>
      )}

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
          <div className="text-xs text-gray-500">
            {isLoading ? '...' : formatShortCurrency(oneTime.totalAmount / (oneTime.chartData.length || 1))}
          </div>
        </div>
      </div>
    </div>
  );
}






