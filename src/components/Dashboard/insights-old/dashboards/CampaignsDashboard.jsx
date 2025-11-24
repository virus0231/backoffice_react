import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

const CampaignsDashboard = () => {
  const [sortBy, setSortBy] = useState('revenue');

  // Sample campaigns data
  const campaignsData = [
    { name: 'Holiday Campaign 2024', revenue: 45200, donations: 850, avgDonation: 53.18 },
    { name: 'Summer Fundraiser', revenue: 38500, donations: 720, avgDonation: 53.47 },
    { name: 'Back to School', revenue: 32100, donations: 610, avgDonation: 52.62 },
    { name: 'Spring Drive', revenue: 28900, donations: 540, avgDonation: 53.52 },
    { name: 'Winter Appeal', revenue: 24300, donations: 480, avgDonation: 50.63 },
    { name: 'Fall Giving', revenue: 19800, donations: 390, avgDonation: 50.77 },
  ];

  const sortedData = [...campaignsData].sort((a, b) =>
    sortBy === 'revenue' ? b.revenue - a.revenue : b.donations - a.donations
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="text-sm font-medium text-gray-900 mb-2">{data.name}</div>
          <div className="text-xs text-gray-600">Revenue: {formatCurrency(data.revenue)}</div>
          <div className="text-xs text-gray-600">Donations: {data.donations}</div>
          <div className="text-xs text-gray-600">Avg: {formatCurrency(data.avgDonation)}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Campaigns</h2>
        <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
          <button
            onClick={() => setSortBy('revenue')}
            className={`px-3 py-1 text-xs rounded transition-all ${
              sortBy === 'revenue'
                ? 'bg-white text-gray-900 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            By Revenue
          </button>
          <button
            onClick={() => setSortBy('donations')}
            className={`px-3 py-1 text-xs rounded transition-all ${
              sortBy === 'donations'
                ? 'bg-white text-gray-900 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            By Donations
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Campaign Performance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Campaign</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-600">Revenue</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-600">Donations</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-600">Avg Donation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.map((campaign, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{campaign.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                  {formatCurrency(campaign.revenue)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {campaign.donations}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {formatCurrency(campaign.avgDonation)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignsDashboard;
