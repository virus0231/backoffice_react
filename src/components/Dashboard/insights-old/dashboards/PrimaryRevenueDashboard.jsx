import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import ComparisonDatePicker from '../filters/ComparisonDatePicker';
import DateRangePicker from '../filters/DateRangePicker';

const primaryDaily = [
  { date: '2025-10-28', amount: 4200, count: 36, comparisonAmount: 3900, comparisonCount: 31 },
  { date: '2025-10-29', amount: 4800, count: 38, comparisonAmount: 3600, comparisonCount: 27 },
  { date: '2025-10-30', amount: 5300, count: 41, comparisonAmount: 4200, comparisonCount: 33 },
  { date: '2025-10-31', amount: 6100, count: 45, comparisonAmount: 4300, comparisonCount: 32 },
  { date: '2025-11-01', amount: 7900, count: 52, comparisonAmount: 5100, comparisonCount: 36 },
  { date: '2025-11-02', amount: 6800, count: 48, comparisonAmount: 4700, comparisonCount: 34 },
  { date: '2025-11-03', amount: 7200, count: 49, comparisonAmount: 5000, comparisonCount: 36 },
  { date: '2025-11-04', amount: 8100, count: 54, comparisonAmount: 5400, comparisonCount: 37 },
  { date: '2025-11-05', amount: 7600, count: 51, comparisonAmount: 5200, comparisonCount: 35 },
  { date: '2025-11-06', amount: 8200, count: 53, comparisonAmount: 5600, comparisonCount: 38 },
  { date: '2025-11-07', amount: 9100, count: 56, comparisonAmount: 5900, comparisonCount: 39 },
  { date: '2025-11-08', amount: 8700, count: 55, comparisonAmount: 5700, comparisonCount: 38 },
  { date: '2025-11-09', amount: 9300, count: 58, comparisonAmount: 6100, comparisonCount: 40 },
  { date: '2025-11-10', amount: 10100, count: 60, comparisonAmount: 6400, comparisonCount: 41 },
];

const primaryWeekly = [
  { date: '2025-W43', amount: 29500, count: 280, comparisonAmount: 21500, comparisonCount: 210 },
  { date: '2025-W44', amount: 33600, count: 305, comparisonAmount: 24000, comparisonCount: 225 },
  { date: '2025-W45', amount: 40400, count: 332, comparisonAmount: 26800, comparisonCount: 243 },
  { date: '2025-W46', amount: 45200, count: 349, comparisonAmount: 28900, comparisonCount: 256 },
];

const firstInstallmentsDaily = [
  { date: '2025-11-01', amount: 2100, count: 18, comparisonAmount: 1600, comparisonCount: 14 },
  { date: '2025-11-05', amount: 2300, count: 19, comparisonAmount: 1700, comparisonCount: 15 },
  { date: '2025-11-10', amount: 2600, count: 21, comparisonAmount: 1800, comparisonCount: 16 },
];

const oneTimeDaily = [
  { date: '2025-11-01', amount: 3800, count: 30, comparisonAmount: 2500, comparisonCount: 22 },
  { date: '2025-11-05', amount: 4100, count: 31, comparisonAmount: 2700, comparisonCount: 23 },
  { date: '2025-11-10', amount: 4600, count: 33, comparisonAmount: 2900, comparisonCount: 24 },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);

const formatShortDate = (value) => {
  try {
    const d = new Date(value);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return value;
  }
};

const CustomTooltip = ({ active, payload, label, title }) => {
  if (active && payload && payload.length) {
    const main = payload.find((p) => p.dataKey === 'amount');
    const comparison = payload.find((p) => p.dataKey === 'comparisonAmount');
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[220px]">
        <div className="text-sm font-medium text-gray-900 mb-2">{title || 'Total Raised'}</div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{formatShortDate(label)}</span>
          <span className="text-blue-700 font-semibold">{formatCurrency(main?.value || 0)}</span>
        </div>
        {main?.payload?.count !== undefined && (
          <div className="text-xs text-gray-600 mt-1">{main.payload.count} donations</div>
        )}
        {comparison && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Comparison</span>
              <span className="text-orange-600 font-semibold">{formatCurrency(comparison.value || 0)}</span>
            </div>
            {comparison?.payload?.comparisonCount !== undefined && (
              <div className="text-xs text-gray-600 mt-1">
                {comparison.payload.comparisonCount} donations
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  return null;
};

const PrimaryRevenueDashboard = () => {
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

  const raisedData = useMemo(
    () => (granularity === 'weekly' ? primaryWeekly : primaryDaily),
    [granularity],
  );

  const firstData = useMemo(() => firstInstallmentsDaily, []);
  const oneTimeData = useMemo(() => oneTimeDaily, []);

  const totalRaised = raisedData.reduce((sum, item) => sum + item.amount, 0);
  const totalCount = raisedData.reduce((sum, item) => sum + (item.count || 0), 0);
  const firstTotal = firstData.reduce((sum, item) => sum + item.amount, 0);
  const firstCount = firstData.reduce((sum, item) => sum + (item.count || 0), 0);
  const oneTimeTotal = oneTimeData.reduce((sum, item) => sum + item.amount, 0);
  const oneTimeCount = oneTimeData.reduce((sum, item) => sum + (item.count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header with range status and controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {localRange ? (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
              Global Range
            </span>
          ) : (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
              Custom Range
            </span>
          )}
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

      {/* Main metric */}
      <div>
        <div className="text-4xl font-bold text-gray-900">{formatCurrency(totalRaised)}</div>
        <div className="text-sm text-gray-600 mt-1">{totalCount} donations</div>
      </div>

      {/* Main chart */}
      <div className="h-64 bg-white rounded-lg border border-gray-200 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={raisedData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorCompare" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatShortDate}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={<CustomTooltip title="Total Raised" />}
              cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            {comparisonRange && (
              <Area
                type="monotone"
                dataKey="comparisonAmount"
                stroke="#f97316"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="url(#colorCompare)"
              />
            )}
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorAmount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {comparisonRange && (
        <div className="flex items-center justify-center gap-6 text-xs sm:text-sm bg-gray-50 py-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-blue-500 rounded-sm"></div>
            <span className="text-gray-700 font-medium">Current Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-orange-500 rounded-sm opacity-70"></div>
            <span className="text-gray-700 font-medium">Comparison Period</span>
          </div>
        </div>
      )}

      {/* Sub-sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900">First installments</h3>
            <div className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors">
              <span className="text-xs text-gray-600">?</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(firstTotal)}</div>
          <div className="text-xs text-gray-600">{firstCount} installments</div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={firstData}>
                <defs>
                  <linearGradient id="colorFirst" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorFirstCompare" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip content={<CustomTooltip title="First installments" />} />
                {comparisonRange && (
                  <Area
                    type="monotone"
                    dataKey="comparisonAmount"
                    stroke="#f97316"
                    strokeWidth={1.25}
                    strokeDasharray="3 3"
                    fill="url(#colorFirstCompare)"
                  />
                )}
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={1.5} fill="url(#colorFirst)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900">One-time donations</h3>
            <div className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors">
              <span className="text-xs text-gray-600">?</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(oneTimeTotal)}</div>
          <div className="text-xs text-gray-600">{oneTimeCount} donations</div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={oneTimeData}>
                <defs>
                  <linearGradient id="colorOneTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorOneTimeCompare" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip content={<CustomTooltip title="One-time donations" />} />
                {comparisonRange && (
                  <Area
                    type="monotone"
                    dataKey="comparisonAmount"
                    stroke="#f97316"
                    strokeWidth={1.25}
                    strokeDasharray="3 3"
                    fill="url(#colorOneTimeCompare)"
                  />
                )}
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={1.5} fill="url(#colorOneTime)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimaryRevenueDashboard;
