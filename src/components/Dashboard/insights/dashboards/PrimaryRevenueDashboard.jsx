import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import ComparisonDatePicker from '../filters/ComparisonDatePicker';

const PrimaryRevenueDashboard = () => {
  const [granularity, setGranularity] = useState('daily');
  const [comparisonRange, setComparisonRange] = useState(null);

  // Main date range (last 30 days by default)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const mainDateRange = {
    startDate: thirtyDaysAgo,
    endDate: today
  };

  // Sample data
  const generateSampleData = () => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 5000) + 2000,
        count: Math.floor(Math.random() * 50) + 10,
        comparisonAmount: comparisonRange ? Math.floor(Math.random() * 4500) + 1800 : undefined
      });
    }
    return data;
  };

  const totalRaisedData = generateSampleData();
  const firstInstallmentsData = generateSampleData();
  const oneTimeData = generateSampleData();

  const totalRaised = totalRaisedData.reduce((sum, item) => sum + item.amount, 0);
  const totalCount = totalRaisedData.reduce((sum, item) => sum + item.count, 0);
  const firstInstallmentsTotal = firstInstallmentsData.reduce((sum, item) => sum + item.amount, 0);
  const firstInstallmentsCount = firstInstallmentsData.reduce((sum, item) => sum + item.count, 0);
  const oneTimeTotal = oneTimeData.reduce((sum, item) => sum + item.amount, 0);
  const oneTimeCount = oneTimeData.reduce((sum, item) => sum + item.count, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[220px]">
          <div className="text-sm font-medium text-gray-900 mb-2">{label}</div>
          <div className="text-lg font-bold text-blue-600">
            {formatCurrency(payload[0].value)}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {payload[0].payload.count} donations
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header with badge and controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">Global Range</span>
        </div>

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

      {/* Main Total Raised */}
      <div>
        <div className="text-4xl font-bold text-gray-900">{formatCurrency(totalRaised)}</div>
        <div className="text-sm text-gray-600 mt-1">{totalCount} donations</div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={totalRaisedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAmount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sub-sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
        {/* First installments */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-gray-700">First installments</h3>
            <div className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors">
              <span className="text-xs text-gray-600">?</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(firstInstallmentsTotal)}</div>
          <div className="text-xs text-gray-600 mb-3">{firstInstallmentsCount} installments</div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={firstInstallmentsData}>
                <defs>
                  <linearGradient id="colorFirst" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={1.5} fill="url(#colorFirst)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* One-time donations */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-gray-700">One-time donations</h3>
            <div className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-help transition-colors">
              <span className="text-xs text-gray-600">?</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(oneTimeTotal)}</div>
          <div className="text-xs text-gray-600 mb-3">{oneTimeCount} donations</div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={oneTimeData}>
                <defs>
                  <linearGradient id="colorOneTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
