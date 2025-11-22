import { useState } from 'react';
import './CampaignsDashboard.css';

const CampaignsDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample data
  const campaignsData = [
    { date: '2024-01-01', campaign1: 1800, campaign2: 1400, campaign3: 1200, campaign4: 980, campaign5: 750 },
    { date: '2024-01-02', campaign1: 2100, campaign2: 1650, campaign3: 1380, campaign4: 1150, campaign5: 880 },
    { date: '2024-01-03', campaign1: 1600, campaign2: 1200, campaign3: 1050, campaign4: 820, campaign5: 630 },
    { date: '2024-01-04', campaign1: 2400, campaign2: 1890, campaign3: 1580, campaign4: 1320, campaign5: 1020 },
    { date: '2024-01-05', campaign1: 2800, campaign2: 2200, campaign3: 1850, campaign4: 1540, campaign5: 1180 }
  ];

  const campaigns = [
    { name: 'Emergency Relief Fund', color: '#3b82f6', key: 'campaign1', total: 10700 },
    { name: 'Education Support', color: '#10b981', key: 'campaign2', total: 8340 },
    { name: 'Healthcare Initiative', color: '#f59e0b', key: 'campaign3', total: 7060 },
    { name: 'Clean Water Project', color: '#8b5cf6', key: 'campaign4', total: 5810 },
    { name: 'Community Development', color: '#ec4899', key: 'campaign5', total: 4460 },
    { name: 'Women Empowerment', color: '#14b8a6', key: 'campaign6', total: 3850 },
    { name: 'Child Nutrition', color: '#f97316', key: 'campaign7', total: 3200 },
    { name: 'Elderly Care', color: '#6366f1', key: 'campaign8', total: 2750 },
    { name: 'Disaster Relief', color: '#ef4444', key: 'campaign9', total: 2400 },
    { name: 'Orphan Support', color: '#06b6d4', key: 'campaign10', total: 2100 }
  ];

  const maxValue = Math.max(...campaignsData.flatMap(d => Object.values(d).filter(v => typeof v === 'number')));

  const totalPages = Math.ceil(campaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCampaigns = campaigns.slice(startIndex, endIndex);

  return (
    <div className="campaigns-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Campaigns</h2>
      </div>

      <div className="campaigns-chart">
        <svg viewBox="0 0 700 256" className="multi-line-chart">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={i * 64}
              x2="700"
              y2={i * 64}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Line for each campaign (only first 5 for simplicity) */}
          {campaigns.slice(0, 5).map((campaign, campaignIndex) => (
            <g key={campaignIndex}>
              <path
                d={`
                  M 0 ${256 - (campaignsData[0][campaign.key] / maxValue) * 200}
                  ${campaignsData.map((d, i) => `L ${(i / (campaignsData.length - 1)) * 700} ${256 - ((d[campaign.key] || 0) / maxValue) * 200}`).join(' ')}
                `}
                fill="none"
                stroke={campaign.color}
                strokeWidth="2"
              />
              {campaignsData.map((d, i) => (
                <circle
                  key={i}
                  cx={(i / (campaignsData.length - 1)) * 700}
                  cy={256 - ((d[campaign.key] || 0) / maxValue) * 200}
                  r="3"
                  fill={campaign.color}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      <div className="campaigns-legend">
        <div className="legend-grid">
          {currentCampaigns.map((campaign, index) => (
            <div key={index} className="legend-item">
              <div className="legend-indicator" style={{ backgroundColor: campaign.color }} />
              <div className="legend-content">
                <div className="legend-label">{campaign.name}</div>
                <div className="legend-value">${campaign.total.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignsDashboard;
