import { useState, useEffect } from 'react';
import './FundReport.css';

const BASE_URL = import.meta.env.DEV
  ? '/backoffice/yoc'
  : 'https://forgottenwomen.youronlineconversation.com/backoffice/yoc';

const FundReport = () => {
  const [filters, setFilters] = useState({
    fund: '',
    fromDate: '',
    toDate: ''
  });

  const [funds, setFunds] = useState([]);
  const [allFunds, setAllFunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchFunds();
    fetchAllFunds();
  }, []);

  const fetchAllFunds = async () => {
    try {
      const response = await fetch(`${BASE_URL}/funds.php`, {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success && result.data) {
        setAllFunds(result.data);
      }
    } catch (err) {
      console.error('Error fetching fund list:', err);
    }
  };

  const fetchFunds = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filterParams.fund) params.append('fund_id', filterParams.fund);
      if (filterParams.fromDate) params.append('from_date', filterParams.fromDate);
      if (filterParams.toDate) params.append('to_date', filterParams.toDate);

      const response = await fetch(`${BASE_URL}/fund-report.php?${params.toString()}`, {
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success) {
        setFunds(result.data);
        setTotalAmount(result.total_amount || 0);
      } else {
        setError('Failed to load fund report');
      }
    } catch (err) {
      console.error('Error fetching fund report:', err);
      setError('Failed to load fund report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilter = () => {
    fetchFunds(filters);
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
        {error && (
          <div className="users-error" style={{ marginBottom: 12 }}>
            <strong>Error:</strong> {error}
            <button
              onClick={() => fetchFunds()}
              className="edit-btn"
              style={{ marginLeft: 12, padding: '6px 12px' }}
            >
              Retry
            </button>
          </div>
        )}

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
                <option value="">All Funds</option>
                {allFunds.map((fund) => (
                  <option key={fund.id} value={fund.id}>
                    {fund.name}
                  </option>
                ))}
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

            <button className="filter-button" onClick={handleFilter} disabled={loading}>
              {loading ? 'Filtering...' : 'Filter'}
            </button>
          </div>
        </div>

        <div className="total-amount-box">
          <span className="total-label">Total Amount in Fund Report:</span>
          <span className="total-value">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="summary-section">
          <h2 className="summary-title">All Fund Summary</h2>

          {loading && (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: '#666'
            }}>
              Loading funds...
            </div>
          )}

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
                {!loading && funds.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
                      No funds found. Try adjusting your filters.
                    </td>
                  </tr>
                ) : (
                  funds.map((fund, index) => (
                    <tr key={fund.id}>
                      <td>{index + 1}</td>
                      <td className="fund-name">{fund.name}</td>
                      <td className="fund-amount">${fund.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="fund-donations">{fund.donations}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundReport;
