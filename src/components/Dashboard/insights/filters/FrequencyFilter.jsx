import { useEffect, useRef, useState } from 'react';

const frequencyOptions = [
  {
    label: 'All Donations',
    value: 'all',
    description: 'Show all donation types',
  },
  {
    label: 'One-time',
    value: 'one-time',
    description: 'Single donations only',
  },
  {
    label: 'Recurring',
    value: 'recurring',
    description: 'All recurring donations',
  },
  {
    label: 'First Installments',
    value: 'recurring-first',
    description: 'Initial recurring donations',
  },
  {
    label: 'Next Installments',
    value: 'recurring-next',
    description: 'Follow-up recurring donations',
  },
];

const FrequencyFilter = ({ value, onChange, className = '', disabled = false }) => {
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

  const selectedOption = frequencyOptions.find((option) => option.value === value);

  const handleFrequencySelect = (frequency) => {
    onChange(frequency);
    setIsOpen(false);
  };

  const displayText = value !== 'all' ? selectedOption?.label : 'Frequency';

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 min-w-[140px] transition-colors ${
          disabled ? 'cursor-not-allowed bg-gray-50 text-gray-500 hover:border-gray-300' : ''
        }`}
      >
        <div className="flex items-center gap-2 flex-1">
          {value !== 'all' && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l6.293-6.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
          <span className="whitespace-nowrap">{displayText}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[280px]"
        >
          <div className="py-1">
            {frequencyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleFrequencySelect(option.value)}
                className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                  value === option.value ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex-1 text-left">
                  <div
                    className={`text-sm font-medium mb-0.5 ${
                      value === option.value ? 'text-blue-700' : 'text-gray-900'
                    }`}
                  >
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
                {value === option.value && (
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l6.293-6.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>Filter donations by payment frequency</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrequencyFilter;
