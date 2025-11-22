import { useState, useRef, useEffect } from 'react';
import './DateRangePicker.css';

const datePresets = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 days' },
  { value: 'last30days', label: 'Last 30 days' },
  { value: 'thisWeek', label: 'This week' },
  { value: 'lastWeek', label: 'Last week' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'lastYear', label: 'Last year' }
];

const formatDate = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

const formatMonthYear = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

const isSameDay = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

const DateRangePicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingDate, setSelectingDate] = useState(null);
  const [tempRange, setTempRange] = useState({
    start: value.startDate,
    end: value.endDate
  });
  const [hoveredDate, setHoveredDate] = useState(null);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    setTempRange({ start: value.startDate, end: value.endDate });
  }, [value.startDate, value.endDate]);

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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Get day of week (0 = Sunday, we want Monday = 0)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handleDateClick = (date) => {
    if (!selectingDate) {
      setTempRange({ start: date, end: null });
      setSelectingDate('end');
    } else {
      const start = tempRange.start;
      const end = date;
      const newRange = {
        startDate: start <= end ? start : end,
        endDate: start <= end ? end : start,
        preset: 'custom'
      };
      onChange(newRange);
      setTempRange({ start: newRange.startDate, end: newRange.endDate });
      setSelectingDate(null);
      setHoveredDate(null);
      setIsOpen(false);
    }
  };

  const handlePresetSelect = (preset) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let startDate, endDate;

    switch (preset) {
      case 'today':
        startDate = endDate = new Date(today);
        break;
      case 'yesterday':
        startDate = endDate = new Date(today);
        startDate.setDate(startDate.getDate() - 1);
        endDate.setDate(endDate.getDate() - 1);
        break;
      case 'last7days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6);
        endDate = new Date(today);
        break;
      case 'last30days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 29);
        endDate = new Date(today);
        break;
      case 'thisWeek':
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - diff);
        endDate = new Date(today);
        break;
      case 'lastWeek':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7 - (today.getDay() === 0 ? 6 : today.getDay() - 1));
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);
        startDate = lastWeekStart;
        endDate = lastWeekEnd;
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today);
        break;
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'lastYear':
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        endDate = new Date(today.getFullYear() - 1, 11, 31);
        break;
      default:
        return;
    }

    onChange({ startDate, endDate, preset });
    setTempRange({ start: startDate, end: endDate });
    setSelectingDate(null);
    setHoveredDate(null);
    setIsOpen(false);
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

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const displayText = `${formatDate(value.startDate)} - ${formatDate(value.endDate)}`;

  return (
    <div className="date-range-picker">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="date-range-button"
      >
        <div className="date-range-button-content">
          <svg className="date-range-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="date-range-text">{displayText}</span>
        </div>
        <svg
          className={`date-range-chevron ${isOpen ? 'open' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div ref={dropdownRef} className="date-range-dropdown">
          <div className="date-range-calendar-wrapper">
            {/* Calendar Section */}
            <div className="date-range-calendar">
              <div className="calendar-header">
                <button onClick={prevMonth} className="calendar-nav-btn">
                  <svg className="calendar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="calendar-months">
                  <span className="calendar-month-title">{formatMonthYear(currentMonth)}</span>
                  <span className="calendar-month-title">
                    {formatMonthYear(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  </span>
                </div>
                <button onClick={nextMonth} className="calendar-nav-btn">
                  <svg className="calendar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {selectingDate === 'end' && tempRange.start && (
                <div className="calendar-selection-hint">Select end date</div>
              )}

              <div className="calendar-months-grid">
                {/* First Month */}
                <div className="calendar-month">
                  <div className="calendar-weekdays">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="calendar-weekday">{day}</div>
                    ))}
                  </div>
                  <div className="calendar-days">
                    {getDaysInMonth(currentMonth).map((day, index) => {
                      if (!day) return <div key={`empty-${index}`} className="calendar-day-empty" />;

                      const isSelected = isStartDate(day) || isEndDate(day);
                      const isInRange = isDateInRange(day);
                      const isInHoverRange = isDateInHoverRange(day);
                      const isTodayDate = isToday(day);

                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => handleDateClick(day)}
                          onMouseEnter={() => selectingDate === 'end' && tempRange.start && setHoveredDate(day)}
                          onMouseLeave={() => setHoveredDate(null)}
                          className={`calendar-day ${isSelected ? 'selected' : ''} ${isInRange || isInHoverRange ? 'in-range' : ''} ${isTodayDate && !isSelected ? 'today' : ''}`}
                        >
                          {day.getDate()}
                          {isTodayDate && !isSelected && <div className="today-dot" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Second Month */}
                <div className="calendar-month">
                  <div className="calendar-weekdays">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="calendar-weekday">{day}</div>
                    ))}
                  </div>
                  <div className="calendar-days">
                    {getDaysInMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)).map((day, index) => {
                      if (!day) return <div key={`empty-${index}`} className="calendar-day-empty" />;

                      const isSelected = isStartDate(day) || isEndDate(day);
                      const isInRange = isDateInRange(day);
                      const isInHoverRange = isDateInHoverRange(day);
                      const isTodayDate = isToday(day);

                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => handleDateClick(day)}
                          onMouseEnter={() => selectingDate === 'end' && tempRange.start && setHoveredDate(day)}
                          onMouseLeave={() => setHoveredDate(null)}
                          className={`calendar-day ${isSelected ? 'selected' : ''} ${isInRange || isInHoverRange ? 'in-range' : ''} ${isTodayDate && !isSelected ? 'today' : ''}`}
                        >
                          {day.getDate()}
                          {isTodayDate && !isSelected && <div className="today-dot" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Presets Sidebar */}
            <div className="date-range-presets">
              {datePresets.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetSelect(preset.value)}
                  className={`preset-button ${value.preset === preset.value ? 'active' : ''}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
