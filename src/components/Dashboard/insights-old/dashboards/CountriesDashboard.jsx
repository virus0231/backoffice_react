import { useState } from 'react';

const CountriesDashboard = () => {
  const [viewMode, setViewMode] = useState('list');

  // Sample countries data
  const countriesData = [
    { name: 'United States', code: 'US', revenue: 85200, donations: 1850, percentage: 42 },
    { name: 'United Kingdom', code: 'GB', revenue: 42100, donations: 920, percentage: 21 },
    { name: 'Canada', code: 'CA', revenue: 28500, donations: 640, percentage: 14 },
    { name: 'Australia', code: 'AU', revenue: 19200, donations: 430, percentage: 9 },
    { name: 'Germany', code: 'DE', revenue: 12800, donations: 290, percentage: 6 },
    { name: 'France', code: 'FR', revenue: 8900, donations: 210, percentage: 4 },
    { name: 'Netherlands', code: 'NL', revenue: 4200, donations: 95, percentage: 2 },
    { name: 'Other', code: 'XX', revenue: 2100, donations: 48, percentage: 2 },
  ];

  const totalRevenue = countriesData.reduce((sum, country) => sum + country.revenue, 0);
  const totalDonations = countriesData.reduce((sum, country) => sum + country.donations, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCountryFlag = (code) => {
    if (code === 'XX') return '🌍';
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Countries</h2>
        <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-xs rounded transition-all ${
              viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-1 text-xs rounded transition-all ${
              viewMode === 'chart'
                ? 'bg-white text-gray-900 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Chart
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
          <div className="text-xs text-gray-600 mt-1">{countriesData.length} countries</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm text-gray-600 mb-1">Total Donations</div>
          <div className="text-3xl font-bold text-gray-900">{totalDonations}</div>
          <div className="text-xs text-gray-600 mt-1">
            Avg: {formatCurrency(totalRevenue / totalDonations)}
          </div>
        </div>
      </div>

      {/* Countries List/Chart */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Country</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600">Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600">Donations</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {countriesData.map((country, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCountryFlag(country.code)}</span>
                      <span>{country.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                    {formatCurrency(country.revenue)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {country.donations}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {country.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Revenue by Country</h3>
          <div className="space-y-4">
            {countriesData.map((country, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <span className="text-xl">{getCountryFlag(country.code)}</span>
                    <span>{country.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(country.revenue)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${country.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountriesDashboard;
