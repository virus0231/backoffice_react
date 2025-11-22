import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import ComparisonDatePicker from '../filters/ComparisonDatePicker';
import './PrimaryRevenueDashboard.css';

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
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 5000) + 2000,
        count: Math.floor(Math.random() * 50) + 10,
        comparisonAmount: comparisonRange ? Math.floor(Math.random() * 4500) + 1800 : undefined,
        comparisonCount: comparisonRange ? Math.floor(Math.random() * 45) + 8 : undefined
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

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const CustomTooltip = ({ active, payload, label, title }) => {
    if (active && payload && payload.length) {
      const mainData = payload.find(p => p.dataKey === 'amount' || p.dataKey === 'comparisonAmount');

      const formatFullDate = (dateStr) => {
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return dateStr;
          return date.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        } catch {
          return dateStr;
        }
      };

      return (
        <div className="custom-tooltip">
          <div className="tooltip-title">{title || 'Total Raised'}</div>

          <div className="tooltip-section">
            <div className="tooltip-period-header">
              <div className="tooltip-period-label">Current Period</div>
              <div className="tooltip-period-date">{formatFullDate(mainData?.payload?.date || label)}</div>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Amount:</span>
              <span className="tooltip-value-current">{formatCurrency(mainData?.payload?.amount || 0)}</span>
            </div>
            {mainData?.payload?.count !== undefined && (
              <div className="tooltip-row">
                <span className="tooltip-label">Count:</span>
                <span className="tooltip-count">{mainData.payload.count.toLocaleString()}</span>
              </div>
            )}
          </div>

          {comparisonRange && mainData?.payload?.comparisonAmount !== undefined && (
            <div className="tooltip-section tooltip-comparison">
              <div className="tooltip-period-header">
                <div className="tooltip-period-label">Comparison Period</div>
                <div className="tooltip-period-date">{formatFullDate(mainData?.payload?.comparisonDate || label)}</div>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-label">Amount:</span>
                <span className="tooltip-value-comparison">{formatCurrency(mainData.payload.comparisonAmount)}</span>
              </div>
              {mainData?.payload?.comparisonCount !== undefined && (
                <div className="tooltip-row">
                  <span className="tooltip-label">Count:</span>
                  <span className="tooltip-count">{mainData.payload.comparisonCount.toLocaleString()}</span>
                </div>
              )}
              {mainData.payload.comparisonAmount > 0 && (
                <div className="tooltip-row">
                  <span className="tooltip-label">Change:</span>
                  <span className={`tooltip-change ${
                    mainData.payload.amount > mainData.payload.comparisonAmount ? 'positive' : 'negative'
                  }`}>
                    {((mainData.payload.amount - mainData.payload.comparisonAmount) / mainData.payload.comparisonAmount * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="primary-revenue-dashboard">
      {/* Chart Controls */}
      <div className="chart-controls">
        <div className="chart-controls-left">
          <span className="range-badge global">Global Range</span>
        </div>

        <div className="chart-controls-right">
          <ComparisonDatePicker
            value={comparisonRange}
            onChange={setComparisonRange}
            mainDateRange={mainDateRange}
          />

          <div className="granularity-toggle">
            <button
              onClick={() => setGranularity('daily')}
              className={`granularity-btn ${granularity === 'daily' ? 'active' : ''}`}
            >
              Daily
            </button>
            <button
              onClick={() => setGranularity('weekly')}
              className={`granularity-btn ${granularity === 'weekly' ? 'active' : ''}`}
            >
              Weekly
            </button>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="main-metrics">
        <div className="metric-value">{formatCurrency(totalRaised)}</div>
        <div className="metric-label">{totalCount.toLocaleString()} donations</div>
      </div>

      {/* Main Chart */}
      <div className="main-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={totalRaisedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="mainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="comparisonGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              interval="preserveStartEnd"
              tickFormatter={formatDate}
            />
            <YAxis hide />
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
                fill="url(#comparisonGradient)"
              />
            )}
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#mainGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      {comparisonRange && (
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color current-period" />
            <span className="legend-label">Current Period</span>
          </div>
          <div className="legend-item">
            <div className="legend-color comparison-period" />
            <span className="legend-label">Comparison Period</span>
          </div>
        </div>
      )}

      {/* Sub-sections */}
      <div className="sub-sections">
        {/* First Installments */}
        <div className="sub-section">
          <div className="sub-section-header">
            <h3 className="sub-section-title">First installments</h3>
            <div className="help-tooltip">
              <div className="help-icon">?</div>
              <div className="help-tooltip-content">
                <div className="help-tooltip-title">First Installments</div>
                <p>The initial payment from new recurring donation subscriptions. This tracks revenue from donors who just signed up for monthly, quarterly, or annual recurring giving and made their first payment during the selected period.</p>
              </div>
            </div>
          </div>

          <div className="sub-section-metrics">
            <div className="sub-metric-value">{formatCurrency(firstInstallmentsTotal)}</div>
            <div className="sub-metric-label">{firstInstallmentsCount} installments</div>
          </div>

          <div className="sub-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={firstInstallmentsData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="firstInstallmentsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis hide />
                <YAxis hide />
                <Tooltip
                  content={<CustomTooltip title="First Installments" />}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  fill="url(#firstInstallmentsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* One-time Donations */}
        <div className="sub-section">
          <div className="sub-section-header">
            <h3 className="sub-section-title">One-time donations</h3>
            <div className="help-tooltip">
              <div className="help-icon">?</div>
              <div className="help-tooltip-content">
                <div className="help-tooltip-title">One-time Donations</div>
                <p>Revenue from single, non-recurring donations made during the selected period. This includes all one-time contributions that are not part of a recurring subscription or installment plan.</p>
              </div>
            </div>
          </div>

          <div className="sub-section-metrics">
            <div className="sub-metric-value">{formatCurrency(oneTimeTotal)}</div>
            <div className="sub-metric-label">{oneTimeCount} donations</div>
          </div>

          <div className="sub-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={oneTimeData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="oneTimeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis hide />
                <YAxis hide />
                <Tooltip
                  content={<CustomTooltip title="One-time Donations" />}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  fill="url(#oneTimeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimaryRevenueDashboard;
