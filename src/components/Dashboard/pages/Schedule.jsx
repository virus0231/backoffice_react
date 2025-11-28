import { useState } from 'react';
import API from '../../../utils/api';
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
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [error, setError] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setSchedules([]);
    setTotalRecords(0);
    setCurrentPage(1);
    setError(null);

    try {
      // Step 1: Get first chunk with total count
      const chunkSize = 500;
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.frequency) params.append('frequency', filters.frequency);
      if (filters.fromDate) params.append('from_date', filters.fromDate);
      if (filters.toDate) params.append('to_date', filters.toDate);
      if (filters.search) params.append('search', filters.search);
      params.append('offset', '0');
      params.append('limit', chunkSize.toString());

      const firstResponse = await fetch(`${BASE_URL}/schedules.php?${params.toString()}`, {
        credentials: 'include'
      });
      const firstResult = await firstResponse.json();

      if (!firstResult.success) {
        setError(firstResult.error || 'Failed to load schedules');
        setLoading(false);
        return;
      }

      const totalCount = firstResult.totalCount || firstResult.count;
      const firstChunkData = firstResult.data || [];

      if (totalCount === 0) {
        setError('No schedules found. Try adjusting your filters.');
        setLoading(false);
        return;
      }

      // Show first chunk immediately
      setSchedules(firstChunkData);
      setTotalRecords(firstChunkData.length);
      setLoading(false);

      // Step 2: Load remaining chunks in background
      const totalChunks = Math.ceil(totalCount / chunkSize);
      if (totalChunks > 1) {
        loadRemainingChunks(1, totalChunks, chunkSize, firstChunkData);
      }

    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to load schedules. Please try again.');
      setLoading(false);
    }
  };

  const loadRemainingChunks = async (startChunk, totalChunks, chunkSize, initialData) => {
    let allData = [...initialData];

    for (let chunk = startChunk; chunk < totalChunks; chunk++) {
      try {
        const offset = chunk * chunkSize;
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.frequency) params.append('frequency', filters.frequency);
        if (filters.fromDate) params.append('from_date', filters.fromDate);
        if (filters.toDate) params.append('to_date', filters.toDate);
        if (filters.search) params.append('search', filters.search);
        params.append('offset', offset.toString());
        params.append('limit', chunkSize.toString());

        const response = await fetch(`${BASE_URL}/schedules.php?${params.toString()}`, {
          credentials: 'include'
        });
        const result = await response.json();

        if (result.success && result.data) {
          allData = [...allData, ...result.data];
          setSchedules([...allData]);
          setTotalRecords(allData.length);

          if (result.data.length < chunkSize) {
            break;
          }
        } else {
          break;
        }
      } catch (error) {
        console.error('Error loading chunk:', error);
        break;
      }
    }
  };

  const handleExportCSV = async () => {
    setLoadingCSV(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.frequency) params.append('frequency', filters.frequency);
      if (filters.fromDate) params.append('from_date', filters.fromDate);
      if (filters.toDate) params.append('to_date', filters.toDate);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`${BASE_URL}/schedules-export.php?${params.toString()}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        alert('No data to export. Please adjust your filters.');
        return;
      }

      const dateString = API.getDateString();
      API.downloadFile(blob, `ForgottenWomen_Schedules_${dateString}.csv`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV: ' + error.message);
    } finally {
      setLoadingCSV(false);
    }
  };

  const handleDetail = (schedule) => {
    alert(`Order ID: ${schedule.order_id}\nName: ${schedule.name}\nEmail: ${schedule.email}\nAmount: $${schedule.amount}\nFrequency: ${schedule.frequency}`);
  };

  // Pagination helpers
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = schedules.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(schedules.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationRange = () => {
    const range = [];
    const showPages = 5;
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);

    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
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
          <div className="schedule-error">
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
            <button
              className="export-csv-btn"
              onClick={handleExportCSV}
              disabled={loadingCSV}
            >
              {loadingCSV ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
          {totalRecords > 0 && (
            <div className="data-counter">
              <p>Filtered Value: {totalRecords}</p>
            </div>
          )}
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
              {loading ? (
                <tr>
                  <td colSpan="9" className="loading-data">
                    Loading data...
                  </td>
                </tr>
              ) : schedules.length > 0 ? (
                currentItems.map((schedule, index) => (
                  <tr key={schedule.id}>
                    <td>{indexOfFirstItem + index + 1}</td>
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
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    No schedules found. Use filters and click "Search" to search for schedules.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {schedules.length > 0 && totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, schedules.length)} of {schedules.length} records
              </div>
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  First
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                {getPaginationRange().map(pageNum => (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
