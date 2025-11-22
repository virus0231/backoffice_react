import { useState } from 'react';
import DateRangePicker from './filters/DateRangePicker';
import AppealsFilter from './filters/AppealsFilter';
import FundsFilter from './filters/FundsFilter';
import FrequencyFilter from './filters/FrequencyFilter';
import './FilterBar.css';

const FilterBar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
    preset: 'last30days'
  });
  const [selectedAppeals, setSelectedAppeals] = useState([]);
  const [selectedFunds, setSelectedFunds] = useState([]);
  const [frequency, setFrequency] = useState('all');

  const getActiveFilterCount = () => {
    let count = 0;
    if (dateRange.preset && dateRange.preset !== 'last30days') count++;
    if (selectedAppeals.length > 0) count++;
    if (selectedFunds.length > 0) count++;
    if (frequency !== 'all') count++;
    return count;
  };

  const clearAllFilters = () => {
    setDateRange({
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date(),
      preset: 'last30days'
    });
    setSelectedAppeals([]);
    setSelectedFunds([]);
    setFrequency('all');
  };

  return (
    <>
      {/* Mobile: Toggle Button */}
      <div className="filter-bar-mobile">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="filter-toggle-btn"
        >
          <div className="filter-toggle-content">
            <svg className="filter-toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="filter-toggle-label">Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="filter-count-badge">
                {getActiveFilterCount()}
              </span>
            )}
          </div>
          <svg className="filter-toggle-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Mobile: Drawer/Modal */}
      {isDrawerOpen && (
        <div className="filter-drawer-overlay">
          <div
            className="filter-drawer-backdrop"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="filter-drawer-panel">
            <div className="filter-drawer-header">
              <div className="filter-drawer-title-wrapper">
                <svg className="filter-drawer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <h2 className="filter-drawer-title">Filters</h2>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="filter-drawer-close"
              >
                <svg className="filter-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="filter-drawer-content">
              <div className="filter-drawer-item">
                <label className="filter-drawer-label">Date Range</label>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                />
              </div>

              <div className="filter-drawer-item">
                <label className="filter-drawer-label">Appeals</label>
                <AppealsFilter
                  value={selectedAppeals}
                  onChange={setSelectedAppeals}
                />
              </div>

              <div className="filter-drawer-item">
                <label className="filter-drawer-label">Funds</label>
                <FundsFilter
                  value={selectedFunds}
                  onChange={setSelectedFunds}
                  selectedAppeals={selectedAppeals}
                />
              </div>

              <div className="filter-drawer-item">
                <label className="filter-drawer-label">Frequency</label>
                <FrequencyFilter
                  value={frequency}
                  onChange={setFrequency}
                />
              </div>
            </div>

            <div className="filter-drawer-footer">
              <button
                onClick={clearAllFilters}
                className="filter-drawer-clear-btn"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="filter-drawer-apply-btn"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: Horizontal Filters */}
      <div className="filter-bar-desktop">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />

        <AppealsFilter
          value={selectedAppeals}
          onChange={setSelectedAppeals}
        />

        <FundsFilter
          value={selectedFunds}
          onChange={setSelectedFunds}
          selectedAppeals={selectedAppeals}
        />

        <FrequencyFilter
          value={frequency}
          onChange={setFrequency}
        />
      </div>
    </>
  );
};

export default FilterBar;
