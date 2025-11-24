"use client";

import { useState, useMemo } from "react";
import { useFilterContext } from "@/providers/FilterProvider";
import { useDayTimeData } from "@/hooks/useDayTimeData";
import LoadingState from "@/components/common/LoadingState";
import ChartErrorFallback from "@/components/common/ChartErrorFallback";

const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const hours = ['12AM', '2AM', '4AM', '6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'];

// Get color based on donation count with dynamic scaling
const getColorForIntensity = (value: number, maxValue: number): string => {
  if (value === 0) return 'bg-gray-100';

  // Scale based on percentage of max
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  if (percentage <= 20) return 'bg-blue-200';
  if (percentage <= 40) return 'bg-blue-300';
  if (percentage <= 60) return 'bg-blue-400';
  if (percentage <= 80) return 'bg-blue-600';
  return 'bg-blue-800';
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
  const {
    isHydrated,
    selectedAppeals,
    selectedFunds
  } = useFilterContext();

  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number; donationCount: number; totalRaised: number } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Always use last 7 days - ignore global date filter
  // Memoize to prevent infinite re-renders
  const last7Days = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    return {
      startDate: sevenDaysAgo,
      endDate: today
    };
  }, []); // Empty dependency array - only calculate once

  // Fetch real data from API
  const appealIds = selectedAppeals.length > 0 ? selectedAppeals.map(a => a.id).join(',') : null;
  const fundIds = selectedFunds.length > 0 ? selectedFunds.map(f => f.id).join(',') : null;

  const { heatmapData, isLoading, hasError, error } = useDayTimeData(
    last7Days,
    appealIds,
    fundIds
  );

  // Calculate max value for color scaling
  const maxDonationCount = Math.max(
    ...heatmapData.flatMap(day => day.map(cell => cell.donationCount)),
    1
  );

  const handleCellHover = (dayIndex: number, hourIndex: number, donationCount: number, totalRaised: number, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setHoveredCell({ day: dayIndex, hour: hourIndex, donationCount, totalRaised });
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };

  // Show loading state
  if (!isHydrated || isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <LoadingState size="lg" message="Loading day and time data..." fullHeight />
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ChartErrorFallback
          error={new Error(error || "Failed to load day and time data")}
          resetError={() => window.location.reload()}
          title="Failed to load day and time data"
        />
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
              {heatmapData.map((dayData, dayIndex) => (
                <div key={dayIndex} className="flex gap-1.5">
                  {dayData.map((cell, hourIndex) => (
                    <div
                      key={hourIndex}
                      className={`flex-1 h-7 rounded cursor-pointer transition-all ${getColorForIntensity(cell.donationCount, maxDonationCount)} hover:ring-2 hover:ring-blue-500 hover:ring-offset-1`}
                      onMouseEnter={(e) => handleCellHover(dayIndex, hourIndex, cell.donationCount, cell.totalRaised, e)}
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
                ${hoveredCell.totalRaised.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-600">Donations</div>
              <div className="text-sm font-medium text-gray-900">{hoveredCell.donationCount}</div>
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
