import { useState, useRef, useEffect, useCallback } from 'react';

const ComparisonDatePicker = ({ value, onChange, mainDateRange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectingDate, setSelectingDate] = useState(null);
  const [tempRange, setTempRange] = useState({
    start: value?.startDate || null,
    end: value?.endDate || null
  });
  const [hoveredDate, setHoveredDate] = useState(null);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Update internal state when value prop changes
  useEffect(() => {
    setTempRange({
      start: value?.startDate || null,
      end: value?.endDate || null
    });
  }, [value?.startDate, value?.endDate]);

  // Get comparison preset options based on main date range
  const getComparisonPresets = () => {
    const { startDate, endDate } = mainDateRange;
    const duration = endDate.getTime() - startDate.getTime();

    return [
      {
        label: 'Previous period',
        value: 'previousPeriod',
        getRange: () => {
          const prevStart = new Date(startDate.getTime() - duration - 24 * 60 * 60 * 1000);
          const prevEnd = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
          return { startDate: prevStart, endDate: prevEnd };
        }
      },
      {
        label: 'A month ago',
        value: 'monthAgo',
        getRange: () => {
          const monthAgoStart = new Date(startDate);
          monthAgoStart.setMonth(monthAgoStart.getMonth() - 1);
          const monthAgoEnd = new Date(endDate);
          monthAgoEnd.setMonth(monthAgoEnd.getMonth() - 1);
          return { startDate: monthAgoStart, endDate: monthAgoEnd };
        }
      },
      {
        label: 'A quarter ago',
        value: 'quarterAgo',
        getRange: () => {
          const quarterAgoStart = new Date(startDate);
          quarterAgoStart.setMonth(quarterAgoStart.getMonth() - 3);
          const quarterAgoEnd = new Date(endDate);
          quarterAgoEnd.setMonth(quarterAgoEnd.getMonth() - 3);
          return { startDate: quarterAgoStart, endDate: quarterAgoEnd };
        }
      },
      {
        label: 'A year ago',
        value: 'yearAgo',
        getRange: () => {
          const yearAgoStart = new Date(startDate);
          yearAgoStart.setFullYear(yearAgoStart.getFullYear() - 1);
          const yearAgoEnd = new Date(endDate);
          yearAgoEnd.setFullYear(yearAgoEnd.getFullYear() - 1);
          return { startDate: yearAgoStart, endDate: yearAgoEnd };
        }
      },
      {
        label: 'No comparison',
        value: 'noComparison',
        getRange: null
      }
    ];
  };

  const handleDateClick = useCallback((date) => {
    if (!selectingDate) {
      // Start new selection
      setTempRange({ start: date, end: null });
      setSelectingDate('end');
    } else if (selectingDate === 'end') {
      // Complete the range
      const start = tempRange.start;
      const end = date;

      const newRange = {
        startDate: start <= end ? start : end,
        endDate: start <= end ? end : start
      };

      onChange(newRange);
      setTempRange({ start: newRange.startDate, end: newRange.endDate });
      setSelectingDate(null);
      setHoveredDate(null);
      setIsOpen(false);
    }
  }, [selectingDate, tempRange.start, onChange]);

  const handlePresetSelect = (preset) => {
    if (preset.value === 'noComparison') {
      onChange(null);
      setTempRange({ start: null, end: null });
      setSelectingDate(null);
      setHoveredDate(null);
      setIsOpen(false);
      return;
    }

    if (preset.getRange) {
      const newRange = preset.getRange();
      onChange(newRange);
      setTempRange({ start: newRange.startDate, end: newRange.endDate });
      setSelectingDate(null);
      setHoveredDate(null);
      setIsOpen(false);
    }
  };

  const resetSelection = useCallback(() => {
    setSelectingDate(null);
    setHoveredDate(null);
    setTempRange({
      start: value?.startDate || null,
      end: value?.endDate || null
    });
  }, [value?.startDate, value?.endDate]);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        resetSelection();
      }
    };

    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          resetSelection();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handlePrevMonth();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNextMonth();
          break;
        default:
          break;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, resetSelection, handlePrevMonth, handleNextMonth]);

  const handleDateHover = (date) => {
    if (selectingDate === 'end' && tempRange.start) {
      setHoveredDate(date);
    }
  };

  const handleDateLeave = () => {
    setHoveredDate(null);
  };

  const getCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const startDayOfWeek = firstDay.getDay();
    // Convert to Monday = 0
    const emptyDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    return { emptyDays, days };
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isDateSelected = (date) => {
    if (!tempRange.start || !tempRange.end) return false;
    return isSameDay(date, tempRange.start) || isSameDay(date, tempRange.end);
  };

  const isDateInRange = (date) => {
    if (!tempRange.start || !tempRange.end) return false;
    return date >= tempRange.start && date <= tempRange.end;
  };

  const isDateInHoverRange = (date) => {
    if (!tempRange.start || !hoveredDate || !selectingDate) return false;
    const start = tempRange.start;
    const end = hoveredDate;
    const minDate = start <= end ? start : end;
    const maxDate = start <= end ? end : start;
    return date >= minDate && date <= maxDate;
  };

  const isStartDate = (date) => {
    return tempRange.start && isSameDay(date, tempRange.start);
  };

  const isEndDate = (date) => {
    return tempRange.end && isSameDay(date, tempRange.end);
  };

  const isToday = (date) => {
    return isSameDay(date, new Date());
  };

  const isDateInMainRange = (date) => {
    return date >= mainDateRange.startDate && date <= mainDateRange.endDate;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatDay = (date) => {
    return date.getDate();
  };

  const getNextMonth = (date) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1);
    return newDate;
  };

  const renderCalendar = (monthDate) => {
    const { emptyDays, days } = getCalendarDays(monthDate);

    return (
      <div className="comparison-calendar">
        <div className="comparison-calendar-header">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="comparison-weekday">{day}</div>
          ))}
        </div>
        <div className="comparison-calendar-grid">
          {Array.from({ length: emptyDays }, (_, i) => (
            <div key={`empty-${i}`} className="comparison-day-empty"></div>
          ))}
          {days.map((day) => {
            const isSelected = isDateSelected(day);
            const isInRange = isDateInRange(day);
            const isInHoverRange = isDateInHoverRange(day);
            const isStart = isStartDate(day);
            const isEnd = isEndDate(day);
            const isTodayDate = isToday(day);
            const isInMainPeriod = isDateInMainRange(day);
            const isDisabled = isInMainPeriod;

            let className = 'comparison-day';
            if (isDisabled) className += ' disabled';
            if (!isDisabled && !isSelected && !isInRange && !isInHoverRange) className += ' selectable';
            if (!isDisabled && isTodayDate && !isSelected) className += ' today';
            if (!isDisabled && (isInRange || isInHoverRange) && !isSelected) className += ' in-range';
            if (!isDisabled && isSelected) className += ' selected';
            if (!isDisabled && isStart && isEnd) className += ' single';
            if (!isDisabled && isStart && !isEnd) className += ' range-start';
            if (!isDisabled && isEnd && !isStart) className += ' range-end';
            if (!isDisabled && isInHoverRange && selectingDate === 'end') className += ' hover-range';

            return (
              <button
                key={day.toISOString()}
                onClick={() => !isDisabled && handleDateClick(day)}
                onMouseEnter={() => !isDisabled && handleDateHover(day)}
                onMouseLeave={handleDateLeave}
                disabled={isDisabled}
                className={className}
              >
                {formatDay(day)}
                {isTodayDate && !isSelected && (
                  <div className="comparison-today-dot"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="comparison-date-picker">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`comparison-toggle-btn ${value ? 'active' : ''}`}
      >
        <svg className="comparison-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {value ? (
          <div className="comparison-toggle-content">
            <span className="comparison-toggle-label">Compare</span>
            <span className="comparison-toggle-dates">
              {formatDate(value.startDate)} – {formatDate(value.endDate)}
            </span>
          </div>
        ) : (
          <span>No comparison</span>
        )}
        <svg className={`comparison-chevron ${isOpen ? 'open' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div ref={dropdownRef} className="comparison-dropdown">
          <div className="comparison-dropdown-content">
            {/* Calendar Section */}
            <div className="comparison-calendars-section">
              {/* Header with navigation */}
              <div className="comparison-nav-header">
                <button
                  onClick={handlePrevMonth}
                  className="comparison-nav-btn"
                  title="Previous month"
                >
                  <svg className="comparison-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="comparison-months-display">
                  <div className="comparison-month-labels">
                    <span className="comparison-month-label">{formatMonthYear(currentDate)}</span>
                    <span className="comparison-month-label">{formatMonthYear(getNextMonth(currentDate))}</span>
                  </div>
                  {selectingDate === 'end' && tempRange.start && (
                    <div className="comparison-selecting-hint">Select end date</div>
                  )}
                </div>
                <button
                  onClick={handleNextMonth}
                  className="comparison-nav-btn"
                  title="Next month"
                >
                  <svg className="comparison-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="comparison-calendars-grid">
                {renderCalendar(currentDate)}
                {renderCalendar(getNextMonth(currentDate))}
              </div>
            </div>

            {/* Preset Options Sidebar */}
            <div className="comparison-presets-sidebar">
              <div className="comparison-presets-list">
                {getComparisonPresets().map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetSelect(preset)}
                    className="comparison-preset-btn"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonDatePicker;
