import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FREQUENCIES = [
  { key: 'monthly', label: 'Monthly', color: '#8b5cf6' },
  { key: 'one_time', label: 'One-time', color: '#6366f1' },
  { key: 'yearly', label: 'Yearly', color: '#ec4899' },
  { key: 'weekly', label: 'Weekly', color: '#14b8a6' },
  { key: 'daily', label: 'Daily', color: '#06b6d4' },
];

const FrequenciesDashboard = () => {
  const [granularity, setGranularity] = useState('daily');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample chart data
  const chartData = [
    { date: '2025-01-01', monthly: 15000, one_time: 8500, yearly: 3200, weekly: 1200, daily: 450 },
    { date: '2025-01-05', monthly: 15800, one_time: 9100, yearly: 3400, weekly: 1150, daily: 500 },
    { date: '2025-01-10', monthly: 16200, one_time: 8900, yearly: 3600, weekly: 1300, daily: 420 },
    { date: '2025-01-15', monthly: 16500, one_time: 9500, yearly: 3500, weekly: 1250, daily: 480 },
    { date: '2025-01-20', monthly: 17000, one_time: 9800, yearly: 3700, weekly: 1400, daily: 460 },
  ];

  // Sample table data
  const tableData = [
    { frequency: 'Monthly', donations: 235, totalRaised: 82300 },
    { frequency: 'One-time', donations: 412, totalRaised: 46800 },
    { frequency: 'Yearly', donations: 18, totalRaised: 17600 },
    { frequency: 'Weekly', donations: 56, totalRaised: 6500 },
    { frequency: 'Daily', donations: 8, totalRaised: 2300 },
  ];

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = tableData.slice(startIndex, endIndex);

  const legendTotals = FREQUENCIES.map(freq => {
    const total = tableData.find(d => d.frequency.toLowerCase() === freq.label.toLowerCase())?.totalRaised || 0;
    return { ...freq, total };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px]">
          <div className="text-sm font-medium text-gray-900 mb-2">{label}</div>
          {sortedPayload.map((entry, index) => (
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

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequencies</h2>
          <p className="text-sm text-gray-600 mt-1">Donations shown by frequency.</p>
        </div>

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

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    {legendTotals.map((freq) => (
                      <div key={freq.key} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: freq.color }}></div>
                        <span className="text-xs text-gray-700">{freq.label}</span>
                        <span className="text-xs font-medium text-gray-900">${freq.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
              {FREQUENCIES.map((freq) => (
                <Line
                  key={freq.key}
                  type="monotone"
                  dataKey={freq.key}
                  stroke={freq.color}
                  strokeWidth={2}
                  dot={false}
                  name={freq.label}
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
                Donation frequency
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
              const freq = FREQUENCIES.find(f => f.label.toLowerCase() === row.frequency.toLowerCase());
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: freq?.color || '#6b7280' }}></div>
                      <span className="text-sm text-gray-900">{row.frequency}</span>
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
      </div>
    </div>
  );
};

export default FrequenciesDashboard;
