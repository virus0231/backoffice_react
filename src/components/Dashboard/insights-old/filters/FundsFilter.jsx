import { useState, useRef, useEffect } from 'react';

const FundsFilter = ({ value, onChange, selectedAppeals, className = '', disabled = false }) => {
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
          {value.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{value.length}</span>
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
        <div ref={dropdownRef} className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[320px]">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search funds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-9 pr-9 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {selectedAppeals.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-700">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Showing funds for:{' '}
                {selectedAppeals.length === 1 ? (
                  <span className="font-medium">{selectedAppeals[0]?.appeal_name}</span>
                ) : (
                  <span className="font-medium">{selectedAppeals.length} selected appeals</span>
                )}
              </span>
            </div>
          )}

          <div className="max-h-[300px] overflow-y-auto">
            <button
              type="button"
              onClick={() => handleFundSelect(null)}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${value.length === 0 ? 'bg-blue-50' : ''}`}
            >
              <div className={`w-4 h-4 rounded border ${value.length === 0 ? 'border-blue-600 bg-blue-600' : 'border-gray-300'} flex items-center justify-center`}>
                {value.length === 0 && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-2 text-left">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className={`text-sm font-medium ${value.length === 0 ? 'text-blue-700' : 'text-gray-900'}`}>
                  {selectedAppeals.length > 0
                    ? selectedAppeals.length === 1
                      ? `All Funds (${selectedAppeals[0]?.appeal_name})`
                      : `All Funds (${selectedAppeals.length} Appeals)`
                    : 'All Funds'
                  }
                </span>
              </div>
            </button>

            {filteredFunds.length > 0 ? (
              filteredFunds.map(fund => (
                <button
                  key={fund.id}
                  type="button"
                  onClick={() => handleFundSelect(fund)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${isFundSelected(fund) ? 'bg-blue-50' : ''}`}
                >
                  <div className={`w-4 h-4 rounded border ${isFundSelected(fund) ? 'border-blue-600 bg-blue-600' : 'border-gray-300'} flex items-center justify-center`}>
                    {isFundSelected(fund) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm flex-1 text-left ${isFundSelected(fund) ? 'text-blue-700 font-medium' : 'text-gray-900'}`}>{fund.fund_name}</span>
                  {fund.is_active ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      Inactive
                    </span>
                  )}
                </button>
              ))
            ) : selectedAppeals.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-sm font-medium text-gray-900 mb-1">Select appeals first</p>
                <p className="text-xs text-gray-500">Choose one or more appeals to see available funds</p>
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-medium text-gray-900">No funds found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FundsFilter;
