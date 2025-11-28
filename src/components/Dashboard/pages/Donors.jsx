import { useState, useEffect } from 'react';
import './Donors.css';

const BASE_URL = import.meta.env.DEV
  ? '/backoffice/yoc'
  : 'https://forgottenwomen.youronlineconversation.com/backoffice/yoc';

const Donors = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    perPage: 50,
    hasNext: false,
    hasPrev: false
  });
  const [hasSearched, setHasSearched] = useState(false);

  const fetchDonors = async (email = '', page = 1) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (email) params.append('email', email);
      params.append('page', page);
      params.append('limit', 50);

      const response = await fetch(`${BASE_URL}/donors.php?${params.toString()}`, {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success && result.data) {
        setDonors(result.data);
        setPagination(result.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          perPage: 50,
          hasNext: false,
          hasPrev: false
        });
        setHasSearched(true);
      } else {
        setError('Failed to load donors');
      }
    } catch (err) {
      console.error('Error fetching donors:', err);
      setError('Failed to load donors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchEmail.trim() || !hasSearched) {
      fetchDonors(searchEmail.trim(), 1);
    }
  };

  const handlePageChange = (newPage) => {
    fetchDonors(searchEmail.trim(), newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationRange = () => {
    const range = [];
    const showPages = 5;
    let start = Math.max(1, pagination.currentPage - Math.floor(showPages / 2));
    let end = Math.min(pagination.totalPages, start + showPages - 1);

    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

  const handleEdit = (donor) => {
    console.log('Edit donor:', donor);
    alert(`Edit donor: ${donor.firstName} ${donor.lastName}`);
  };

  const handleDonation = (donor) => {
    console.log('View donations for:', donor);
    alert(`View donations for: ${donor.firstName} ${donor.lastName}`);
  };

  const handleSubscription = (donor) => {
    console.log('View subscription for:', donor);
    alert(`View subscription for: ${donor.firstName} ${donor.lastName}`);
  };

  return (
    <div className="donors-page">
      <div className="donors-header">
        <h1 className="donors-title">Donor List</h1>
        <div className="donors-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Donor</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Donor List</span>
        </div>
      </div>

      <div className="donors-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="search-section">
          <div className="search-input-group">
            <label htmlFor="donor-email">Search Donors (Email/Name)</label>
            <input
              type="text"
              id="donor-email"
              placeholder="Enter email, first name, or last name"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button className="search-btn" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          {searchEmail && (
            <button
              className="clear-btn"
              onClick={() => {
                setSearchEmail('');
                setDonors([]);
                setHasSearched(false);
                setPagination({
                  currentPage: 1,
                  totalPages: 0,
                  totalCount: 0,
                  perPage: 50,
                  hasNext: false,
                  hasPrev: false
                });
              }}
              disabled={loading}
            >
              Clear
            </button>
          )}
        </div>

        {!hasSearched && !loading && (
          <div style={{
            padding: '48px 24px',
            textAlign: 'center',
            color: '#666',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h3 style={{ marginBottom: '12px', color: '#333' }}>Search for Donors</h3>
            <p>Enter an email address, first name, or last name to search for donors.</p>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>Or click Search to view all donors (paginated).</p>
          </div>
        )}

        {loading && (
          <div className="loading-message">
            Loading donors...
          </div>
        )}

        {!loading && hasSearched && (
          <>
            <div style={{
              padding: '12px 0',
              color: '#666',
              fontSize: '14px'
            }}>
              Showing {donors.length} of {pagination.totalCount.toLocaleString()} donors
              {searchEmail && ` matching "${searchEmail}"`}
            </div>

            <div className="donors-table-container">
              <table className="donors-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.length > 0 ? (
                    donors.map((donor) => (
                      <tr key={donor.id}>
                        <td>{donor.id}</td>
                        <td className="donor-first-name">{donor.firstName}</td>
                        <td className="donor-last-name">{donor.lastName}</td>
                        <td className="donor-phone">{donor.phone}</td>
                        <td className="donor-email">{donor.email}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn edit-btn" onClick={() => handleEdit(donor)}>
                              Edit
                            </button>
                            <button className="action-btn donation-btn" onClick={() => handleDonation(donor)}>
                              Donation
                            </button>
                            <button className="action-btn subscription-btn" onClick={() => handleSubscription(donor)}>
                              Subscription
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-results">
                        <p>No donors found{searchEmail && ` matching "${searchEmail}"`}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 0',
                marginTop: '20px',
                borderTop: '1px solid #e0e0e0'
              }}>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="search-btn"
                    onClick={() => handlePageChange(1)}
                    disabled={!pagination.hasPrev}
                    style={{ padding: '8px 16px', fontSize: '14px' }}
                  >
                    First
                  </button>
                  <button
                    className="search-btn"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    style={{ padding: '8px 16px', fontSize: '14px' }}
                  >
                    Previous
                  </button>

                  {getPaginationRange().map(pageNum => (
                    <button
                      key={pageNum}
                      className="search-btn"
                      onClick={() => handlePageChange(pageNum)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '14px',
                        backgroundColor: pageNum === pagination.currentPage ? '#4CAF50' : undefined,
                        color: pageNum === pagination.currentPage ? 'white' : undefined,
                        fontWeight: pageNum === pagination.currentPage ? 'bold' : undefined
                      }}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    className="search-btn"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    style={{ padding: '8px 16px', fontSize: '14px' }}
                  >
                    Next
                  </button>
                  <button
                    className="search-btn"
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={!pagination.hasNext}
                    style={{ padding: '8px 16px', fontSize: '14px' }}
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Donors;
