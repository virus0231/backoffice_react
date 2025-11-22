import { useState, useRef, useEffect } from 'react';
import './FrequencyFilter.css';

const frequencyOptions = [
  {
    label: 'All Donations',
    value: 'all',
    description: 'Show all donation types'
  },
  {
    label: 'One-time',
    value: 'one-time',
    description: 'Single donations only'
  },
  {
    label: 'Recurring',
    value: 'recurring',
    description: 'All recurring donations'
  },
  {
    label: 'First Installments',
    value: 'recurring-first',
    description: 'Initial recurring donations'
  },
  {
    label: 'Next Installments',
    value: 'recurring-next',
    description: 'Follow-up recurring donations'
  }
];

const FrequencyFilter = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = frequencyOptions.find(option => option.value === value);

  const handleFrequencySelect = (frequency) => {
    onChange(frequency);
    setIsOpen(false);
  };

  const displayText = value !== 'all' ? selectedOption?.label : 'Frequency';

  return (
    <div className="frequency-filter">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="frequency-filter-button"
      >
        <div className="frequency-filter-content">
          {value !== 'all' && (
            <span className="frequency-active-badge">✓</span>
          )}
          <span className="frequency-filter-text">{displayText}</span>
        </div>
        <svg
          className={`frequency-filter-chevron ${isOpen ? 'open' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div ref={dropdownRef} className="frequency-filter-dropdown">
          <div className="frequency-options-list">
            {frequencyOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleFrequencySelect(option.value)}
                className={`frequency-option ${value === option.value ? 'active' : ''}`}
              >
                <div className="frequency-option-content">
                  <div className={`frequency-option-label ${value === option.value ? 'active' : ''}`}>
                    {option.label}
                  </div>
                  <div className="frequency-option-description">
                    {option.description}
                  </div>
                </div>
                {value === option.value && (
                  <svg
                    className="frequency-check-icon"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <div className="frequency-info">
            <svg className="frequency-info-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Filter donations by payment frequency
          </div>
        </div>
      )}
    </div>
  );
};

export default FrequencyFilter;
