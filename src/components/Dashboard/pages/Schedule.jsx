import { useState, useEffect, useRef, useMemo } from 'react';
import { format } from 'date-fns';
import DateRangePicker from '@/components/filters/DateRangePicker';
import apiClient from '@/lib/api/client';
import { useToast } from '../../ToastContainer';
import './Schedule.css';
const CHUNK_SIZE = 500;

const Schedule = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [filters, setFilters] = useState({
    status: '',
    frequency: '',
    fromDate: '',
    toDate: '',
    search: ''
  });
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    preset: null
  });

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [error, setError] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [showScheduleDetail, setShowScheduleDetail] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true; // ensure true on mount (handles StrictMode double-invoke)
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setFilters(prev => ({
      ...prev,
      fromDate: format(range.startDate, 'yyyy-MM-dd'),
      toDate: format(range.endDate, 'yyyy-MM-dd')
    }));
  };

  const handleClearDateRange = () => {
    setDateRange({
      startDate: null,
      endDate: null,
      preset: null
    });
    setFilters(prev => ({
      ...prev,
      fromDate: '',
      toDate: ''
    }));
  };

  const fetchSchedulesChunk = async (cursor = null, limit = CHUNK_SIZE) => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.frequency) params.frequency = filters.frequency;
    if (filters.fromDate) params.from_date = filters.fromDate;
    if (filters.toDate) params.to_date = filters.toDate;
    if (filters.search) params.search = filters.search;
    if (cursor) params.cursor = cursor.toString();
    params.limit = limit.toString();

    const result = await apiClient.get('schedules', params);

    if (!result?.success) {
      throw new Error(result?.error || 'Failed to load schedules');
    }

    const data = Array.isArray(result.data) ? result.data : [];
    const totalCount = result.totalCount || result.count || 0;
    const hasMore = result.hasMore ?? data.length === limit;
    const nextCursor = result.nextCursor ?? (data.length ? data[data.length - 1].id : null);

    return { data, totalCount, hasMore, nextCursor };
  };

  const handleSearch = async () => {
    setLoading(true);
    setSchedules([]);
    setTotalRecords(0);
    setCurrentPage(1);
    setError(null);

    try {
      // Step 1: Get first chunk with total count
      const firstChunk = await fetchSchedulesChunk(null, CHUNK_SIZE);

      const totalCount = firstChunk.totalCount || firstChunk.data.length;
      const firstChunkData = firstChunk.data || [];

      if (totalCount === 0 || firstChunkData.length === 0) {
        setError('No schedules found. Try adjusting your filters.');
        setLoading(false);
        return;
      }

      // Show first chunk immediately
      setSchedules(firstChunkData);
      setTotalRecords(Math.max(totalCount, firstChunkData.length));
      setLoading(false);

      // Step 2: Load remaining chunks in background using cursor-based pagination
      if (firstChunk.hasMore && firstChunk.nextCursor) {
        loadRemainingChunks(firstChunk.nextCursor, firstChunkData, totalCount);
      }

    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to load schedules. Please try again.');
      setLoading(false);
    }
  };

  const loadRemainingChunks = async (startCursor, initialData, reportedTotal) => {
    let allData = [...initialData];
    let cursor = startCursor;

    while (cursor && isMountedRef.current) {
      try {
        const { data: newData, hasMore, nextCursor } = await fetchSchedulesChunk(cursor, CHUNK_SIZE);
        if (!isMountedRef.current) break;
        if (!newData.length) break;

        allData = [...allData, ...newData];
        setSchedules([...allData]);
        setTotalRecords(Math.max(reportedTotal, allData.length));

        if (!hasMore || !nextCursor || nextCursor === cursor) break;
        cursor = nextCursor;
      } catch (error) {
        console.error('Error loading chunk:', error);
        break;
      }
    }
  };

  const handleExportCSV = async () => {
    setLoadingCSV(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.frequency) params.frequency = filters.frequency;
      if (filters.fromDate) params.from_date = filters.fromDate;
      if (filters.toDate) params.to_date = filters.toDate;
      if (filters.search) params.search = filters.search;

      const blob = await apiClient.get('schedules/export', params);

      if (blob.size === 0) {
        showWarning('No data to export. Please adjust your filters.');
        return;
      }

      const dateString = apiClient.getDateString();
      apiClient.downloadFile(blob, `ForgottenWomen_Schedules_${dateString}.csv`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showError('Failed to export CSV: ' + error.message);
    } finally {
      setLoadingCSV(false);
    }
  };

  const handleDetail = (schedule) => {
    setSelectedSchedule(schedule);
    setShowScheduleDetail(true);
  };

  const closeScheduleDetail = () => {
    setShowScheduleDetail(false);
    setSelectedSchedule(null);
  };

  const formatCurrency = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' }) : (value ?? 'N/A');
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  const formatFrequency = (value) => {
    const map = { '0': 'One-Off', '1': 'Monthly', '2': 'Yearly', '3': 'Daily' };
    return map[value] || value || 'N/A';
  };

  const buildAddress = (schedule) => {
    if (!schedule) return 'N/A';
    if (schedule.address) return schedule.address;
    const parts = [schedule.add1, schedule.city, schedule.add2, schedule.country, schedule.postcode].filter(Boolean);
    return parts.length ? parts.join(', ') : 'N/A';
  };

  const lineItems = useMemo(() => {
    if (!selectedSchedule || !Array.isArray(selectedSchedule.details)) return [];
    return selectedSchedule.details.map((item, idx) => ({
      id: item.id ?? idx + 1,
      date: item.date,
      donationType: item.donation_type || item.fund_name || 'Donation',
      amountName: item.amount_name || 'N/A',
      otherAmount: item.other_amount ?? 0,
      orderId: item.order_id || selectedSchedule.order_id || 'N/A',
      status: item.status || selectedSchedule.status || 'N/A',
      amount: item.line_total ?? item.other_amount ?? 0,
      frequency: formatFrequency(String(item.freq ?? '')),
    }));
  }, [selectedSchedule]);

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(schedules.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  const currentItems = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return schedules.slice(start, start + itemsPerPage);
  }, [schedules, safeCurrentPage, itemsPerPage]);

  const indexOfFirstItem = (safeCurrentPage - 1) * itemsPerPage;
  const indexOfLastItem = indexOfFirstItem + currentItems.length;

  const handlePageChange = (pageNumber) => {
    const nextPage = Math.min(Math.max(pageNumber, 1), totalPages);
    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationRange = () => {
    const range = [];
    const showPages = 5;
    let start = Math.max(1, safeCurrentPage - Math.floor(showPages / 2));
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

            <div className="filter-group" style={{ minWidth: '260px' }}>
              <label htmlFor="date-range">Date Range:</label>
              <div className="flex items-center gap-3">
                <DateRangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  placeholder="Select date range"
                  className="w-full"
                />
                {(dateRange.startDate && dateRange.endDate) && (
                  <button
                    type="button"
                    onClick={handleClearDateRange}
                    className="text-sm text-blue-100 underline decoration-blue-200 hover:decoration-white"
                  >
                    Clear
                  </button>
                )}
              </div>
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
                currentItems.map((schedule, index) => {
                  const rowKey = `${schedule.id || schedule.order_id || schedule.transaction_id || 'schedule'}-${indexOfFirstItem + index}`;
                  return (
                  <tr key={rowKey}>
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
                )})
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
                  disabled={safeCurrentPage === 1}
                >
                  First
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                >
                  Previous
                </button>

                {getPaginationRange().map(pageNum => (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${safeCurrentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                >
                  Next
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showScheduleDetail && selectedSchedule && (
        <div className="detail-modal-overlay" role="dialog" aria-modal="true">
          <div className="detail-modal-card schedule-detail-card">
            <div className="detail-modal-header">
              <div>
                <p className="detail-modal-eyebrow">Schedule Details</p>
                <h3 className="detail-modal-title">{selectedSchedule.name || 'Schedule'}</h3>
                <p className="detail-modal-subtitle">Order: {selectedSchedule.order_id || 'N/A'} · Transaction: {selectedSchedule.transaction_id || 'N/A'}</p>
              </div>
              <button className="detail-modal-close" onClick={closeScheduleDetail} aria-label="Close detail modal">
                ×
              </button>
            </div>

            <div className="detail-amount-row">
              <div className="detail-amount">{formatCurrency(selectedSchedule.amount)}</div>
            </div>

            <div className="detail-section grid-2col">
              <div className="detail-modal-grid">
                <div className="detail-item">
                  <span>Name</span>
                  <strong>{selectedSchedule.name || 'N/A'}</strong>
                </div>
                <div className="detail-item">
                  <span>Address</span>
                  <strong>{buildAddress(selectedSchedule)}</strong>
                </div>
                <div className="detail-item">
                  <span>Email</span>
                  <strong>{selectedSchedule.email || 'N/A'}</strong>
                </div>
                <div className="detail-item">
                  <span>Phone</span>
                  <strong>{selectedSchedule.phone || 'N/A'}</strong>
                </div>
              </div>

              <div className="detail-modal-grid">
                <div className="detail-item">
                  <span>Start Date</span>
                  <strong>{formatDate(selectedSchedule.startDate)}</strong>
                </div>
                <div className="detail-item">
                  <span>Frequency</span>
                  <strong>{formatFrequency(String(selectedSchedule.rawFrequency ?? selectedSchedule.frequency ?? ''))}</strong>
                </div>
                <div className="detail-item">
                  <span>Order Number</span>
                  <strong>{selectedSchedule.order_id || 'N/A'}</strong>
                </div>
                <div className="detail-item">
                  <span>Status</span>
                  <strong>
                    <span className={`status-badge status-${(selectedSchedule.status || 'pending').toLowerCase()}`}>
                      {selectedSchedule.status || 'Pending'}
                    </span>
                  </strong>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Transaction Details</h4>
              <div className="detail-lineitems-table-wrapper">
                <table className="detail-lineitems-table">
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Date</th>
                      <th>Donation Type</th>
                      <th>Amount Name</th>
                      <th>Other Amount</th>
                      <th>Order Id</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="detail-lineitems-empty">No transaction details available.</td>
                      </tr>
                    ) : (
                      lineItems.map(item => (
                        <tr key={`sched-line-${item.id}`}>
                          <td>{item.id}</td>
                          <td>{formatDate(item.date)}</td>
                          <td>{item.donationType}</td>
                          <td>{item.amountName}</td>
                          <td>{formatCurrency(item.otherAmount)}</td>
                          <td>{item.orderId}</td>
                          <td>{item.status}</td>
                          <td>{formatCurrency(item.amount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="detail-modal-footer">
              <button className="detail-modal-close-btn" onClick={closeScheduleDetail}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
