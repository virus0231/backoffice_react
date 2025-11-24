"use client";

import { useState } from "react";
import DateRangePicker from "@/components/filters/DateRangePicker";
import ComparisonDatePicker from "@/components/charts/ComparisonDatePicker";
import SimpleLineChart from "@/components/charts/SimpleLineChart";
import type { DateRange } from "@/types/filters";
import { useFilterContext } from "@/providers/FilterProvider";
import { useRecurringPlansData } from "@/hooks/useRecurringPlansData";

export default function RecurringPlansDashboard() {
  // Get global filter context
  const {
    dateRange: globalDateRange,
    selectedAppeals,
    selectedFunds,
    isHydrated
  } = useFilterContext();

  // Local state for chart's own overrides (optional - falls back to global)
  const [localDateRange, setLocalDateRange] = useState<DateRange | null>(null);
  const [comparisonRange, setComparisonRange] = useState<DateRange | null>(null);
  const [granularity, setGranularity] = useState<"daily" | "weekly">("daily");

  // Use local date range if set, otherwise use global
  const effectiveDateRange = localDateRange || globalDateRange;

  // Convert appeal and fund arrays to comma-separated ID strings
  const appealIds = selectedAppeals.length > 0
    ? selectedAppeals.map(a => a.id).join(',')
    : null;
  const fundIds = selectedFunds.length > 0
    ? selectedFunds.map(f => f.id).join(',')
    : null;

  // Fetch recurring plans data
  const plansData = useRecurringPlansData(
    isHydrated ? effectiveDateRange : { startDate: new Date(), endDate: new Date() },
    comparisonRange,
    appealIds,
    fundIds
  );

  // Select data based on granularity (instant switching, no API calls)
  const activePlansData = granularity === 'daily' ? plansData.activePlans.daily : plansData.activePlans.weekly;
  const newPlansData = granularity === 'daily' ? plansData.newPlans.daily : plansData.newPlans.weekly;
  const canceledPlansData = granularity === 'daily' ? plansData.canceledPlans.daily : plansData.canceledPlans.weekly;

  // Calculate totals for display - always use daily data for accurate totals
  const activePlansTotal = plansData.activePlans.daily.length > 0
    ? (plansData.activePlans.daily[plansData.activePlans.daily.length - 1]?.value ?? 0)
    : 0;
  const newPlansTotal = plansData.newPlans.daily.reduce((sum, point) => sum + point.value, 0);
  const canceledPlansTotal = plansData.canceledPlans.daily.reduce((sum, point) => sum + point.value, 0);

  const isLoading = plansData.isLoading;
  const hasError = plansData.hasError;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left side - Range Status Indicator */}
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Recurring plans
          </h2>
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

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-600">Loading recurring plans data...</p>
          </div>
        </div>
      ) : hasError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load recurring plans data. Please try again.</p>
        </div>
      ) : (
        <>
          {/* Grid of 3 charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active plans */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-700">Active plans</h3>
                  <div className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors" title="Active Plans: Total number of active recurring donation subscriptions at the end of the selected period. This represents all ongoing monthly, quarterly, or annual recurring donations that are currently active and processing payments.">
                    <span className="text-xs text-gray-600">?</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">{activePlansTotal}</div>
                {comparisonRange && activePlansData.length > 0 && activePlansData[0]?.comparisonValue !== undefined && (
                  <div className="text-xs text-gray-500">
                    vs {activePlansData[0]?.comparisonValue} (comparison period)
                  </div>
                )}
              </div>
              <div className="h-32">
                <SimpleLineChart data={activePlansData} color="#3b82f6" height={128} />
              </div>
            </div>

            {/* New plans */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-700">New plans</h3>
                  <div className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors" title="New Plans: Number of new recurring donation subscriptions created during the selected period. This tracks donors who signed up for monthly, quarterly, or annual recurring donations. Use this to measure subscription growth and acquisition success.">
                    <span className="text-xs text-gray-600">?</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">{newPlansTotal}</div>
                {comparisonRange && (
                  <div className="text-xs text-gray-500">
                    in selected period
                  </div>
                )}
              </div>
              <div className="h-32">
                <SimpleLineChart data={newPlansData} color="#3b82f6" height={128} />
              </div>
            </div>

            {/* Canceled plans */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-700">Canceled plans</h3>
                  <div className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors" title="Canceled Plans: Number of recurring donation subscriptions that were canceled during the selected period. This includes both donor-initiated cancellations and payment failures. Monitor this metric to identify retention issues and trends. Note: Appeal and fund filters do not apply to this metric.">
                    <span className="text-xs text-gray-600">?</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">{canceledPlansTotal}</div>
                {comparisonRange && (
                  <div className="text-xs text-gray-500">
                    in selected period
                  </div>
                )}
              </div>
              <div className="h-32">
                <SimpleLineChart data={canceledPlansData} color="#3b82f6" height={128} />
              </div>

              {/* Cancellation Reasons - Keep as mock data for now */}
              {canceledPlansTotal > 0 && (
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1">
                      <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>
                      <span className="text-gray-700">No reason given</span>
                      <span className="text-gray-900 font-medium ml-auto">83%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-purple-500 rounded-sm"></div>
                      <span className="text-gray-700">Life changes</span>
                      <span className="text-gray-900 font-medium ml-auto">17%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
