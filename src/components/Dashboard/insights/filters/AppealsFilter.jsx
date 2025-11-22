import { useState, useRef, useEffect } from 'react';
import './AppealsFilter.css';

const AppealsFilter = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sample appeals data
  const appeals = [
    { id: 1, appeal_name: 'Emergency Relief', status: 'active' },
    { id: 2, appeal_name: 'Education Fund', status: 'active' },
    { id: 3, appeal_name: 'Healthcare Support', status: 'inactive' },
    { id: 4, appeal_name: 'Clean Water Initiative', status: 'active' },
    { id: 5, appeal_name: 'Food Security Program', status: 'active' },
    { id: 6, appeal_name: 'Child Protection', status: 'active' }
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

  const filteredAppeals = appeals.filter(appeal =>
    appeal.appeal_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAppealSelect = (appeal) => {
    if (appeal === null) {
      onChange([]);
    } else {
      const isSelected = value.some(selected => selected.id === appeal.id);
      if (isSelected) {
        onChange(value.filter(selected => selected.id !== appeal.id));
      } else {
        onChange([...value, appeal]);
      }
    }
  };

  const isAppealSelected = (appeal) => {
    return value.some(selected => selected.id === appeal.id);
  };

  const displayText = value.length > 0
    ? value.length === 1
      ? value[0]?.appeal_name
      : 'Appeals Selected'
    : 'Appeals';

  return (
    <div className="appeals-filter">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="appeals-filter-button"
      >
        <div className="appeals-filter-content">
          {value.length > 0 && (
            <span className="appeals-count-badge">{value.length}</span>
          )}
          <span className="appeals-filter-text">{displayText}</span>
        </div>
        <svg
          className={`appeals-filter-chevron ${isOpen ? 'open' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div ref={dropdownRef} className="appeals-filter-dropdown">
          <div className="appeals-search-wrapper">
            <div className="appeals-search-container">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search appeals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="appeals-search-input"
              />
              <svg
                className="appeals-search-icon"
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
                  className="appeals-search-clear"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="appeals-list">
            <button
              type="button"
              onClick={() => handleAppealSelect(null)}
              className={`appeals-option ${value.length === 0 ? 'active' : ''}`}
            >
              <div className={`appeals-checkbox ${value.length === 0 ? 'checked' : ''}`}>
                {value.length === 0 && (
                  <svg className="checkbox-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="appeals-option-content">
                <svg className="appeals-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                All Appeals
              </div>
            </button>

            {filteredAppeals.map(appeal => (
              <button
                key={appeal.id}
                type="button"
                onClick={() => handleAppealSelect(appeal)}
                className={`appeals-option ${isAppealSelected(appeal) ? 'active' : ''}`}
              >
                <div className={`appeals-checkbox ${isAppealSelected(appeal) ? 'checked' : ''}`}>
                  {isAppealSelected(appeal) && (
                    <svg className="checkbox-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="appeals-name">{appeal.appeal_name}</span>
                {appeal.status === 'active' ? (
                  <span className="appeals-status active">
                    <span className="status-dot" />
                    Active
                  </span>
                ) : (
                  <span className="appeals-status inactive">
                    <span className="status-dot" />
                    Inactive
                  </span>
                )}
              </button>
            ))}

            {filteredAppeals.length === 0 && searchTerm && (
              <div className="appeals-empty">
                <svg className="appeals-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="appeals-empty-text">No appeals found</p>
                <p className="appeals-empty-hint">Try adjusting your search</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppealsFilter;
