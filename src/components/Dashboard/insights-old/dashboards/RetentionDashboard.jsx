import { useState, useRef, useEffect } from 'react';

const getColorForPercentage = (percentage) => {
  if (percentage >= 95) return 'bg-[#1d4ed8] text-white';
  if (percentage >= 90) return 'bg-[#2563eb] text-white';
  if (percentage >= 85) return 'bg-[#3b82f6] text-white';
  if (percentage >= 80) return 'bg-[#60a5fa] text-gray-900';
  if (percentage >= 70) return 'bg-[#93c5fd] text-gray-900';
  if (percentage > 0) return 'bg-blue-50 text-blue-700';
  return 'bg-gray-50 text-gray-400';
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const RetentionDashboard = () => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(months[now.getMonth()] || 'Jan');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showNumbers, setShowNumbers] = useState(true);
  const dropdownRef = useRef(null);

  // Generate sample retention data
  const generateRetentionData = () => {
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(selectedYear, months.indexOf(selectedMonth) - i, 1);
      const cohort = `${months[date.getMonth()]} ${date.getFullYear()}`;
      const count = Math.floor(Math.random() * 50) + 100;

      const retention = Array.from({ length: 12 }).map((_, monthIndex) => {
        if (monthIndex > i) return null;
        if (monthIndex === 0) return 100;
        const decay = monthIndex * 5;
        return Math.max(70, 100 - decay - Math.random() * 10);
      });

      data.push({ cohort, count, retention });
    }
    return data;
  };

  const retentionData = generateRetentionData();

  const handleCellHover = (cohort, month, percentage, count, event) => {
    const rect = event.target.getBoundingClientRect();
    setHoveredCell({ cohort, month, percentage, count });
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Retention</h2>
          <p className="text-sm text-gray-600">
            Retention shows how many recurring plans are retained over last 12 months.{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Learn more ↗
            </a>
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNumbers(v => !v)}
            className={`px-3 py-1.5 text-xs rounded-lg border ${showNumbers ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            title={showNumbers ? 'Hide % labels' : 'Show % labels'}
          >
            {showNumbers ? 'Labels: On' : 'Labels: Off'}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {selectedMonth} {selectedYear}
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 w-64">
                {/* Year Navigation */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                  <button
                    onClick={() => setSelectedYear(selectedYear - 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm font-medium text-gray-900">{selectedMonth} {selectedYear}</span>
                  <button
                    onClick={() => setSelectedYear(selectedYear + 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Month Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {months.map((month) => (
                    <button
                      key={month}
                      onClick={() => {
                        setSelectedMonth(month);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        selectedMonth === month
                          ? 'bg-green-500 text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mb-4 text-xs text-gray-600">
        <span>Legend:</span>
        <div className="flex items-center gap-1"><span className="inline-block w-4 h-3 rounded bg-[#1d4ed8]"></span><span>95%+</span></div>
        <div className="flex items-center gap-1"><span className="inline-block w-4 h-3 rounded bg-[#2563eb]"></span><span>90–94%</span></div>
        <div className="flex items-center gap-1"><span className="inline-block w-4 h-3 rounded bg-[#3b82f6]"></span><span>85–89%</span></div>
        <div className="flex items-center gap-1"><span className="inline-block w-4 h-3 rounded bg-[#60a5fa]"></span><span>80–84%</span></div>
        <div className="flex items-center gap-1"><span className="inline-block w-4 h-3 rounded bg-blue-50 border border-blue-100"></span><span>1–79%</span></div>
        <div className="flex items-center gap-1"><span className="inline-block w-4 h-3 rounded bg-gray-50 border border-gray-200"></span><span>0%</span></div>
      </div>

      {/* Retention Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Cohort</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Count</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Mth. 0</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Mth. 1</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Mth. 2</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Mth. 3</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Mth. 4</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Mth. 5</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Mth. 6</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Mth. 7</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Mth. 8</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Mth. 9</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Mth. 10</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Mth. 11</th>
            </tr>
          </thead>
          <tbody>
            {retentionData.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100">
                <td className="px-3 py-2 text-sm text-gray-900 font-medium">{row.cohort}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{row.count}</td>
                {Array.from({ length: 12 }).map((_, colIndex) => {
                  const percentage = row.retention[colIndex];
                  const hasData = typeof percentage === 'number';
                  const pct = hasData ? Math.round(percentage) : 0;
                  const retainedCount = Math.round((pct / 100) * row.count);

                  return (
                    <td key={colIndex} className="px-1 py-1">
                      {hasData ? (
                        <div
                          className={`px-2 py-1.5 text-xs font-medium text-center rounded cursor-pointer transition-all hover:ring-2 hover:ring-blue-500 hover:ring-offset-1 ${getColorForPercentage(pct)}`}
                          onMouseEnter={(e) => handleCellHover(row.cohort, colIndex, pct, retainedCount, e)}
                          onMouseLeave={handleCellLeave}
                        >
                          {showNumbers ? `${pct}%` : ''}
                        </div>
                      ) : (
                        <div className="px-2 py-1.5 text-xs text-center"></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none transition-all duration-150 ease-out"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="text-sm font-semibold text-gray-900 mb-1">
            {hoveredCell.cohort} - {hoveredCell.month === 0 ? 'Baseline (Month 0)' : `Month ${hoveredCell.month}`}
          </div>
          <div className="text-xs text-gray-600 mb-1">Retention Rate</div>
          <div className="text-sm font-medium text-gray-900 mb-2">{hoveredCell.percentage}%</div>
          <div className="text-xs text-gray-600 mb-1">Retained Schedules</div>
          <div className="text-sm font-medium text-gray-900">
            {hoveredCell.count} of {retentionData.find(r => r.cohort === hoveredCell.cohort)?.count || 0}
          </div>
        </div>
      )}
    </div>
  );
};

export default RetentionDashboard;
