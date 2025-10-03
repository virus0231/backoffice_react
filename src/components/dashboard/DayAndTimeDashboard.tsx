"use client";

import { useState } from "react";
import { useFilterContext } from "@/providers/FilterProvider";

// Mock heatmap data - 7 days x 24 hours
const mockHeatmapData = [
  // Monday
  [0, 1, 0, 0, 1, 2, 3, 1, 2, 1, 2, 1, 0, 1, 2, 1, 3, 2, 1, 0, 0, 0, 0, 0],
  // Tuesday
  [1, 0, 1, 1, 0, 1, 2, 3, 4, 5, 4, 3, 2, 2, 3, 4, 5, 4, 5, 3, 2, 1, 0, 1],
  // Wednesday
  [0, 0, 0, 1, 1, 2, 3, 2, 3, 2, 3, 3, 3, 3, 2, 2, 1, 2, 4, 2, 1, 0, 0, 0],
  // Thursday
  [0, 0, 0, 0, 1, 2, 3, 2, 1, 2, 3, 2, 3, 4, 2, 1, 2, 3, 4, 2, 1, 0, 0, 0],
  // Friday
  [1, 0, 0, 0, 1, 2, 3, 4, 2, 1, 3, 2, 1, 2, 4, 5, 3, 2, 5, 3, 2, 1, 0, 0],
  // Saturday
  [0, 0, 0, 1, 1, 2, 1, 2, 3, 2, 3, 2, 3, 4, 2, 1, 0, 1, 2, 1, 4, 2, 1, 0],
  // Sunday
  [1, 0, 0, 0, 1, 1, 2, 1, 0, 0, 1, 3, 2, 1, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0],
];

const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const hours = ['12AM', '2AM', '4AM', '6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'];

// Get color based on intensity (0-5 scale)
const getColorForIntensity = (value: number): string => {
  if (value === 0) return 'bg-gray-100';
  if (value === 1) return 'bg-blue-200';
  if (value === 2) return 'bg-blue-300';
  if (value === 3) return 'bg-blue-400';
  if (value === 4) return 'bg-blue-600';
  return 'bg-blue-800'; // 5+
};

// Format hour for display
const formatHour = (hour: number): string => {
  if (hour === 0) return '12AM';
  if (hour < 12) return `${hour}AM`;
  if (hour === 12) return '12PM';
  return `${hour - 12}PM`;
};

// Get day name
const getDayName = (dayIndex: number): string => {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
  return dayNames[dayIndex] ?? '';
};

export default function DayAndTimeDashboard() {
  const { isHydrated } = useFilterContext();
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number; value: number } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleCellHover = (dayIndex: number, hourIndex: number, value: number, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setHoveredCell({ day: dayIndex, hour: hourIndex, value });
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };

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
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Day and time</h2>
        <p className="text-sm text-gray-600">
          Donations made by day and time they were made.
        </p>
      </div>

      {/* Heatmap */}
      <div className="relative">
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col justify-around pr-3 pt-7">
            {days.map((day, index) => (
              <div key={index} className="text-xs font-medium text-gray-600 h-7 flex items-center">
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex-1">
            {/* Hour labels */}
            <div className="flex mb-2">
              {hours.map((hour, index) => (
                <div key={index} className="flex-1 text-xs text-gray-500 text-center">
                  {hour}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="space-y-1.5">
              {mockHeatmapData.map((dayData, dayIndex) => (
                <div key={dayIndex} className="flex gap-1.5">
                  {dayData.map((value, hourIndex) => (
                    <div
                      key={hourIndex}
                      className={`flex-1 h-7 rounded cursor-pointer transition-all ${getColorForIntensity(value)} hover:ring-2 hover:ring-blue-500 hover:ring-offset-1`}
                      onMouseEnter={(e) => handleCellHover(dayIndex, hourIndex, value, e)}
                      onMouseLeave={handleCellLeave}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
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
                {getDayName(hoveredCell.day)} {formatHour(hoveredCell.hour)}
              </div>
              <div className="text-xs text-gray-600 mb-1">Raised</div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                ${(hoveredCell.value * 10.52).toFixed(2)}
              </div>
              <div className="text-xs text-gray-600">Donations</div>
              <div className="text-sm font-medium text-gray-900">{hoveredCell.value}</div>
            </div>
          )}
        </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-8 text-xs text-gray-600">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-gray-100 rounded-sm border border-gray-200"></div>
          <div className="w-4 h-4 bg-blue-200 rounded-sm"></div>
          <div className="w-4 h-4 bg-blue-300 rounded-sm"></div>
          <div className="w-4 h-4 bg-blue-400 rounded-sm"></div>
          <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
          <div className="w-4 h-4 bg-blue-800 rounded-sm"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
