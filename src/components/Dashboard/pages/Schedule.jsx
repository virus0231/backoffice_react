import { useState } from 'react';
import './Schedule.css';

const BASE_URL = import.meta.env.DEV
  ? '/backoffice/yoc'
  : 'https://forgottenwomen.youronlineconversation.com/backoffice/yoc';

const Schedule = () => {
  const [filters, setFilters] = useState({
    status: '',
    frequency: '',
    fromDate: '',
    toDate: '',
    search: ''
  });

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.frequency) params.append('frequency', filters.frequency);
      if (filters.fromDate) params.append('from_date', filters.fromDate);
      if (filters.toDate) params.append('to_date', filters.toDate);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`${BASE_URL}/schedules.php?${params.toString()}`, {
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success) {
        setSchedules(result.data);
      } else {
        setError('Failed to load schedules');
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to load schedules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.frequency) params.append('frequency', filters.frequency);
    if (filters.fromDate) params.append('from_date', filters.fromDate);
    if (filters.toDate) params.append('to_date', filters.toDate);
    if (filters.search) params.append('search', filters.search);

    window.open(`${BASE_URL}/schedules-export.php?${params.toString()}`, '_blank');
  };

  const handleDetail = (schedule) => {
    alert(`Order ID: ${schedule.order_id}\nName: ${schedule.name}\nEmail: ${schedule.email}\nAmount: $${schedule.amount}\nFrequency: ${schedule.frequency}`);
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
        {error && (
          <div className="users-error" style={{ marginBottom: 12 }}>
            <strong>Error:</strong> {error}
          </div>
        )}

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
                <option value="">All</option>
                <option value="Completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="frequency">Frequency :</label>
              <select
                id="frequency"
                className="select-input"
                value={filters.frequency}
                onChange={(e) => handleFilterChange('frequency', e.target.value)}
              >
                <option value="">All</option>
                <option value="1">Monthly</option>
                <option value="2">Yearly</option>
                <option value="3">Daily</option>
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
                <button className="search-btn" onClick={handleSearch} disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
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

        {loading && (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#666'
          }}>
            Loading schedules...
          </div>
        )}

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
              {!loading && schedules.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    No schedules found. Use filters to search for schedules.
                  </td>
                </tr>
              ) : (
                schedules.map((schedule, index) => (
                  <tr key={schedule.id}>
                    <td>{index + 1}</td>
                    <td className="schedule-type">{schedule.donationType}</td>
                    <td className="schedule-date">{new Date(schedule.startDate).toLocaleDateString()}</td>
                    <td className="schedule-name">{schedule.name}</td>
                    <td className="schedule-email">{schedule.email}</td>
                    <td className="schedule-amount">${schedule.amount.toFixed(2)}</td>
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
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
