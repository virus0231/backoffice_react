import { useState } from 'react';
import './MonthlyReport.css';

const MonthlyReport = () => {
  const stats = [
    { label: 'Total Amount This Mo.', value: '$6,928', color: 'blue' },
    { label: 'Total Amount Raised', value: '$9,838,928.847', color: 'green' },
    { label: 'Failed Donors', value: '12287', color: 'yellow' },
    { label: 'Last Failed Date', value: '2025-09-28 16:02:28', color: 'red' }
  ];

  const chartData = [
    { month: 'Jan', value: 11200 },
    { month: 'Feb', value: 3800 },
    { month: 'Mar', value: 0 },
    { month: 'Apr', value: 12800 },
    { month: 'May', value: 0 },
    { month: 'Jun', value: 4200 },
    { month: 'Jul', value: 4800 },
    { month: 'Aug', value: 3400 }
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));

  const activeDonors = [
    { name: 'Abdirahman Effendi', email: 'saqibrahim@yahoo.com', phone: '4032666612', lastDonation: '2025-09-26 15:45:57' },
    { name: 'Adan Maali', email: 'qanisilwan@yahoo.com', phone: '4674668474', lastDonation: '2025-03-26 19:49:56' },
    { name: 'Ali Elgmala', email: 'ganovdmil@gmail.com', phone: '8143739196', lastDonation: '2025-09-26 18:02:28' }
  ];

  return (
    <div className="monthly-report-page">
      <div className="monthly-report-header">
        <h1 className="monthly-report-title">Monthly Donor Report Dashboard</h1>
      </div>

      <div className="monthly-report-content">
        {/* Stat Cards */}
        <div className="stat-cards">
          {stats.map((stat, index) => (
            <div key={index} className={`stat-card stat-${stat.color}`}>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          ))}
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
                {activeDonors.map((donor, index) => (
                  <tr key={index}>
                    <td className="donor-name">{donor.name}</td>
                    <td className="donor-email">{donor.email}</td>
                    <td className="donor-phone">{donor.phone}</td>
                    <td className="donor-date">{donor.lastDonation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
