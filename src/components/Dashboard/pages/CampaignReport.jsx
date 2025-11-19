import { useState } from 'react';
import './CampaignReport.css';

const CampaignReport = () => {
  const [filters, setFilters] = useState({
    campaigns: '',
    fromDate: '',
    toDate: '',
    donorEmail: ''
  });

  const [campaigns, setCampaigns] = useState([
    { id: 1, name: 'Fund Her Future', totalAmount: 85.00, donations: 5 },
    { id: 2, name: 'Monthly Giving', totalAmount: 4268.00, donations: 157 }
  ]);

  const totalAmount = campaigns.reduce((sum, campaign) => sum + campaign.totalAmount, 0);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilter = () => {
    console.log('Filter with:', filters);
    alert('Filtering campaign report...');
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
        <div className="filter-box">
          <h2 className="filter-title">Filter Campaign Report</h2>

          <div className="filter-grid">
            <div className="filter-field">
              <label htmlFor="campaigns">Campaigns:</label>
              <input
                type="text"
                id="campaigns"
                className="text-input"
                value={filters.campaigns}
                onChange={(e) => handleFilterChange('campaigns', e.target.value)}
              />
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
          </div>

          <button className="filter-button" onClick={handleFilter}>
            Filter
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
                {campaigns.map((campaign, index) => (
                  <tr key={campaign.id}>
                    <td>{index + 1}</td>
                    <td className="campaign-name">{campaign.name}</td>
                    <td className="campaign-amount">${campaign.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="campaign-donations">{campaign.donations}</td>
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

export default CampaignReport;
