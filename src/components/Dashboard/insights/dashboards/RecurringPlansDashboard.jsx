import { useState } from 'react';
import ComparisonDatePicker from '../filters/ComparisonDatePicker';
import SimpleLineChart from '../charts/SimpleLineChart';
import './RecurringPlansDashboard.css';

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
    <div className="recurring-plans-dashboard">
      {/* Header Controls */}
      <div className="dashboard-header">
        {/* Left side - Title and Range Status */}
        <div className="header-left">
          <h2 className="dashboard-title">Recurring plans</h2>
          <span className="range-badge global">Global Range</span>
        </div>

        {/* Right side - Controls */}
        <div className="header-right">
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

      {/* Grid of 3 charts */}
      <div className="charts-grid">
        {/* Active plans */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-title-wrapper">
              <h3 className="chart-title">Active plans</h3>
              <div className="help-tooltip">
                <div className="help-icon">?</div>
                <div className="help-tooltip-content">
                  <div className="help-tooltip-title">Active Plans</div>
                  <p>Total number of active recurring donation subscriptions at the end of the selected period. This represents all ongoing monthly, quarterly, or annual recurring donations that are currently active and processing payments.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="chart-metrics">
            <div className="metric-value-large">{activePlansTotal}</div>
            {comparisonRange && activePlansData[0]?.comparisonValue !== undefined && (
              <div className="comparison-text">
                vs {activePlansData[0]?.comparisonValue} (comparison period)
              </div>
            )}
          </div>
          <div className="chart-container-small">
            <SimpleLineChart data={activePlansData} color="#3b82f6" height={128} />
          </div>
        </div>

        {/* New plans */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-title-wrapper">
              <h3 className="chart-title">New plans</h3>
              <div className="help-tooltip">
                <div className="help-icon">?</div>
                <div className="help-tooltip-content">
                  <div className="help-tooltip-title">New Plans</div>
                  <p>Number of new recurring donation subscriptions created during the selected period. This tracks donors who signed up for monthly, quarterly, or annual recurring donations. Use this to measure subscription growth and acquisition success.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="chart-metrics">
            <div className="metric-value-large">{newPlansTotal}</div>
            {comparisonRange && (
              <div className="comparison-text">
                in selected period
              </div>
            )}
          </div>
          <div className="chart-container-small">
            <SimpleLineChart data={newPlansData} color="#3b82f6" height={128} />
          </div>
        </div>

        {/* Canceled plans */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-title-wrapper">
              <h3 className="chart-title">Canceled plans</h3>
              <div className="help-tooltip">
                <div className="help-icon">?</div>
                <div className="help-tooltip-content">
                  <div className="help-tooltip-title">Canceled Plans</div>
                  <p>Number of recurring donation subscriptions that were canceled during the selected period. This includes both donor-initiated cancellations and payment failures. Monitor this metric to identify retention issues and trends. Note: Appeal and fund filters do not apply to this metric.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="chart-metrics">
            <div className="metric-value-large">{canceledPlansTotal}</div>
            {comparisonRange && (
              <div className="comparison-text">
                in selected period
              </div>
            )}
          </div>
          <div className="chart-container-small">
            <SimpleLineChart data={canceledPlansData} color="#3b82f6" height={128} />
          </div>

          {/* Cancellation Reasons */}
          {canceledPlansTotal > 0 && (
            <div className="cancellation-reasons">
              <div className="reasons-bar-wrapper">
                <div className="reasons-bar"></div>
              </div>
              <div className="reasons-list">
                <div className="reason-item">
                  <div className="reason-color blue"></div>
                  <span className="reason-label">No reason given</span>
                  <span className="reason-value">83%</span>
                </div>
                <div className="reason-item">
                  <div className="reason-color purple"></div>
                  <span className="reason-label">Life changes</span>
                  <span className="reason-value">17%</span>
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
