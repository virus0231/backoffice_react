import { useState } from 'react';
import API from '../../../utils/api';
import './DonationsReport.css';

const DonationsReport = () => {
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    paymentStatus: '',
    search: '',
    donations: '',
    orderSearch: '',
    paymentType: '',
    frequency: '',
    season: ''
  });

  const [donations, setDonations] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingDetailCSV, setLoadingDetailCSV] = useState(false);
  const [loadingSummaryCSV, setLoadingSummaryCSV] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGetReport = async () => {
    setLoadingReport(true);
    setDonations([]);
    setTotalRecords(0);
    setCurrentPage(1);

    try {
      const baseRequestData = {
        startDate: filters.fromDate || '',
        endDate: filters.toDate || '',
        status: filters.paymentStatus || '0',
        paymentType: filters.paymentType || '0',
        frequency: filters.frequency || '',
        txtsearch: filters.search || '',
        orderid: filters.orderSearch || ''
      };

      // Step 1: Get total count first
      const countResponse = await API.post('getReportData.php', {
        GetReport: 'getReport',
        ...baseRequestData
      });

      let totalCount = 0;
      if (typeof countResponse === 'string') {
        totalCount = parseInt(countResponse) || 0;
      } else if (typeof countResponse === 'number') {
        totalCount = countResponse;
      }

      if (totalCount === 0) {
        alert('No data found. Try adjusting your filters.');
        setLoadingReport(false);
        return;
      }

      // Step 2: Load first chunk and show immediately
      const chunkSize = 500;
      const totalChunks = Math.ceil(totalCount / chunkSize);

      // Load first chunk
      const firstChunkResponse = await API.post('getReportData.php', {
        GetReport: 'getReport',
        loadData: '0',
        chunkSize: chunkSize.toString(),
        ...baseRequestData
      });

      let firstChunkData = [];
      if (typeof firstChunkResponse === 'string') {
        try {
          firstChunkData = JSON.parse(firstChunkResponse);
        } catch (e) {
          console.error('JSON Parse Error:', e);
          firstChunkData = [];
        }
      } else if (Array.isArray(firstChunkResponse)) {
        firstChunkData = firstChunkResponse;
      }

      // Show first chunk immediately
      setDonations(firstChunkData);
      setTotalRecords(firstChunkData.length);
      setLoadingReport(false); // Stop loading indicator

      // Step 3: Load remaining chunks in background
      if (totalChunks > 1) {
        loadRemainingChunks(1, totalChunks, chunkSize, baseRequestData, firstChunkData);
      }

    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Failed to fetch report data: ' + error.message);
      setLoadingReport(false);
    }
  };

  const loadRemainingChunks = async (startChunk, totalChunks, chunkSize, baseRequestData, initialData) => {
    let allData = [...initialData];

    for (let chunk = startChunk; chunk < totalChunks; chunk++) {
      try {
        const offset = chunk * chunkSize;

        const chunkResponse = await API.post('getReportData.php', {
          GetReport: 'getReport',
          loadData: offset.toString(),
          chunkSize: chunkSize.toString(),
          ...baseRequestData
        });

        let chunkData = [];
        if (typeof chunkResponse === 'string') {
          try {
            chunkData = JSON.parse(chunkResponse);
          } catch (e) {
            console.error('JSON Parse Error:', e);
            chunkData = [];
          }
        } else if (Array.isArray(chunkResponse)) {
          chunkData = chunkResponse;
        }

        allData = [...allData, ...chunkData];

        // Update table with new data in background
        setDonations([...allData]);
        setTotalRecords(allData.length);

        // Break if we got less data than expected
        if (chunkData.length < chunkSize) {
          break;
        }
      } catch (error) {
        console.error('Error loading chunk:', error);
        break;
      }
    }
  };

  const handleExportDetailCSV = async () => {
    setLoadingDetailCSV(true);
    try {
      const blob = await API.post('export_optimized.php', {
        btnexport: true,
        startDate: filters.fromDate || '',
        endDate: filters.toDate || '',
        status: filters.paymentStatus || '0',
        paymentType: filters.paymentType || '0',
        frequency: filters.frequency || '',
        txtsearch: filters.search || '',
        orderid: filters.orderSearch || ''
      }, { responseType: 'blob' });

      if (blob.size === 0) {
        alert('No data to export. Please adjust your filters.');
        return;
      }

      const dateString = API.getDateString();
      API.downloadFile(blob, `ForgottenWomen_DonationDetailReport_${dateString}.csv`);
    } catch (error) {
      console.error('Error exporting detail CSV:', error);
      alert('Failed to export detail CSV: ' + error.message);
    } finally {
      setLoadingDetailCSV(false);
    }
  };

  const handleExportSummaryCSV = async () => {
    setLoadingSummaryCSV(true);
    try {
      const blob = await API.post('export_optimized.php', {
        btnexport_summary: true,
        startDate: filters.fromDate || '',
        endDate: filters.toDate || '',
        status: filters.paymentStatus || '0',
        paymentType: filters.paymentType || '0',
        frequency: filters.frequency || '',
        txtsearch: filters.search || '',
        orderid: filters.orderSearch || ''
      }, { responseType: 'blob' });

      if (blob.size === 0) {
        alert('No data to export. Please adjust your filters.');
        return;
      }

      const dateString = API.getDateString();
      API.downloadFile(blob, `ForgottenWomen_DonationSummaryReport_${dateString}.csv`);
    } catch (error) {
      console.error('Error exporting summary CSV:', error);
      alert('Failed to export summary CSV: ' + error.message);
    } finally {
      setLoadingSummaryCSV(false);
    }
  };

  const handleAction = (donation) => {
    console.log('Action for donation:', donation);
    // Implement view details modal or navigation
  };

  // Pagination helpers
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = donations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(donations.length / itemsPerPage);

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
    <div className="donations-report-page">
      <div className="donations-report-header">
        <h1 className="donations-report-title">Donations Report</h1>
        <div className="donations-report-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Report</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Donations</span>
        </div>
      </div>

      <div className="donations-report-content">
        <div className="report-filter-section">
          <div className="filter-grid">
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

            <div className="filter-group">
              <label htmlFor="payment-status">Payment Status:</label>
              <select
                id="payment-status"
                className="select-input"
                value={filters.paymentStatus}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              >
                <option value="0">All</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="search">Search :</label>
              <input
                type="text"
                id="search"
                className="text-input"
                placeholder="Email/Phone/FirstName/Lastname"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="donations">Donations:</label>
              <input
                type="text"
                id="donations"
                className="text-input"
                value={filters.donations}
                onChange={(e) => handleFilterChange('donations', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="order-search">Search :</label>
              <input
                type="text"
                id="order-search"
                className="text-input"
                placeholder="Order Id or Transaction Id"
                value={filters.orderSearch}
                onChange={(e) => handleFilterChange('orderSearch', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="payment-type">Payment Type:</label>
              <select
                id="payment-type"
                className="select-input"
                value={filters.paymentType}
                onChange={(e) => handleFilterChange('paymentType', e.target.value)}
              >
                <option value="">Select</option>
                <option value="credit-card">Credit Card</option>
                <option value="debit-card">Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <div className="filter-group empty-space"></div>

            <div className="filter-group">
              <label htmlFor="frequency">Frequency:</label>
              <select
                id="frequency"
                className="select-input"
                value={filters.frequency}
                onChange={(e) => handleFilterChange('frequency', e.target.value)}
              >
                <option value="">All</option>
                <option value="0">One-Time</option>
                <option value="1">Monthly</option>
                <option value="2">Quarterly</option>
                <option value="3">Yearly</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="season">Season:</label>
              <select
                id="season"
                className="select-input"
                value={filters.season}
                onChange={(e) => handleFilterChange('season', e.target.value)}
              >
                <option value="">Select Season</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="fall">Fall</option>
                <option value="winter">Winter</option>
                <option value="ramadan">Ramadan</option>
                <option value="year-end">Year-End</option>
              </select>
            </div>
          </div>

          <div className="export-buttons-row">
            <button
              className="report-btn"
              onClick={handleGetReport}
              disabled={loadingReport}
            >
              {loadingReport ? 'Loading...' : 'Get Report'}
            </button>
            <button
              className="export-detail-btn"
              onClick={handleExportDetailCSV}
              disabled={loadingDetailCSV}
            >
              {loadingDetailCSV ? 'Exporting...' : 'Export Detail CSV'}
            </button>
            <button
              className="export-summary-btn"
              onClick={handleExportSummaryCSV}
              disabled={loadingSummaryCSV}
            >
              {loadingSummaryCSV ? 'Exporting...' : 'Export Summary CSV'}
            </button>
          </div>
          {totalRecords > 0 && (
            <div className="data-counter">
              <p>Filtered Value: {totalRecords}</p>
            </div>
          )}
        </div>

        <div className="donation-table-container">
          <table className="donation-table">
            <thead>
              <tr>
                <th>SNO</th>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingReport ? (
                <tr>
                  <td colSpan="7" className="loading-data">
                    Loading data...
                  </td>
                </tr>
              ) : donations.length > 0 ? (
                currentItems.map((donation, index) => (
                  <tr key={index}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td className="donation-date">{donation.date || 'N/A'}</td>
                    <td className="donation-name">{`${donation.firstname || ''} ${donation.lastname || ''}`.trim() || 'N/A'}</td>
                    <td className="donation-email">{donation.email || 'N/A'}</td>
                    <td className="donation-amount">£{donation.charge_amount || donation.totalamount || '0.00'}</td>
                    <td>
                      <span className={`status-badge status-${(donation.status || 'pending').toLowerCase()}`}>
                        {donation.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="table-action-btn"
                        onClick={() => handleAction(donation)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No donations found. Use filters and click "Get Report" to search for donations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {donations.length > 0 && totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, donations.length)} of {donations.length} records
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

export default DonationsReport;
