import { useState } from 'react';
import './Donation.css';

const Donation = () => {
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    paymentStatus: '',
    search: '',
    donations: '',
    frequency: '',
    orderSearch: '',
    paymentType: ''
  });

  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGetReport = () => {
    console.log('Get Report with filters:', filters);
    // Implement report generation logic
    alert('Getting report with current filters...');
  };

  const handleExportDetailCSV = () => {
    console.log('Export Detail CSV with filters:', filters);
    // Implement CSV export logic
    alert('Exporting detailed CSV...');
  };

  const handleExportSummaryCSV = () => {
    console.log('Export Summary CSV with filters:', filters);
    // Implement CSV export logic
    alert('Exporting summary CSV...');
  };

  const handleAction = (donation) => {
    console.log('Action for donation:', donation);
    alert(`Action for donation: ${donation.name}`);
  };

  return (
    <div className="donation-page">
      <div className="donation-header">
        <h1 className="donation-title">Donations</h1>
        <div className="donation-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Donations</span>
        </div>
      </div>

      <div className="donation-content">
        <div className="filter-section">
          <div className="filter-row">
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

            <div className="filter-group search-filter">
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
          </div>

          <div className="filter-row">
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

            <div className="filter-group search-filter">
              <label htmlFor="order-search">Search :</label>
              <input
                type="text"
                id="order-search"
                className="text-input"
                placeholder="Order Id/Transaction Id"
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
          </div>

          <div className="action-buttons-row">
            <button className="report-btn" onClick={handleGetReport}>
              Get Report
            </button>
            <button className="export-btn" onClick={handleExportDetailCSV}>
              Export Detail CSV
            </button>
            <button className="export-btn" onClick={handleExportSummaryCSV}>
              Export Summary CSV
            </button>
          </div>
        </div>

        <div className="donation-table-container">
          <table className="donation-table">
            <thead>
              <tr>
                <th>SNO</th>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.length > 0 ? (
                filteredDonations.map((donation, index) => (
                  <tr key={donation.id}>
                    <td>{index + 1}</td>
                    <td className="donation-date">{donation.date}</td>
                    <td className="donation-name">{donation.name}</td>
                    <td className="donation-email">{donation.email}</td>
                    <td className="donation-amount">${donation.amount}</td>
                    <td>
                      <span className={`status-badge status-${donation.status.toLowerCase()}`}>
                        {donation.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="table-action-btn"
                        onClick={() => handleAction(donation)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No donations found. Use filters to search for donations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Donation;
