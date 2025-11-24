import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const PaymentMethodsDashboard = () => {
  const [granularity, setGranularity] = useState('daily');

  // Sample payment methods data
  const paymentMethodsData = [
    { name: 'Credit Card', value: 45, count: 1250, color: '#3b82f6' },
    { name: 'PayPal', value: 28, count: 780, color: '#8b5cf6' },
    { name: 'Bank Transfer', value: 15, count: 420, color: '#10b981' },
    { name: 'Apple Pay', value: 8, count: 220, color: '#f59e0b' },
    { name: 'Google Pay', value: 4, count: 110, color: '#ef4444' },
  ];

  const total = paymentMethodsData.reduce((sum, method) => sum + method.count, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="text-sm font-medium text-gray-900">{payload[0].name}</div>
          <div className="text-xs text-gray-600 mt-1">
            {payload[0].payload.count} donations ({payload[0].value}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Payment methods</h2>
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

      {/* Chart and List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {paymentMethodsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-4">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-xs text-gray-600">Total donations</div>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Breakdown</h3>
          <div className="space-y-4">
            {paymentMethodsData.map((method, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: method.color }}
                  ></div>
                  <span className="text-sm text-gray-900">{method.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{method.count}</div>
                  <div className="text-xs text-gray-600">{method.value}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsDashboard;
