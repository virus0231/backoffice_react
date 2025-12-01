import { useState, useEffect } from 'react';
import { getPhpApiBase } from '@/lib/config/phpApi';
import './MonthlyReport.css';

const BASE_URL = getPhpApiBase();

const MonthlyReport = () => {
  const [stats, setStats] = useState({
    thisMonth: 0,
    allTime: 0,
    failedDonors: 0,
    lastFailedDate: 'N/A'
  });
  const [chartData, setChartData] = useState([]);
  const [activeDonors, setActiveDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMonthlyReport();
  }, []);

  const fetchMonthlyReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/reports/monthly`, {
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success && result.data) {
        setStats(result.data.stats);
        setChartData(result.data.monthlyGrowth || []);
        setActiveDonors(result.data.activeDonors || []);
      } else {
        setError('Failed to load monthly report');
      }
    } catch (err) {
      console.error('Error fetching monthly report:', err);
      setError('Failed to load monthly report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 1;

  return (
    <div className="monthly-report-page">
      <div className="monthly-report-header">
        <h1 className="monthly-report-title">Monthly Donor Report Dashboard</h1>
      </div>

      <div className="monthly-report-content">
        {error && (
          <div className="users-error" style={{ marginBottom: 12 }}>
            <strong>Error:</strong> {error}
            <button
              onClick={fetchMonthlyReport}
              className="edit-btn"
              style={{ marginLeft: 12, padding: '6px 12px' }}
            >
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#666'
          }}>
            Loading monthly report...
          </div>
        )}

        {!loading && (
          <>
            {/* Stat Cards */}
            <div className="stat-cards">
              <div className="stat-card stat-blue">
                <div className="stat-label">Total Amount This Mo.</div>
                <div className="stat-value">${stats.thisMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="stat-card stat-green">
                <div className="stat-label">Total Amount Raised</div>
                <div className="stat-value">${stats.allTime.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="stat-card stat-yellow">
                <div className="stat-label">Failed Donors</div>
                <div className="stat-value">{stats.failedDonors.toLocaleString()}</div>
              </div>
              <div className="stat-card stat-red">
                <div className="stat-label">Last Failed Date</div>
                <div className="stat-value">{stats.lastFailedDate}</div>
              </div>
            </div>

        {/* Monthly Donor Growth Chart */}
        <div className="chart-section">
          <h2 className="chart-title">Monthly Donor Growth</h2>
          <div className="bar-chart">
            <div className="chart-y-axis">
              {[...Array(12)].map((_, i) => {
                const value = Math.round((maxValue / 11) * (11 - i));
                return (
                  <div key={i} className="y-axis-label">
                    {value.toLocaleString()}
                  </div>
                );
              })}
            </div>
            <div className="chart-content">
              <div className="chart-bars">
                {chartData.map((data, index) => (
                  <div key={index} className="bar-wrapper">
                    <div
                      className="bar"
                      style={{ height: `${(data.value / maxValue) * 100}%` }}
                    >
                      {data.value > 0 && (
                        <div className="bar-value">{data.value}</div>
                      )}
                    </div>
                    <div className="bar-label">{data.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Active Monthly Donors Table */}
        <div className="donors-section">
          <h2 className="donors-title">Active Monthly Donors</h2>
          <div className="donors-table-container">
            <table className="donors-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Last Donation</th>
                </tr>
              </thead>
              <tbody>
                {activeDonors.length > 0 ? (
                  activeDonors.map((donor, index) => (
                    <tr key={index}>
                      <td className="donor-name">{donor.name}</td>
                      <td className="donor-email">{donor.email}</td>
                      <td className="donor-phone">{donor.phone}</td>
                      <td className="donor-date">{donor.lastDonation}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">No active donors this month</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default MonthlyReport;
