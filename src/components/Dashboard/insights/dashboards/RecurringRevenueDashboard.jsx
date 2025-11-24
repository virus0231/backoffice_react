import { useState } from 'react';
import ComparisonDatePicker from '../filters/ComparisonDatePicker';
import SimpleLineChart from '../charts/SimpleLineChart';

const RecurringRevenueDashboard = () => {
  const [comparisonRange, setComparisonRange] = useState(null);
  const [granularity, setGranularity] = useState('daily');

  // Main date range (last 30 days by default)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const mainDateRange = {
    startDate: thirtyDaysAgo,
    endDate: today
  };

  // Generate sample MRR data
  const generateMRRData = () => {
    const data = [];
    let baseValue = 45000;
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      baseValue += (Math.random() - 0.4) * 500;
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(baseValue),
        comparisonValue: comparisonRange ? Math.floor(baseValue * 0.92) : undefined
      });
    }
    return data;
  };

  const mrrData = generateMRRData();
  const totalMRR = mrrData[mrrData.length - 1]?.value || 0;
  const comparisonMRR = mrrData[mrrData.length - 1]?.comparisonValue || 0;

  // Calculate MRR growth rate
  const growthRate = (() => {
    if (mrrData.length < 2) return 0;
    const current = mrrData[mrrData.length - 1]?.value ?? 0;
    const previous = mrrData[0]?.value ?? 0;
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  })();

  const comparisonGrowthRate = comparisonRange ? growthRate * 0.8 : 0;

  // Growth rate time series
  const growthRateData = mrrData.map((point, index) => {
    if (index === 0) return { date: point.date, value: 0, comparisonValue: 0 };
    const current = point.value;
    const previous = mrrData[index - 1]?.value ?? 0;
    const currentGrowth = previous === 0 ? 0 : Number((((current - previous) / previous) * 100).toFixed(1));
    const comparisonGrowth = point.comparisonValue && mrrData[index - 1]?.comparisonValue
      ? Number((((point.comparisonValue - mrrData[index - 1].comparisonValue) / mrrData[index - 1].comparisonValue) * 100).toFixed(1))
      : undefined;
    return { date: point.date, value: currentGrowth, comparisonValue: comparisonGrowth };
  });

  // Share of revenue
  const shareOfRevenue = 32.5;
  const comparisonShareOfRevenue = comparisonRange ? 28.3 : 0;
  const shareOfRevenueData = mrrData.map((point, i) => ({
    date: point.date,
    value: 30 + (i / mrrData.length) * 5,
    comparisonValue: comparisonRange ? 27 + (i / mrrData.length) * 3 : undefined
  }));

  // Donation amounts distribution
  const donationAmounts = [
    { amount_range: '$5-10', plan_count: 45, percentage: 22.5 },
    { amount_range: '$10-25', plan_count: 68, percentage: 34.0 },
    { amount_range: '$25-50', plan_count: 42, percentage: 21.0 },
    { amount_range: '$50-100', plan_count: 28, percentage: 14.0 },
    { amount_range: '$100+', plan_count: 17, percentage: 8.5 }
  ];

  // Average revenue per plan
  const currentActivePlans = 150;
  const avgRevenue = totalMRR / currentActivePlans;
  const comparisonAvgRevenue = comparisonRange ? comparisonMRR / currentActivePlans : 0;
  const avgRevenuePerPlanData = mrrData.map((point, i) => ({
    date: point.date,
    value: Number((point.value / currentActivePlans).toFixed(2)),
    comparisonValue: point.comparisonValue ? Number((point.comparisonValue / currentActivePlans).toFixed(2)) : undefined
  }));

  // Churn rate
  const churnRate = 3.2;
  const comparisonChurnRate = comparisonRange ? 4.1 : 0;
  const churnRateData = mrrData.map((point, i) => ({
    date: point.date,
    value: Number((2.5 + Math.random() * 2).toFixed(2)),
    comparisonValue: comparisonRange ? Number((3.5 + Math.random() * 1.5).toFixed(2)) : undefined
  }));

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Recurring revenue</h2>
        <div className="flex flex-wrap items-center gap-2">
          <ComparisonDatePicker
            value={comparisonRange}
            onChange={setComparisonRange}
            mainDateRange={mainDateRange}
          />
          <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
            <button
              onClick={() => setGranularity('daily')}
              className={`px-3 py-1 text-xs rounded transition-all ${
                granularity === 'daily'
                  ? 'bg-white text-gray-900 shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setGranularity('weekly')}
              className={`px-3 py-1 text-xs rounded transition-all ${
                granularity === 'weekly'
                  ? 'bg-white text-gray-900 shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-900'
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
            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors" title="MRR (Monthly Recurring Revenue): The total predictable revenue generated from all active recurring donations in a month.">
              <span className="text-[10px] text-gray-600">?</span>
            </div>
          </div>
          {comparisonRange ? (
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
            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors" title="MRR Growth Rate: The percentage change in Monthly Recurring Revenue compared to the previous period.">
              <span className="text-[10px] text-gray-600">?</span>
            </div>
          </div>
          {comparisonRange ? (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-2xl font-semibold text-gray-900">{growthRate.toFixed(1)}%</div>
                <div className={`text-xs font-medium mt-1 ${
                  growthRate > comparisonGrowthRate
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {growthRate > comparisonGrowthRate ? '↗' : '↘'}
                  {Math.abs(growthRate - comparisonGrowthRate).toFixed(1)}pp
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
            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors" title="Share of Recurring Revenue: The percentage of your total donation revenue that comes from recurring subscriptions versus one-time donations.">
              <span className="text-[10px] text-gray-600">?</span>
            </div>
          </div>
          {comparisonRange ? (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-2xl font-semibold text-gray-900">{shareOfRevenue.toFixed(1)}%</div>
                <div className={`text-xs font-medium mt-1 ${
                  shareOfRevenue > comparisonShareOfRevenue
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {shareOfRevenue > comparisonShareOfRevenue ? '↗' : '↘'}
                  {Math.abs(shareOfRevenue - comparisonShareOfRevenue).toFixed(1)}pp
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
              <div className="w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors" title="Recurring Donation Amounts: Distribution of your active recurring subscriptions across different donation amount ranges.">
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
            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors" title="Average Revenue Per Plan: The average monthly donation amount across all active recurring subscriptions.">
              <span className="text-[10px] text-gray-600">?</span>
            </div>
          </div>
          {comparisonRange ? (
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
            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors" title="Churn Rate: The percentage of recurring subscriptions that were canceled during the selected period.">
              <span className="text-[10px] text-gray-600">?</span>
            </div>
          </div>
          {comparisonRange ? (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-2xl font-semibold text-gray-900">{churnRate.toFixed(2)}%</div>
                <div className={`text-xs font-medium mt-1 ${
                  churnRate < comparisonChurnRate
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {churnRate < comparisonChurnRate ? '↗' : '↘'}
                  {Math.abs(churnRate - comparisonChurnRate).toFixed(1)}pp
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
};

export default RecurringRevenueDashboard;
