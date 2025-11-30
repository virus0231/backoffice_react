import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import DateRangePicker from '@/components/filters/DateRangePicker';
import './CampaignReport.css';

const BASE_URL = import.meta.env.DEV
  ? '/backoffice/yoc'
  : 'https://forgottenwomen.youronlineconversation.com/backoffice/yoc';

const CampaignReport = () => {
  const [filters, setFilters] = useState({
    campaigns: '',
    fromDate: '',
    toDate: '',
    donorEmail: ''
  });
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    preset: null
  });

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filterParams.campaigns) params.append('campaigns', filterParams.campaigns);
      if (filterParams.fromDate) params.append('from_date', filterParams.fromDate);
      if (filterParams.toDate) params.append('to_date', filterParams.toDate);
      if (filterParams.donorEmail) params.append('donor_email', filterParams.donorEmail);

      const response = await fetch(`${BASE_URL}/campaign-report.php?${params.toString()}`, {
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success) {
        setCampaigns(result.data);
        setTotalAmount(result.total_amount || 0);
      } else {
        setError('Failed to load campaigns');
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns. Please try again.');
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

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setFilters(prev => ({
      ...prev,
      fromDate: format(range.startDate, 'yyyy-MM-dd'),
      toDate: format(range.endDate, 'yyyy-MM-dd')
    }));
  };

  const handleClearDateRange = () => {
    setDateRange({
      startDate: null,
      endDate: null,
      preset: null
    });
    setFilters(prev => ({
      ...prev,
      fromDate: '',
      toDate: ''
    }));
  };

  const handleFilter = () => {
    fetchCampaigns(filters);
  };

  return (
    <div className="campaign-report-page">
      <div className="campaign-report-header">
        <h1 className="campaign-report-title">Campaign Report</h1>
        <div className="campaign-report-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Report</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Campaign</span>
        </div>
      </div>

      <div className="campaign-report-content">
        {error && (
          <div className="users-error" style={{ marginBottom: 12 }}>
            <strong>Error:</strong> {error}
            <button
              onClick={() => fetchCampaigns()}
              className="edit-btn"
              style={{ marginLeft: 12, padding: '6px 12px' }}
            >
              Retry
            </button>
          </div>
        )}

        <div className="filter-box">
          <h2 className="filter-title">Filter Campaign Report</h2>

          <div className="filter-grid">
            <div className="filter-field">
              <label htmlFor="campaigns">Campaigns:</label>
              <input
                type="text"
                id="campaigns"
                className="text-input"
                placeholder="Search campaign name"
                value={filters.campaigns}
                onChange={(e) => handleFilterChange('campaigns', e.target.value)}
              />
            </div>

            <div className="filter-field" style={{ gridColumn: 'span 2' }}>
              <label htmlFor="date-range">Date Range:</label>
              <div className="flex items-center gap-3">
                <DateRangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  placeholder="Select date range"
                  className="w-full"
                />
                {(dateRange.startDate && dateRange.endDate) && (
                  <button
                    type="button"
                    onClick={handleClearDateRange}
                    className="text-sm text-white underline decoration-white/60 hover:decoration-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <button className="filter-button" onClick={handleFilter} disabled={loading}>
            {loading ? 'Filtering...' : 'Filter'}
          </button>

          <div className="donor-email-field">
            <label htmlFor="donor-email">Donor Email (optional):</label>
            <input
              type="email"
              id="donor-email"
              className="text-input"
              placeholder="john@example.com"
              value={filters.donorEmail}
              onChange={(e) => handleFilterChange('donorEmail', e.target.value)}
            />
          </div>
        </div>

        <div className="total-amount-box">
          <span className="total-label">Total Amount in Campaign:</span>
          <span className="total-value">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="summary-section">
          <h2 className="summary-title">All Campaigns Summary</h2>

          {loading && (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: '#666'
            }}>
              Loading campaigns...
            </div>
          )}

          <div className="summary-table-container">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Campaign Name</th>
                  <th>Total Amount</th>
                  <th>Number of Donations</th>
                </tr>
              </thead>
              <tbody>
                {!loading && campaigns.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
                      No campaigns found. Try adjusting your filters.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((campaign, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td className="campaign-name">{campaign.name}</td>
                      <td className="campaign-amount">${campaign.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="campaign-donations">{campaign.donations}</td>
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

export default CampaignReport;
