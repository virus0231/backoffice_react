"use client";

import { useState } from "react";
import DateRangePicker from "@/components/filters/DateRangePicker";
import type { DateRange } from "@/types/filters";
import { useFilterContext } from "@/providers/FilterProvider";
import { usePaymentMethodsData } from "@/hooks/usePaymentMethodsData";
import LoadingState from "@/components/common/LoadingState";
import ChartErrorFallback from "@/components/common/ChartErrorFallback";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Payment methods with their colors - mapped to database values
const PAYMENT_METHOD_CONFIG: Record<string, { label: string; color: string }> = {
  'cc': { label: 'Credit Card', color: '#3b82f6' },
  'applepay': { label: 'Apple Pay', color: '#8b5cf6' },
  'gpay': { label: 'Google Pay', color: '#06b6d4' },
  'PAYPAL': { label: 'PayPal', color: '#ec4899' },
  'Stripe': { label: 'Stripe', color: '#10b981' },
  'paypal_ipn': { label: 'PayPal IPN', color: '#f59e0b' },
};

const PAYMENT_METHODS = Object.entries(PAYMENT_METHOD_CONFIG).map(([key, cfg]) => ({
  key,
  label: cfg.label,
  color: cfg.color,
}));

// No mock data; using real API data via hook

export default function PaymentMethodsDashboard() {
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

  const { chartData, tableData, isLoading, hasError, error } = usePaymentMethodsData(
    effectiveDateRange,
    granularity,
    appealIds,
    fundIds
  );

  // Pagination
  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = tableData.slice(startIndex, endIndex);

  // Calculate legend totals from paginated data only
  const paginatedMethods = paginatedData.map(d => d.paymentMethod);
  const visibleMethods = PAYMENT_METHODS.filter(method =>
    paginatedMethods.includes(method.key)
  );

  const legendTotals = visibleMethods.map((method) => {
    const total = tableData.find(d => d.paymentMethod === method.key)?.totalRaised || 0;
    return { ...method, total };
  });

  // Filter chart data to only include visible payment method keys
  const visibleKeys = visibleMethods.map(m => m.key);
  const filteredChartData = chartData.map(dataPoint => {
    const filtered: any = { date: dataPoint.date };
    visibleKeys.forEach(key => {
      filtered[key] = dataPoint[key] || 0;
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
        <LoadingState size="lg" message="Loading payment methods data..." fullHeight />
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className="space-y-6">
        <ChartErrorFallback
          error={new Error(error || "Failed to load payment methods data")}
          resetError={() => window.location.reload()}
          title="Failed to load payment methods data"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Payment methods</h2>
          <div className="flex items-center gap-2">
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

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart key={`payment-methods-chart-page-${currentPage}`} data={filteredChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    {legendTotals.map((method) => (
                      <div key={method.key} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }}></div>
                        <span className="text-xs text-gray-700">{method.label}</span>
                        <span className="text-xs font-medium text-gray-900">${method.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
              {visibleMethods.map((method) => (
                <Line
                  key={method.key}
                  type="monotone"
                  dataKey={method.key}
                  stroke={method.color}
                  strokeWidth={2}
                  dot={false}
                  name={method.label}
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
                Payment method
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
              const cfg = PAYMENT_METHOD_CONFIG[row.paymentMethod];
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg?.color || '#9ca3af' }}></div>
                      <span className="text-sm text-gray-900">{cfg?.label || row.paymentMethod}</span>
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
              Showing {startIndex + 1}-{Math.min(endIndex, tableData.length)} of {tableData.length} payment methods
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
