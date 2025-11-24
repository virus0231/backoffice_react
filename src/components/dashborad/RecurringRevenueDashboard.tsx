"use client";

import { useState } from "react";
import DateRangePicker from "@/components/filters/DateRangePicker";
import ComparisonDatePicker from "@/components/charts/ComparisonDatePicker";
import SimpleLineChart from "@/components/charts/SimpleLineChart";
import { DateRange } from "@/types/filters";
import { useFilterContext } from "@/providers/FilterProvider";
import { useRecurringRevenueData } from "@/hooks/useRecurringRevenueData";
import { useRecurringPlansData } from "@/hooks/useRecurringPlansData";
import LoadingState from "@/components/common/LoadingState";
import ChartErrorFallback from "@/components/common/ChartErrorFallback";

export default function RecurringRevenueDashboard() {
  // Get global filter context
  const {
    dateRange: globalDateRange,
    isHydrated,
    selectedAppeals,
    selectedFunds
  } = useFilterContext();

  // Local state for chart's own overrides
  const [localDateRange, setLocalDateRange] = useState<DateRange | null>(null);
  const [comparisonRange, setComparisonRange] = useState<DateRange | null>(null);
  const [granularity, setGranularity] = useState<"daily" | "weekly">("daily");

  // Use local date range if set, otherwise use global
  const effectiveDateRange = localDateRange || globalDateRange;

  // Fetch real data from API
  const appealIds = selectedAppeals.length > 0 ? selectedAppeals.map(a => a.id).join(',') : null;
  const fundIds = selectedFunds.length > 0 ? selectedFunds.map(f => f.id).join(',') : null;

  const { mrr, shareOfRevenue: shareOfRevenueMetric, donationAmounts, isLoading: revenueLoading, hasError: revenueError, error: revenueErrorMsg } = useRecurringRevenueData(
    effectiveDateRange,
    comparisonRange,
    appealIds,
    fundIds
  );

  const { activePlans, canceledPlans, isLoading: plansLoading, hasError: plansError, error: plansErrorMsg } = useRecurringPlansData(
    effectiveDateRange,
    comparisonRange,
    appealIds,
    fundIds
  );

  // Combine loading and error states
  const isLoading = revenueLoading || plansLoading;
  const hasError = revenueError || plansError;
  const error = revenueErrorMsg || plansErrorMsg;

  // Get data based on selected granularity
  const mrrData = granularity === "weekly" ? mrr.weekly : mrr.daily;
  const shareOfRevenueData = granularity === "weekly" ? shareOfRevenueMetric.weekly : shareOfRevenueMetric.daily;
  const activePlansData = granularity === "weekly" ? activePlans.weekly : activePlans.daily;
  const canceledPlansData = granularity === "weekly" ? canceledPlans.weekly : canceledPlans.daily;

  // Calculate current MRR (last value in the series)
  const totalMRR = mrrData.length > 0 ? (mrrData[mrrData.length - 1]?.value ?? 0) : 0;
  const comparisonMRR = mrrData.length > 0 ? (mrrData[mrrData.length - 1]?.comparisonValue ?? 0) : 0;

  // Calculate MRR growth rate (comparison to first value in period)
  const growthRate = (() => {
    if (mrrData.length < 2) return 0;
    const current = mrrData[mrrData.length - 1]?.value ?? 0;
    const previous = mrrData[0]?.value ?? 0;
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  })();

  // Calculate comparison MRR growth rate
  const comparisonGrowthRate = (() => {
    if (!comparisonRange || mrrData.length < 2) return 0;
    const comparisonDataArray = mrrData.map(p => p.comparisonValue ?? 0);
    const current = comparisonDataArray[comparisonDataArray.length - 1] ?? 0;
    const previous = comparisonDataArray[0] ?? 0;
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  })();

  // Calculate Average Revenue Per Plan
  const currentActivePlans = activePlansData.length > 0 ? (activePlansData[activePlansData.length - 1]?.value ?? 0) : 0;
  const avgRevenue = currentActivePlans > 0 ? totalMRR / currentActivePlans : 0;

  // Calculate comparison Average Revenue Per Plan
  const comparisonActivePlans = activePlansData.length > 0 ? (activePlansData[activePlansData.length - 1]?.comparisonValue ?? 0) : 0;
  const comparisonAvgRevenue = comparisonActivePlans > 0 ? comparisonMRR / comparisonActivePlans : 0;

  // Calculate Churn Rate (canceled plans / active plans at start * 100)
  const totalCanceled = canceledPlansData.reduce((sum, point) => sum + point.value, 0);
  const activePlansAtStart = activePlansData.length > 0 ? (activePlansData[0]?.value ?? 0) : 0;
  const churnRate = activePlansAtStart > 0 ? (totalCanceled / activePlansAtStart) * 100 : 0;

  // Calculate comparison Churn Rate
  const comparisonTotalCanceled = canceledPlansData.reduce((sum, point) => sum + (point.comparisonValue ?? 0), 0);
  const comparisonActivePlansAtStart = activePlansData.length > 0 ? (activePlansData[0]?.comparisonValue ?? 0) : 0;
  const comparisonChurnRate = comparisonActivePlansAtStart > 0 ? (comparisonTotalCanceled / comparisonActivePlansAtStart) * 100 : 0;

  // Calculate share of revenue (current value from API data)
  const shareOfRevenue = shareOfRevenueData.length > 0 ? (shareOfRevenueData[shareOfRevenueData.length - 1]?.value ?? 0) : 0;
  const comparisonShareOfRevenue = shareOfRevenueData.length > 0 ? (shareOfRevenueData[shareOfRevenueData.length - 1]?.comparisonValue ?? 0) : 0;

  // Calculate time-series data for charts
  const growthRateData = mrrData.map((point, index) => {
    if (index === 0) return { date: point.date, value: 0, comparisonValue: 0, comparisonDate: point.comparisonDate };
    const current = point.value;
    const previous = mrrData[index - 1]?.value ?? 0;
    const currentGrowth = previous === 0 ? 0 : Number((((current - previous) / previous) * 100).toFixed(1));

    // Calculate comparison growth rate if comparison data exists
    let comparisonGrowth = undefined;
    if (point.comparisonValue !== undefined && index > 0 && mrrData[index - 1]?.comparisonValue !== undefined) {
      const comparisonCurrent = point.comparisonValue;
      const comparisonPrevious = mrrData[index - 1]?.comparisonValue ?? 0;
      comparisonGrowth = comparisonPrevious === 0 ? 0 : Number((((comparisonCurrent - comparisonPrevious) / comparisonPrevious) * 100).toFixed(1));
    }

    return {
      date: point.date,
      value: currentGrowth,
      comparisonValue: comparisonGrowth,
      comparisonDate: point.comparisonDate
    };
  });

  const avgRevenuePerPlanData = mrrData.map((mrrPoint, index) => {
    const activePlanCount = activePlansData[index]?.value ?? 0;
    const avg = activePlanCount > 0 ? mrrPoint.value / activePlanCount : 0;

    // Calculate comparison average if comparison data exists
    let comparisonAvg = undefined;
    if (mrrPoint.comparisonValue !== undefined && activePlansData[index]?.comparisonValue !== undefined) {
      const comparisonActivePlans = activePlansData[index]?.comparisonValue ?? 0;
      comparisonAvg = comparisonActivePlans > 0 ? Number((mrrPoint.comparisonValue / comparisonActivePlans).toFixed(2)) : 0;
    }

    return {
      date: mrrPoint.date,
      value: Number(avg.toFixed(2)),
      comparisonValue: comparisonAvg,
      comparisonDate: mrrPoint.comparisonDate
    };
  });

  const churnRateData = mrrData.map((point, index) => {
    const activePlanCount = activePlansData[index]?.value ?? 0;
    const canceledCount = canceledPlansData[index]?.value ?? 0;
    const churn = activePlanCount > 0 ? (canceledCount / activePlanCount) * 100 : 0;

    // Calculate comparison churn rate if comparison data exists
    let comparisonChurn = undefined;
    if (activePlansData[index]?.comparisonValue !== undefined && canceledPlansData[index]?.comparisonValue !== undefined) {
      const comparisonActivePlans = activePlansData[index]?.comparisonValue ?? 0;
      const comparisonCanceled = canceledPlansData[index]?.comparisonValue ?? 0;
      comparisonChurn = comparisonActivePlans > 0 ? Number(((comparisonCanceled / comparisonActivePlans) * 100).toFixed(2)) : 0;
    }

    return {
      date: point.date,
      value: Number(churn.toFixed(2)),
      comparisonValue: comparisonChurn,
      comparisonDate: point.comparisonDate
    };
  });

  // Show loading state
  if (!isHydrated || isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState size="lg" message="Loading recurring revenue data..." fullHeight />
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className="space-y-6">
        <ChartErrorFallback
          error={new Error(error || "Failed to load recurring revenue data")}
          resetError={() => window.location.reload()}
          title="Failed to load recurring revenue data"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left side - Title */}
        <h2 className="text-xl font-semibold text-gray-900">
          Recurring revenue
        </h2>

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

      {/* Grid Layout - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* MRR */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white">
          <div className="flex items-center gap-1.5 mb-2">
            <h3 className="text-sm text-gray-600">MRR</h3>
            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors" title="MRR (Monthly Recurring Revenue): The total predictable revenue generated from all active recurring donations in a month. This is calculated by summing all active monthly subscriptions, plus quarterly subscriptions divided by 3, plus annual subscriptions divided by 12. MRR is a key metric for understanding your organization's stable, predictable income stream.">
              <span className="text-[10px] text-gray-600">?</span>
            </div>
          </div>
          {comparisonRange && comparisonMRR > 0 ? (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  ${totalMRR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`text-xs font-medium mt-1 ${
                  totalMRR > comparisonMRR
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {totalMRR > comparisonMRR ? '↗' : '↘'}
                  {Math.abs(((totalMRR - comparisonMRR) / comparisonMRR * 100)).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Comparable period</div>
                <div className="text-xl font-semibold text-gray-700">
                  ${comparisonMRR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-semibold text-gray-900 mb-0.5">
                ${totalMRR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-500 mb-4">&nbsp;</div>
            </>
          )}
          <div className="h-28 -mx-2">
            <SimpleLineChart data={mrrData} color="#3b82f6" height={112} />
          </div>
        </div>

        {/* MRR growth rate */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white">
          <div className="flex items-center gap-1.5 mb-2">
            <h3 className="text-sm text-gray-600">MRR growth rate</h3>
            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors" title="MRR Growth Rate: The percentage change in Monthly Recurring Revenue compared to the previous period. A positive growth rate indicates you're acquiring more new recurring donors than you're losing to cancellations. This metric helps you track the health and momentum of your recurring giving program over time.">
              <span className="text-[10px] text-gray-600">?</span>
            </div>
          </div>
          {comparisonRange && comparisonMRR > 0 ? (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-2xl font-semibold text-gray-900">{growthRate.toFixed(1)}%</div>
                <div className={`text-xs font-medium mt-1 ${
                  growthRate > comparisonGrowthRate
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {growthRate > comparisonGrowthRate ? '↗' : '↘'}
                  {Math.abs((growthRate - comparisonGrowthRate)).toFixed(1)}pp
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Comparable period</div>
                <div className="text-xl font-semibold text-gray-700">
                  {comparisonGrowthRate.toFixed(1)}%
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-semibold text-gray-900 mb-0.5">{growthRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-500 mb-4">&nbsp;</div>
            </>
          )}
          <div className="h-28 -mx-2">
            <SimpleLineChart data={growthRateData} color="#3b82f6" height={112} />
          </div>
        </div>

        {/* Share of recurring revenue */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white">
          <div className="flex items-center gap-1.5 mb-2">
            <h3 className="text-sm text-gray-600">Share of recurring revenue</h3>
            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors" title="Share of Recurring Revenue: The percentage of your total donation revenue that comes from recurring subscriptions versus one-time donations. A higher percentage indicates stronger financial predictability and donor loyalty. Organizations typically aim for 20-40% recurring revenue, though this varies by mission and donor base.">
              <span className="text-[10px] text-gray-600">?</span>
            </div>
          </div>
          {comparisonRange && comparisonShareOfRevenue > 0 ? (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-2xl font-semibold text-gray-900">{shareOfRevenue.toFixed(1)}%</div>
                <div className={`text-xs font-medium mt-1 ${
                  shareOfRevenue > comparisonShareOfRevenue
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {shareOfRevenue > comparisonShareOfRevenue ? '↗' : '↘'}
                  {Math.abs((shareOfRevenue - comparisonShareOfRevenue)).toFixed(1)}pp
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Comparable period</div>
                <div className="text-xl font-semibold text-gray-700">
                  {comparisonShareOfRevenue.toFixed(1)}%
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-semibold text-gray-900 mb-0.5">{shareOfRevenue.toFixed(1)}%</div>
              <div className="text-xs text-gray-500 mb-4">&nbsp;</div>
            </>
          )}
          <div className="h-28 -mx-2">
            <SimpleLineChart data={shareOfRevenueData} color="#3b82f6" height={112} />
          </div>
        </div>

        {/* Recurring donation amounts */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm text-gray-600">Recurring donation amounts</h3>
              <div className="w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors" title="Recurring Donation Amounts: Distribution of your active recurring subscriptions across different donation amount ranges. This shows how many plans fall into each price tier and what percentage of your total recurring donor base they represent. Use this to understand your donor value mix and identify opportunities for upgrade campaigns.">
                <span className="text-[10px] text-gray-600">?</span>
              </div>
            </div>
            <span className="text-xs text-gray-500">Plans</span>
          </div>
          <div className="space-y-2.5 mt-6">
            {donationAmounts.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="text-xs text-gray-600 w-24 text-left flex-shrink-0">
                  {item.amount_range}
                </div>
                <div className="flex-1 bg-gray-100 rounded-sm h-6 relative overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all"
                    style={{ width: `${Math.min(item.percentage * 4, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-900 w-16 text-right flex-shrink-0">
                  {item.plan_count} · {item.percentage.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average revenue per plan */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white">
          <div className="flex items-center gap-1.5 mb-2">
            <h3 className="text-sm text-gray-600">Average revenue per plan</h3>
            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors" title="Average Revenue Per Plan: The average monthly donation amount across all active recurring subscriptions. This is calculated by dividing total MRR by the number of active plans. Track this over time to measure the success of upgrade campaigns and understand if donors are increasing or decreasing their giving amounts.">
              <span className="text-[10px] text-gray-600">?</span>
            </div>
          </div>
          {comparisonRange && comparisonAvgRevenue > 0 ? (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  ${avgRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`text-xs font-medium mt-1 ${
                  avgRevenue > comparisonAvgRevenue
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {avgRevenue > comparisonAvgRevenue ? '↗' : '↘'}
                  {Math.abs(((avgRevenue - comparisonAvgRevenue) / comparisonAvgRevenue * 100)).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Comparable period</div>
                <div className="text-xl font-semibold text-gray-700">
                  ${comparisonAvgRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-semibold text-gray-900 mb-0.5">
                ${avgRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-500 mb-4">&nbsp;</div>
            </>
          )}
          <div className="h-28 -mx-2">
            <SimpleLineChart data={avgRevenuePerPlanData} color="#3b82f6" height={112} />
          </div>
        </div>

        {/* Churn rate */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white">
          <div className="flex items-center gap-1.5 mb-2">
            <h3 className="text-sm text-gray-600">Churn rate</h3>
            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors" title="Churn Rate: The percentage of recurring subscriptions that were canceled during the selected period, calculated as (Canceled Plans / Active Plans at Start) × 100. A lower churn rate indicates better donor retention. Industry benchmarks vary, but nonprofits typically aim for monthly churn rates below 5%. High churn may indicate payment issues, donor dissatisfaction, or need for better engagement.">
              <span className="text-[10px] text-gray-600">?</span>
            </div>
          </div>
          {comparisonRange && comparisonChurnRate > 0 ? (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-2xl font-semibold text-gray-900">{churnRate.toFixed(2)}%</div>
                <div className={`text-xs font-medium mt-1 ${
                  churnRate < comparisonChurnRate
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {churnRate < comparisonChurnRate ? '↗' : '↘'}
                  {Math.abs((churnRate - comparisonChurnRate)).toFixed(1)}pp
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Comparable period</div>
                <div className="text-xl font-semibold text-gray-700">
                  {comparisonChurnRate.toFixed(2)}%
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-semibold text-gray-900 mb-0.5">{churnRate.toFixed(2)}%</div>
              <div className="text-xs text-gray-500 mb-4">&nbsp;</div>
            </>
          )}
          <div className="h-28 -mx-2">
            <SimpleLineChart data={churnRateData} color="#3b82f6" height={112} />
          </div>
        </div>
      </div>
    </div>
  );
}
