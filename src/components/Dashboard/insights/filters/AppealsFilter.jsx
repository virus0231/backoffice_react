import { useState, useRef, useEffect } from 'react';

const AppealsFilter = ({ value, onChange, className = '', disabled = false }) => {
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
                placeholder="Search appeals..."
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

          <div className="max-h-[300px] overflow-y-auto">
            <button
              type="button"
              onClick={() => handleAppealSelect(null)}
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
                <span className={`text-sm font-medium ${value.length === 0 ? 'text-blue-700' : 'text-gray-900'}`}>All Appeals</span>
              </div>
            </button>

            {filteredAppeals.map(appeal => (
              <button
                key={appeal.id}
                type="button"
                onClick={() => handleAppealSelect(appeal)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${isAppealSelected(appeal) ? 'bg-blue-50' : ''}`}
              >
                <div className={`w-4 h-4 rounded border ${isAppealSelected(appeal) ? 'border-blue-600 bg-blue-600' : 'border-gray-300'} flex items-center justify-center`}>
                  {isAppealSelected(appeal) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm flex-1 text-left ${isAppealSelected(appeal) ? 'text-blue-700 font-medium' : 'text-gray-900'}`}>{appeal.appeal_name}</span>
                {appeal.status === 'active' ? (
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
            ))}

            {filteredAppeals.length === 0 && searchTerm && (
              <div className="px-4 py-8 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-900 mb-1">No appeals found</p>
                <p className="text-xs text-gray-500">Try adjusting your search</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppealsFilter;
