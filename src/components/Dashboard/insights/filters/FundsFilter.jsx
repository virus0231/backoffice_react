import { useState, useRef, useEffect } from 'react';
import './FundsFilter.css';

const FundsFilter = ({ value, onChange, selectedAppeals }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sample funds data
  const funds = [
    { id: 1, fund_name: 'General Fund', is_active: true, appeal_id: 1 },
    { id: 2, fund_name: 'Special Projects', is_active: true, appeal_id: 1 },
    { id: 3, fund_name: 'Infrastructure', is_active: false, appeal_id: 2 },
    { id: 4, fund_name: 'Community Development', is_active: true, appeal_id: 2 },
    { id: 5, fund_name: 'Medical Supplies', is_active: true, appeal_id: 3 },
    { id: 6, fund_name: 'Equipment', is_active: true, appeal_id: 3 }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter funds based on selected appeals and search
  const filteredFunds = selectedAppeals.length > 0
    ? funds.filter(fund =>
        selectedAppeals.some(appeal => appeal.id === fund.appeal_id) &&
        fund.fund_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : funds.filter(fund => fund.fund_name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleFundSelect = (fund) => {
    if (fund === null) {
      onChange([]);
    } else {
      const isSelected = value.some(selected => selected.id === fund.id);
      if (isSelected) {
        onChange(value.filter(selected => selected.id !== fund.id));
      } else {
        onChange([...value, fund]);
      }
    }
  };

  const isFundSelected = (fund) => {
    return value.some(selected => selected.id === fund.id);
  };

  const displayText = value.length > 0
    ? value.length === 1
      ? value[0]?.fund_name
      : 'Funds Selected'
    : 'Funds';

  return (
    <div className="funds-filter">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="funds-filter-button"
      >
        <div className="funds-filter-content">
          {value.length > 0 && (
            <span className="funds-count-badge">{value.length}</span>
          )}
          <span className="funds-filter-text">{displayText}</span>
        </div>
        <svg
          className={`funds-filter-chevron ${isOpen ? 'open' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div ref={dropdownRef} className="funds-filter-dropdown">
          <div className="funds-search-wrapper">
            <div className="funds-search-container">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search funds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="funds-search-input"
              />
              <svg
                className="funds-search-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="funds-search-clear"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {selectedAppeals.length > 0 && (
            <div className="funds-context">
              <svg className="funds-context-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Showing funds for:{' '}
                {selectedAppeals.length === 1 ? (
                  <span className="funds-context-value">{selectedAppeals[0]?.appeal_name}</span>
                ) : (
                  <span className="funds-context-value">{selectedAppeals.length} selected appeals</span>
                )}
              </span>
            </div>
          )}

          <div className="funds-list">
            <button
              type="button"
              onClick={() => handleFundSelect(null)}
              className={`funds-option ${value.length === 0 ? 'active' : ''}`}
            >
              <div className={`funds-checkbox ${value.length === 0 ? 'checked' : ''}`}>
                {value.length === 0 && (
                  <svg className="checkbox-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="funds-option-content">
                <svg className="funds-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {selectedAppeals.length > 0
                  ? selectedAppeals.length === 1
                    ? `All Funds (${selectedAppeals[0]?.appeal_name})`
                    : `All Funds (${selectedAppeals.length} Appeals)`
                  : 'All Funds'
                }
              </div>
            </button>

            {filteredFunds.length > 0 ? (
              filteredFunds.map(fund => (
                <button
                  key={fund.id}
                  type="button"
                  onClick={() => handleFundSelect(fund)}
                  className={`funds-option ${isFundSelected(fund) ? 'active' : ''}`}
                >
                  <div className={`funds-checkbox ${isFundSelected(fund) ? 'checked' : ''}`}>
                    {isFundSelected(fund) && (
                      <svg className="checkbox-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="funds-name">{fund.fund_name}</span>
                  {fund.is_active ? (
                    <span className="funds-status active">
                      <span className="status-dot" />
                      Active
                    </span>
                  ) : (
                    <span className="funds-status inactive">
                      <span className="status-dot" />
                      Inactive
                    </span>
                  )}
                </button>
              ))
            ) : selectedAppeals.length === 0 ? (
              <div className="funds-empty">
                <svg className="funds-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="funds-empty-text">Select appeals first</p>
                <p className="funds-empty-hint">Choose one or more appeals to see available funds</p>
              </div>
            ) : (
              <div className="funds-empty">
                <p className="funds-empty-text">No funds found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FundsFilter;
