import { useState } from 'react';
import './DonationsReport.css';

const DonationsReport = () => {
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    paymentStatus: '',
    search: '',
    donations: '',
    orderSearch: '',
    paymentType: '',
    frequency: '',
    season: ''
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExportDetailCSV = () => {
    console.log('Export Detail CSV with filters:', filters);
    // Implement CSV export logic
    alert('Exporting detailed CSV with current filters...');
  };

  const handleExportSummaryCSV = () => {
    console.log('Export Summary CSV with filters:', filters);
    // Implement CSV export logic
    alert('Exporting summary CSV with current filters...');
  };

  return (
    <div className="donations-report-page">
      <div className="donations-report-header">
        <h1 className="donations-report-title">Donations Report</h1>
        <div className="donations-report-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Report</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Donations</span>
        </div>
      </div>

      <div className="donations-report-content">
        <div className="report-filter-section">
          <div className="filter-grid">
            <div className="filter-group">
              <label htmlFor="from-date">From:</label>
              <input
                type="date"
                id="from-date"
                className="date-input"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="to-date">To:</label>
              <input
                type="date"
                id="to-date"
                className="date-input"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="payment-status">Payment Status:</label>
              <select
                id="payment-status"
                className="select-input"
                value={filters.paymentStatus}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              >
                <option value="">Select</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="search">Search :</label>
              <input
                type="text"
                id="search"
                className="text-input"
                placeholder="Email/Phone/FirstName/Lastname"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="donations">Donations:</label>
              <input
                type="text"
                id="donations"
                className="text-input"
                value={filters.donations}
                onChange={(e) => handleFilterChange('donations', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="order-search">Search :</label>
              <input
                type="text"
                id="order-search"
                className="text-input"
                placeholder="Order Id or Transaction Id"
                value={filters.orderSearch}
                onChange={(e) => handleFilterChange('orderSearch', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="payment-type">Payment Type:</label>
              <select
                id="payment-type"
                className="select-input"
                value={filters.paymentType}
                onChange={(e) => handleFilterChange('paymentType', e.target.value)}
              >
                <option value="">Select</option>
                <option value="credit-card">Credit Card</option>
                <option value="debit-card">Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <div className="filter-group empty-space"></div>

            <div className="filter-group">
              <label htmlFor="frequency">Frequency:</label>
              <select
                id="frequency"
                className="select-input"
                value={filters.frequency}
                onChange={(e) => handleFilterChange('frequency', e.target.value)}
              >
                <option value="">Select</option>
                <option value="one-time">One-Time</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="season">Season:</label>
              <select
                id="season"
                className="select-input"
                value={filters.season}
                onChange={(e) => handleFilterChange('season', e.target.value)}
              >
                <option value="">Select Season</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="fall">Fall</option>
                <option value="winter">Winter</option>
                <option value="ramadan">Ramadan</option>
                <option value="year-end">Year-End</option>
              </select>
            </div>
          </div>

          <div className="export-buttons-row">
            <button className="export-detail-btn" onClick={handleExportDetailCSV}>
              Export Detail CSV
            </button>
            <button className="export-summary-btn" onClick={handleExportSummaryCSV}>
              Export Summary CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationsReport;
