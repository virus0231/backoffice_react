import { useMemo, useState } from 'react';
import DateRangePicker from '../filters/DateRangePicker';
import ComparisonDatePicker from '../filters/ComparisonDatePicker';
import SimpleLineChart from '../charts/SimpleLineChart';

const activePlansDaily = [
  { date: '2025-10-30', value: 148, comparisonValue: 132 },
  { date: '2025-11-01', value: 152, comparisonValue: 134 },
  { date: '2025-11-03', value: 155, comparisonValue: 136 },
  { date: '2025-11-05', value: 158, comparisonValue: 138 },
  { date: '2025-11-07', value: 160, comparisonValue: 139 },
  { date: '2025-11-09', value: 163, comparisonValue: 141 },
  { date: '2025-11-10', value: 164, comparisonValue: 142 },
];

const newPlansDaily = [
  { date: '2025-10-30', value: 8, comparisonValue: 5 },
  { date: '2025-11-01', value: 9, comparisonValue: 6 },
  { date: '2025-11-03', value: 7, comparisonValue: 4 },
  { date: '2025-11-05', value: 6, comparisonValue: 4 },
  { date: '2025-11-07', value: 5, comparisonValue: 3 },
  { date: '2025-11-09', value: 4, comparisonValue: 2 },
  { date: '2025-11-10', value: 6, comparisonValue: 3 },
];

const canceledPlansDaily = [
  { date: '2025-10-30', value: 2, comparisonValue: 2 },
  { date: '2025-11-01', value: 3, comparisonValue: 3 },
  { date: '2025-11-03', value: 1, comparisonValue: 2 },
  { date: '2025-11-05', value: 2, comparisonValue: 2 },
  { date: '2025-11-07', value: 1, comparisonValue: 2 },
  { date: '2025-11-09', value: 2, comparisonValue: 1 },
  { date: '2025-11-10', value: 1, comparisonValue: 1 },
];

const formatNumber = (v) => Number(v || 0).toLocaleString();

const RecurringPlansDashboard = () => {
  const [granularity, setGranularity] = useState('daily');
  const [comparisonRange, setComparisonRange] = useState({
    startDate: new Date('2025-10-14'),
    endDate: new Date('2025-10-28'),
    preset: 'previousPeriod',
  });
  const [localRange, setLocalRange] = useState({
    startDate: new Date('2025-10-28'),
    endDate: new Date('2025-11-10'),
    preset: 'last30days',
  });

  const activePlansData = useMemo(() => activePlansDaily, []);
  const newPlansData = useMemo(() => newPlansDaily, []);
  const canceledPlansData = useMemo(() => canceledPlansDaily, []);

  const activePlansTotal = activePlansData[activePlansData.length - 1]?.value || 0;
  const newPlansTotal = newPlansData.reduce((sum, point) => sum + point.value, 0);
  const canceledPlansTotal = canceledPlansData.reduce((sum, point) => sum + point.value, 0);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">Recurring plans</h2>
          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">Global Range</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker value={localRange} onChange={setLocalRange} />
          <ComparisonDatePicker value={comparisonRange} onChange={setComparisonRange} mainDateRange={localRange} />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active plans */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-700">Active plans</h3>
            <div
              className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors"
              title="Active Plans: Total number of active recurring donation subscriptions at the end of the selected period."
            >
              <span className="text-[10px] text-gray-600">?</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatNumber(activePlansTotal)}</div>
          {comparisonRange && activePlansData[0]?.comparisonValue !== undefined && (
            <div className="text-xs text-gray-600">
              vs {formatNumber(activePlansData[0]?.comparisonValue)} (comparison period)
            </div>
          )}
          <div className="h-32">
            <SimpleLineChart data={activePlansData} color="#3b82f6" height={128} />
          </div>
        </div>

        {/* New plans */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-700">New plans</h3>
            <div
              className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors"
              title="New Plans: Number of new recurring donation subscriptions created during the selected period."
            >
              <span className="text-[10px] text-gray-600">?</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatNumber(newPlansTotal)}</div>
          {comparisonRange && <div className="text-xs text-gray-600">in selected period</div>}
          <div className="h-32">
            <SimpleLineChart data={newPlansData} color="#3b82f6" height={128} />
          </div>
        </div>

        {/* Canceled plans */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-700">Canceled plans</h3>
            <div
              className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors"
              title="Canceled Plans: Number of recurring donation subscriptions canceled during the selected period."
            >
              <span className="text-[10px] text-gray-600">?</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatNumber(canceledPlansTotal)}</div>
          {comparisonRange && <div className="text-xs text-gray-600">in selected period</div>}
          <div className="h-32 mb-4">
            <SimpleLineChart data={canceledPlansData} color="#3b82f6" height={128} />
          </div>

          {canceledPlansTotal > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 w-full"></div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                    <span className="text-gray-700">No reason given</span>
                  </div>
                  <span className="font-medium text-gray-900">83%</span>
                </div>
                <div className="flex items-center justify-between">
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
