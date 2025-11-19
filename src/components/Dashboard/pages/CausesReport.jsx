import { useState } from 'react';
import './CausesReport.css';

const CausesReport = () => {
  const [filters, setFilters] = useState({
    appeal: '',
    amount: '',
    fundList: '',
    featuredAmount: '',
    fundAmount: '',
    category: '',
    country: ''
  });

  const [causes, setCauses] = useState([
    { id: 1, appeal: 'General Appeal', amount: 45000.00, fundList: 'General Fund', category: 'Education', country: 'USA', donations: 150 },
    { id: 2, appeal: 'Emergency Relief', amount: 32500.50, fundList: 'Emergency Fund', category: 'Relief', country: 'Pakistan', donations: 98 },
    { id: 3, appeal: 'Orphan Support', amount: 28900.75, fundList: 'Orphan Fund', category: 'Welfare', country: 'Syria', donations: 112 },
    { id: 4, appeal: 'Medical Aid', amount: 19800.00, fundList: 'Medical Fund', category: 'Healthcare', country: 'Yemen', donations: 67 },
    { id: 5, appeal: 'Water Projects', amount: 15600.25, fundList: 'Water Fund', category: 'Infrastructure', country: 'Somalia', donations: 45 }
  ]);

  const totalAmount = causes.reduce((sum, cause) => sum + cause.amount, 0);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilter = () => {
    console.log('Filter with:', filters);
    alert('Filtering causes report...');
  };

  return (
    <div className="causes-report-page">
      <div className="causes-report-header">
        <h1 className="causes-report-title">Causes Report</h1>
        <div className="causes-report-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Report</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Causes</span>
        </div>
      </div>

      <div className="causes-report-content">
        <div className="filter-box">
          <h2 className="filter-title">Filter Causes Report</h2>
          <div className="filter-row">
            <div className="filter-field">
              <label htmlFor="appeal">Appeal:</label>
              <select
                id="appeal"
                className="select-input"
                value={filters.appeal}
                onChange={(e) => handleFilterChange('appeal', e.target.value)}
              >
                <option value="">Select Appeal</option>
                <option value="general">General Appeal</option>
                <option value="emergency">Emergency Relief</option>
                <option value="orphan">Orphan Support</option>
                <option value="medical">Medical Aid</option>
                <option value="water">Water Projects</option>
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="amount">Amount:</label>
              <input
                type="number"
                id="amount"
                className="text-input"
                placeholder="Enter amount"
                value={filters.amount}
                onChange={(e) => handleFilterChange('amount', e.target.value)}
              />
            </div>

            <div className="filter-field">
              <label htmlFor="fund-list">Fund List:</label>
              <select
                id="fund-list"
                className="select-input"
                value={filters.fundList}
                onChange={(e) => handleFilterChange('fundList', e.target.value)}
              >
                <option value="">Select Fund</option>
                <option value="general">General Fund</option>
                <option value="emergency">Emergency Fund</option>
                <option value="orphan">Orphan Fund</option>
                <option value="medical">Medical Fund</option>
                <option value="water">Water Fund</option>
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="featured-amount">Featured Amount:</label>
              <input
                type="number"
                id="featured-amount"
                className="text-input"
                placeholder="Featured amount"
                value={filters.featuredAmount}
                onChange={(e) => handleFilterChange('featuredAmount', e.target.value)}
              />
            </div>

            <div className="filter-field">
              <label htmlFor="fund-amount">Fund-Amount:</label>
              <input
                type="number"
                id="fund-amount"
                className="text-input"
                placeholder="Fund amount"
                value={filters.fundAmount}
                onChange={(e) => handleFilterChange('fundAmount', e.target.value)}
              />
            </div>

            <div className="filter-field">
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                className="select-input"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">Select Category</option>
                <option value="education">Education</option>
                <option value="relief">Relief</option>
                <option value="welfare">Welfare</option>
                <option value="healthcare">Healthcare</option>
                <option value="infrastructure">Infrastructure</option>
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="country">Country:</label>
              <select
                id="country"
                className="select-input"
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              >
                <option value="">Select Country</option>
                <option value="usa">USA</option>
                <option value="pakistan">Pakistan</option>
                <option value="syria">Syria</option>
                <option value="yemen">Yemen</option>
                <option value="somalia">Somalia</option>
                <option value="afghanistan">Afghanistan</option>
                <option value="palestine">Palestine</option>
              </select>
            </div>

            <button className="filter-button" onClick={handleFilter}>
              Filter
            </button>
          </div>
        </div>

        <div className="total-amount-box">
          <span className="total-label">Total Amount in Causes Report:</span>
          <span className="total-value">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigals: 2 })}</span>
        </div>

        <div className="summary-section">
          <h2 className="summary-title">All Causes Summary</h2>
          <div className="summary-table-container">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Appeal</th>
                  <th>Amount</th>
                  <th>Fund List</th>
                  <th>Category</th>
                  <th>Country</th>
                  <th>Donations</th>
                </tr>
              </thead>
              <tbody>
                {causes.map((cause, index) => (
                  <tr key={cause.id}>
                    <td>{index + 1}</td>
                    <td className="cause-appeal">{cause.appeal}</td>
                    <td className="cause-amount">${cause.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="cause-fund">{cause.fundList}</td>
                    <td className="cause-category">{cause.category}</td>
                    <td className="cause-country">{cause.country}</td>
                    <td className="cause-donations">{cause.donations}</td>
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

export default CausesReport;
