import { useState } from 'react';
import './Schedule.css';

const Schedule = () => {
  const [filters, setFilters] = useState({
    status: '',
    donations: '',
    fromDate: '',
    toDate: '',
    search: ''
  });

  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    console.log('Search with filters:', filters);
    // Implement search logic
    if (filters.search.trim() === '') {
      setFilteredSchedules(schedules);
    } else {
      const filtered = schedules.filter(schedule =>
        schedule.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        schedule.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        (schedule.phone && schedule.phone.includes(filters.search)) ||
        (schedule.organization && schedule.organization.toLowerCase().includes(filters.search.toLowerCase()))
      );
      setFilteredSchedules(filtered);
    }
  };

  const handleExportCSV = () => {
    console.log('Export CSV with filters:', filters);
    // Implement CSV export logic
    alert('Exporting CSV...');
  };

  const handleDetail = (schedule) => {
    console.log('View detail for schedule:', schedule);
    alert(`View detail for: ${schedule.name}`);
  };

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <h1 className="schedule-title">Schedules</h1>
        <div className="schedule-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Schedules</span>
        </div>
      </div>

      <div className="schedule-content">
        <div className="filter-section">
          <div className="filter-row-first">
            <div className="filter-group">
              <label htmlFor="status">Status :</label>
              <select
                id="status"
                className="select-input"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Select</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="donations">Donations :</label>
              <select
                id="donations"
                className="select-input"
                value={filters.donations}
                onChange={(e) => handleFilterChange('donations', e.target.value)}
              >
                <option value="">Select</option>
                <option value="one-time">One-Time</option>
                <option value="recurring">Recurring</option>
                <option value="pledge">Pledge</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="from-date">From:</label>
              <input
                type="date"
                id="from-date"
                className="date-input"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="to-date">To:</label>
              <input
                type="date"
                id="to-date"
                className="date-input"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-row-second">
            <div className="search-group">
              <label htmlFor="search">Search :</label>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  id="search"
                  className="search-input"
                  placeholder="F/L Name/Phone/Email/Organization"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="search-btn" onClick={handleSearch}>
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="export-row">
            <button className="export-csv-btn" onClick={handleExportCSV}>
              Export CSV
            </button>
          </div>
        </div>

        <div className="schedule-table-container">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>SNO</th>
                <th>Donation Type</th>
                <th>Start Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Frequency</th>
                <th>Status</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.length > 0 ? (
                filteredSchedules.map((schedule, index) => (
                  <tr key={schedule.id}>
                    <td>{index + 1}</td>
                    <td className="schedule-type">{schedule.donationType}</td>
                    <td className="schedule-date">{schedule.startDate}</td>
                    <td className="schedule-name">{schedule.name}</td>
                    <td className="schedule-email">{schedule.email}</td>
                    <td className="schedule-amount">${schedule.amount}</td>
                    <td className="schedule-frequency">{schedule.frequency}</td>
                    <td>
                      <span className={`status-badge status-${schedule.status.toLowerCase()}`}>
                        {schedule.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="detail-btn"
                        onClick={() => handleDetail(schedule)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    No schedules found. Use filters to search for schedules.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
