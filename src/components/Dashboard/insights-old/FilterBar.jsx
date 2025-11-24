import { useMemo, useState } from 'react';
import DateRangePicker from './filters/DateRangePicker';
import AppealsFilter from './filters/AppealsFilter';
import FundsFilter from './filters/FundsFilter';
import FrequencyFilter from './filters/FrequencyFilter';

const defaultRange = () => ({
  startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
  endDate: new Date(),
  preset: 'last30days',
});

const FilterBar = ({
  className = '',
  showClearAll = true,
  disabled = false,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dateRange, setDateRange] = useState(defaultRange);
  const [selectedAppeals, setSelectedAppeals] = useState([]);
  const [selectedFunds, setSelectedFunds] = useState([]);
  const [frequency, setFrequency] = useState('all');

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (dateRange.preset && dateRange.preset !== 'last30days') count += 1;
    if (selectedAppeals.length > 0) count += 1;
    if (selectedFunds.length > 0) count += 1;
    if (frequency !== 'all') count += 1;
    return count;
  }, [dateRange.preset, frequency, selectedAppeals.length, selectedFunds.length]);

  const clearAllFilters = () => {
    setDateRange(defaultRange());
    setSelectedAppeals([]);
    setSelectedFunds([]);
    setFrequency('all');
  };

  return (
    <div className={className}>
      {/* Mobile: Toggle Button */}
      <div className="lg:hidden">
        <button
          onClick={() => !disabled && setIsDrawerOpen(true)}
          disabled={disabled}
          className={[
            'flex items-center justify-between w-full px-4 py-2.5 text-sm',
            'bg-white border border-gray-300 rounded-lg shadow-sm',
            'hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20',
            'transition-all duration-200',
            disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '',
          ].join(' ')}
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="font-medium text-gray-900">Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {activeFilterCount}
              </span>
            )}
          </div>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Mobile: Drawer/Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  disabled={disabled}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appeals</label>
                <AppealsFilter
                  value={selectedAppeals}
                  onChange={setSelectedAppeals}
                  disabled={disabled}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Funds</label>
                <FundsFilter
                  value={selectedFunds}
                  onChange={setSelectedFunds}
                  selectedAppeals={selectedAppeals}
                  disabled={disabled}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <FrequencyFilter
                  value={frequency}
                  onChange={setFrequency}
                  disabled={disabled}
                  className="w-full"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 p-4 flex gap-3">
              {showClearAll && (
                <button
                  onClick={clearAllFilters}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: Horizontal Filters */}
      <div className="hidden lg:flex items-center gap-4">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          disabled={disabled}
        />
        <AppealsFilter
          value={selectedAppeals}
          onChange={setSelectedAppeals}
          disabled={disabled}
        />
        <FundsFilter
          value={selectedFunds}
          onChange={setSelectedFunds}
          selectedAppeals={selectedAppeals}
          disabled={disabled}
        />
        <FrequencyFilter
          value={frequency}
          onChange={setFrequency}
          disabled={disabled}
        />
        {showClearAll && (
          <button
            onClick={clearAllFilters}
            className="ml-auto px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md border border-transparent"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
