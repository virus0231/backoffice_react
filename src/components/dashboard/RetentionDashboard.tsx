"use client";

import { useState, useRef, useEffect } from "react";
import { useFilterContext } from "@/providers/FilterProvider";

// Mock retention data - replace with real API data later
const mockRetentionData = [
  { cohort: "Dec 2024", count: 7, retention: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100] },
  { cohort: "Jan 2025", count: 33, retention: [100, 94, 94, 91, 91, 91, 88, 82, 79, 79] },
  { cohort: "Feb 2025", count: 26, retention: [100, 100, 100, 100, 96, 92, 88, 88, 85] },
  { cohort: "Mar 2025", count: 52, retention: [100, 96, 88, 96, 96, 94, 92, 92] },
  { cohort: "Apr 2025", count: 20, retention: [95, 90, 90, 95, 90, 90, 90] },
  { cohort: "May 2025", count: 44, retention: [98, 93, 89, 88, 89, 89] },
  { cohort: "Jun 2025", count: 49, retention: [100, 98, 96, 98, 98] },
  { cohort: "Jul 2025", count: 43, retention: [95, 95, 93, 93] },
  { cohort: "Aug 2025", count: 27, retention: [96, 89, 85] },
  { cohort: "Sep 2025", count: 34, retention: [100, 100] },
  { cohort: "Oct 2025", count: 0, retention: [] },
];

const getColorForPercentage = (percentage: number): string => {
  if (percentage >= 95) return "bg-[#2563eb] text-white"; // Dark blue
  if (percentage >= 90) return "bg-[#3b82f6] text-white"; // Medium blue
  if (percentage >= 85) return "bg-[#60a5fa] text-white"; // Light blue
  if (percentage >= 80) return "bg-[#93c5fd] text-gray-900"; // Lighter blue
  return "bg-gray-100 text-gray-600"; // Very light gray
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function RetentionDashboard() {
  const { isHydrated } = useFilterContext();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState("Oct");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Retention</h2>
          <p className="text-sm text-gray-600">
            Retention shows how many recurring plans are retained over last 12 months.{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Learn more ↗
            </a>
          </p>
        </div>

        {/* Month Selector */}
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

      {/* Retention Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                Cohort
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                Count
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                Mth. 0
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                Mth. 1
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                Mth. 2
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                Mth. 3
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                Mth. 4
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                Mth. 5
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                Mth. 6
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                Mth. 7
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                Mth. 8
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                Mth. 9
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                Mth. 10
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                Mth. 11
              </th>
            </tr>
          </thead>
          <tbody>
            {mockRetentionData.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100">
                <td className="px-3 py-2 text-sm text-gray-900 font-medium">
                  {row.cohort}
                </td>
                <td className="px-3 py-2 text-sm text-gray-900">
                  {row.count}
                </td>
                {Array.from({ length: 12 }).map((_, colIndex) => {
                  const percentage = row.retention[colIndex];
                  const hasData = percentage !== undefined;

                  return (
                    <td key={colIndex} className="px-1 py-1">
                      {hasData ? (
                        <div
                          className={`px-2 py-1.5 text-xs font-medium text-center rounded ${getColorForPercentage(
                            percentage
                          )}`}
                        >
                          {percentage}%
                        </div>
                      ) : (
                        <div className="px-2 py-1.5 text-xs text-center">
                          {/* Empty cell */}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
