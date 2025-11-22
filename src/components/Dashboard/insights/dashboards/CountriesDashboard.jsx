import { useState } from 'react';
import './CountriesDashboard.css';

const CountriesDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample data
  const countriesData = [
    { date: '2024-01-01', US: 3200, CA: 1800, UK: 1600, AU: 1200, DE: 980, FR: 850, NL: 720, SE: 650, NO: 580, DK: 520 },
    { date: '2024-01-02', US: 3800, CA: 2100, UK: 1850, AU: 1400, DE: 1150, FR: 1000, NL: 850, SE: 780, NO: 680, DK: 620 },
    { date: '2024-01-03', US: 2900, CA: 1600, UK: 1400, AU: 1050, DE: 860, FR: 750, NL: 640, SE: 580, NO: 510, DK: 460 },
    { date: '2024-01-04', US: 4200, CA: 2400, UK: 2100, AU: 1600, DE: 1320, FR: 1150, NL: 980, SE: 890, NO: 780, DK: 710 },
    { date: '2024-01-05', US: 4900, CA: 2800, UK: 2450, AU: 1850, DE: 1540, FR: 1340, NL: 1140, SE: 1040, NO: 910, DK: 830 }
  ];

  const countries = [
    { name: 'United States', code: 'US', flag: '🇺🇸', color: '#3b82f6', total: 19000 },
    { name: 'Canada', code: 'CA', flag: '🇨🇦', color: '#10b981', total: 10700 },
    { name: 'United Kingdom', code: 'UK', flag: '🇬🇧', color: '#f59e0b', total: 9400 },
    { name: 'Australia', code: 'AU', flag: '🇦🇺', color: '#8b5cf6', total: 7100 },
    { name: 'Germany', code: 'DE', flag: '🇩🇪', color: '#ec4899', total: 5850 },
    { name: 'France', code: 'FR', flag: '🇫🇷', color: '#14b8a6', total: 5090 },
    { name: 'Netherlands', code: 'NL', flag: '🇳🇱', color: '#f97316', total: 4330 },
    { name: 'Sweden', code: 'SE', flag: '🇸🇪', color: '#6366f1', total: 3940 },
    { name: 'Norway', code: 'NO', flag: '🇳🇴', color: '#ef4444', total: 3460 },
    { name: 'Denmark', code: 'DK', flag: '🇩🇰', color: '#06b6d4', total: 3140 }
  ];

  const maxValue = Math.max(...countriesData.flatMap(d => Object.values(d).filter(v => typeof v === 'number')));

  const totalPages = Math.ceil(countries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCountries = countries.slice(startIndex, endIndex);

  return (
    <div className="countries-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Countries</h2>
      </div>

      <div className="countries-chart">
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

          {/* Line for each country */}
          {countries.map((country, countryIndex) => (
            <g key={countryIndex}>
              <path
                d={`
                  M 0 ${256 - (countriesData[0][country.code] / maxValue) * 200}
                  ${countriesData.map((d, i) => `L ${(i / (countriesData.length - 1)) * 700} ${256 - (d[country.code] / maxValue) * 200}`).join(' ')}
                `}
                fill="none"
                stroke={country.color}
                strokeWidth="2"
              />
              {countriesData.map((d, i) => (
                <circle
                  key={i}
                  cx={(i / (countriesData.length - 1)) * 700}
                  cy={256 - (d[country.code] / maxValue) * 200}
                  r="3"
                  fill={country.color}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      <div className="countries-legend">
        <div className="legend-grid">
          {currentCountries.map((country, index) => (
            <div key={index} className="legend-item">
              <div className="country-flag">{country.flag}</div>
              <div className="legend-indicator" style={{ backgroundColor: country.color }} />
              <div className="legend-content">
                <div className="legend-label">{country.name}</div>
                <div className="legend-value">${country.total.toLocaleString()}</div>
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

export default CountriesDashboard;
