import { useState } from 'react';
import ComparisonDatePicker from '../filters/ComparisonDatePicker';
import SimpleLineChart from '../charts/SimpleLineChart';

const RecurringPlansDashboard = () => {
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

  // Generate sample data
  const generateSampleData = (baseValue, variance) => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(baseValue + (Math.random() - 0.5) * variance),
        comparisonValue: comparisonRange ? Math.floor(baseValue + (Math.random() - 0.5) * variance * 0.8) : undefined
      });
    }
    return data;
  };

  const activePlansData = generateSampleData(150, 30);
  const newPlansData = generateSampleData(15, 10);
  const canceledPlansData = generateSampleData(8, 6);

  // Calculate totals
  const activePlansTotal = activePlansData[activePlansData.length - 1]?.value || 0;
  const newPlansTotal = newPlansData.reduce((sum, point) => sum + point.value, 0);
  const canceledPlansTotal = canceledPlansData.reduce((sum, point) => sum + point.value, 0);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left side - Title and Range Status */}
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">Recurring plans</h2>
          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">Global Range</span>
        </div>

        {/* Right side - Controls */}
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

      {/* Grid of 3 charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active plans */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-gray-700">Active plans</h3>
            <div className="group relative">
              <div className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors">
                <span className="text-xs text-gray-600">?</span>
              </div>
              <div className="hidden group-hover:block absolute z-10 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg left-6 top-0">
                <div className="text-sm font-semibold text-gray-900 mb-1">Active Plans</div>
                <p className="text-xs text-gray-600">Total number of active recurring donation subscriptions at the end of the selected period. This represents all ongoing monthly, quarterly, or annual recurring donations that are currently active and processing payments.</p>
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{activePlansTotal}</div>
          {comparisonRange && activePlansData[0]?.comparisonValue !== undefined && (
            <div className="text-xs text-gray-600 mb-3">
              vs {activePlansData[0]?.comparisonValue} (comparison period)
            </div>
          )}
          <div className="h-32">
            <SimpleLineChart data={activePlansData} color="#3b82f6" height={128} />
          </div>
        </div>

        {/* New plans */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-gray-700">New plans</h3>
            <div className="group relative">
              <div className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors">
                <span className="text-xs text-gray-600">?</span>
              </div>
              <div className="hidden group-hover:block absolute z-10 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg left-6 top-0">
                <div className="text-sm font-semibold text-gray-900 mb-1">New Plans</div>
                <p className="text-xs text-gray-600">Number of new recurring donation subscriptions created during the selected period. This tracks donors who signed up for monthly, quarterly, or annual recurring donations. Use this to measure subscription growth and acquisition success.</p>
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{newPlansTotal}</div>
          {comparisonRange && (
            <div className="text-xs text-gray-600 mb-3">
              in selected period
            </div>
          )}
          <div className="h-32">
            <SimpleLineChart data={newPlansData} color="#3b82f6" height={128} />
          </div>
        </div>

        {/* Canceled plans */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-gray-700">Canceled plans</h3>
            <div className="group relative">
              <div className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors">
                <span className="text-xs text-gray-600">?</span>
              </div>
              <div className="hidden group-hover:block absolute z-10 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg left-6 top-0">
                <div className="text-sm font-semibold text-gray-900 mb-1">Canceled Plans</div>
                <p className="text-xs text-gray-600">Number of recurring donation subscriptions that were canceled during the selected period. This includes both donor-initiated cancellations and payment failures. Monitor this metric to identify retention issues and trends. Note: Appeal and fund filters do not apply to this metric.</p>
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{canceledPlansTotal}</div>
          {comparisonRange && (
            <div className="text-xs text-gray-600 mb-3">
              in selected period
            </div>
          )}
          <div className="h-32 mb-4">
            <SimpleLineChart data={canceledPlansData} color="#3b82f6" height={128} />
          </div>

          {/* Cancellation Reasons */}
          {canceledPlansTotal > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600" style={{ width: '100%' }}></div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                    <span className="text-gray-700">No reason given</span>
                  </div>
                  <span className="font-medium text-gray-900">83%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-purple-500"></div>
                    <span className="text-gray-700">Life changes</span>
                  </div>
                  <span className="font-medium text-gray-900">17%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecurringPlansDashboard;
