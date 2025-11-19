import { useState } from 'react';
import './FundReport.css';

const FundReport = () => {
  const [filters, setFilters] = useState({
    fund: '',
    fromDate: '',
    toDate: ''
  });

  const [funds, setFunds] = useState([
    { id: 1, name: 'Unknown Fund', totalAmount: 77721.36, donations: 1113 },
    { id: 2, name: '100k Grand Initiative', totalAmount: 1862.00, donations: 52 },
    { id: 3, name: 'A Good Deed Legacy Fund', totalAmount: 2090.84, donations: 8 },
    { id: 4, name: 'AAMAAL Justice Fund', totalAmount: 25000.00, donations: 1 },
    { id: 5, name: 'AAMAAL-Mumtaz and Sadiq Mohammad Khan', totalAmount: 25000.00, donations: 1 }
  ]);

  const totalAmount = funds.reduce((sum, fund) => sum + fund.totalAmount, 0);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilter = () => {
    console.log('Filter with:', filters);
    alert('Filtering fund report...');
  };

  return (
    <div className="fund-report-page">
      <div className="fund-report-header">
        <h1 className="fund-report-title">Fund Report</h1>
        <div className="fund-report-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Report</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Fund</span>
        </div>
      </div>

      <div className="fund-report-content">
        <div className="filter-box">
          <h2 className="filter-title">Filter Fund Report</h2>
          <div className="filter-row">
            <div className="filter-field">
              <label htmlFor="fund">Select Fund:</label>
              <select
                id="fund"
                className="select-input"
                value={filters.fund}
                onChange={(e) => handleFilterChange('fund', e.target.value)}
              >
                <option value="">Select Fund</option>
                <option value="unknown">Unknown Fund</option>
                <option value="100k">100k Grand Initiative</option>
                <option value="good-deed">A Good Deed Legacy Fund</option>
                <option value="justice">AAMAAL Justice Fund</option>
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="from-date">From Date:</label>
              <input
                type="date"
                id="from-date"
                className="date-input"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              />
            </div>

            <div className="filter-field">
              <label htmlFor="to-date">To Date:</label>
              <input
                type="date"
                id="to-date"
                className="date-input"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
              />
            </div>

            <button className="filter-button" onClick={handleFilter}>
              Filter
            </button>
          </div>
        </div>

        <div className="total-amount-box">
          <span className="total-label">Total Amount in Fund Report:</span>
          <span className="total-value">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="summary-section">
          <h2 className="summary-title">All Fund Summary</h2>
          <div className="summary-table-container">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fund Name</th>
                  <th>Total Amount</th>
                  <th>Number of Donations</th>
                </tr>
              </thead>
              <tbody>
                {funds.map((fund, index) => (
                  <tr key={fund.id}>
                    <td>{index + 1}</td>
                    <td className="fund-name">{fund.name}</td>
                    <td className="fund-amount">${fund.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="fund-donations">{fund.donations}</td>
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

export default FundReport;
