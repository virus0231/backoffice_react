import { useState, useEffect } from 'react';
import { useToast } from '../../ToastContainer';
import './Donors.css';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api/v1' : 'https://forgottenwomen.youronlineconversation.com/api/v1');

const Donors = () => {
  const { showSuccess, showError } = useToast();
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

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDonationsModal, setShowDonationsModal] = useState(false);
  const [showSubscriptionsModal, setShowSubscriptionsModal] = useState(false);

  // Selected donor data
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [donorDetails, setDonorDetails] = useState(null);
  const [donations, setDonations] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  // Modal loading states
  const [modalLoading, setModalLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchDonors = async (email = '', page = 1) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (email) params.append('email', email);
      params.append('page', page);
      params.append('limit', 50);

      const response = await fetch(`${API_BASE}/donors?${params.toString()}`);

      const result = await response.json();

      if (result.success && result.data) {
        const dataWithSno = result.data.map((d, idx) => ({
          ...d,
          sno: (page - 1) * 50 + idx + 1,
        }));

        setDonors(dataWithSno);
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

  const fetchDonorDetails = async (donorId) => {
    try {
      setModalLoading(true);
      const response = await fetch(`${API_BASE}/donors/${donorId}`);
      const result = await response.json();

      if (result.success && result.data) {
        setDonorDetails(result.data);
      } else {
        showError('Failed to load donor details');
      }
    } catch (err) {
      console.error('Error fetching donor details:', err);
      showError('Failed to load donor details');
    } finally {
      setModalLoading(false);
    }
  };

  const fetchDonorDonations = async (donorId) => {
    try {
      setModalLoading(true);
      const response = await fetch(`${API_BASE}/donors/${donorId}/donations`);
      const result = await response.json();

      if (result.success) {
        setDonations(result.data || []);
      } else {
        showError('Failed to load donations');
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
      showError('Failed to load donations');
    } finally {
      setModalLoading(false);
    }
  };

  const fetchDonorSubscriptions = async (donorId) => {
    try {
      setModalLoading(true);
      const response = await fetch(`${API_BASE}/donors/${donorId}/subscriptions`);
      const result = await response.json();

      if (result.success) {
        setSubscriptions(result.data || []);
      } else {
        showError('Failed to load subscriptions');
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      showError('Failed to load subscriptions');
    } finally {
      setModalLoading(false);
    }
  };

  const updateDonor = async (updatedData) => {
    try {
      setUpdateLoading(true);

      const response = await fetch(`${API_BASE}/donors/${updatedData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organization: updatedData.organization,
          street: updatedData.address1,
          state: updatedData.address2,
          city: updatedData.city,
          country: updatedData.country,
          postcode: updatedData.postcode,
          firstName: updatedData.firstName,
          lastName: updatedData.lastName,
          email: updatedData.email,
          phone: updatedData.phone
        })
      });

      const result = await response.json();

      if (result.success) {
        showSuccess('Donor updated successfully!');
        setShowEditModal(false);
        fetchDonors(searchEmail.trim(), pagination.currentPage);
      } else {
        showError('Failed to update donor: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error updating donor:', err);
      showError('Failed to update donor. Please try again.');
    } finally {
      setUpdateLoading(false);
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

  const handleEdit = async (donor) => {
    setSelectedDonor(donor);
    setShowEditModal(true);
    await fetchDonorDetails(donor.id);
  };

  const handleDonation = async (donor) => {
    setSelectedDonor(donor);
    setShowDonationsModal(true);
    await fetchDonorDonations(donor.id);
  };

  const handleSubscription = async (donor) => {
    setSelectedDonor(donor);
    setShowSubscriptionsModal(true);
    await fetchDonorSubscriptions(donor.id);
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowDonationsModal(false);
    setShowSubscriptionsModal(false);
    setSelectedDonor(null);
    setDonorDetails(null);
    setDonations([]);
    setSubscriptions([]);
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
                    <th>S.No</th>
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
                      <tr key={donor.id ?? donor.sno}>
                        <td>{donor.sno ?? '-'}</td>
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

      {showEditModal && (
        <EditDonorModal
          donor={donorDetails}
          loading={modalLoading}
          updateLoading={updateLoading}
          onClose={closeModals}
          onSave={updateDonor}
        />
      )}

      {showDonationsModal && (
        <DonationsModal
          donor={selectedDonor}
          donations={donations}
          loading={modalLoading}
          onClose={closeModals}
        />
      )}

      {showSubscriptionsModal && (
        <SubscriptionsModal
          donor={selectedDonor}
          subscriptions={subscriptions}
          loading={modalLoading}
          onClose={closeModals}
        />
      )}
    </div>
  );
};

const EditDonorModal = ({ donor, loading, updateLoading, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    address1: '',
    address2: '',
    city: '',
    country: '',
    postcode: ''
  });

  useEffect(() => {
    if (donor) {
      setFormData({
        id: donor.id,
        firstName: donor.firstName || '',
        lastName: donor.lastName || '',
        email: donor.email || '',
        phone: donor.phone || '',
        organization: donor.organization || '',
        address1: donor.address1 || '',
        address2: donor.address2 || '',
        city: donor.city || '',
        country: donor.country || '',
        postcode: donor.postcode || ''
      });
    }
  }, [donor]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Donor</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {loading ? (
          <div className="modal-body">
            <p>Loading donor details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Organization</label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Address 1</label>
                  <input
                    type="text"
                    name="address1"
                    value={formData.address1}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Address 2</label>
                  <input
                    type="text"
                    name="address2"
                    value={formData.address2}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Postcode</label>
                  <input
                    type="text"
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={onClose} disabled={updateLoading}>
                Cancel
              </button>
              <button type="submit" className="btn-save" disabled={updateLoading}>
                {updateLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const DonationsModal = ({ donor, donations, loading, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Donations - {donor?.firstName} {donor?.lastName}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <p>Loading donations...</p>
          ) : donations.length === 0 ? (
            <p>No donations found for this donor.</p>
          ) : (
            <div className="donations-list">
              {donations.map((donation) => (
                <div key={donation.id} className="donation-card">
                  <div className="donation-header">
                    <h3>Order #{donation.orderId || donation.id}</h3>
                    <span className={`status-badge status-${donation.status?.toLowerCase()}`}>
                      {donation.status}
                    </span>
                  </div>
                  <div className="donation-info">
                    <div className="info-row">
                      <strong>Total Amount:</strong> {formatCurrency(donation.totalAmount, donation.currency)}
                    </div>
                    <div className="info-row">
                      <strong>Payment Type:</strong> {donation.paymentType}
                    </div>
                    <div className="info-row">
                      <strong>Date:</strong> {formatDate(donation.date)}
                    </div>
                  </div>
                  {donation.details && donation.details.length > 0 && (
                    <div className="donation-details">
                      <h4>Details:</h4>
                      <table className="details-table">
                        <thead>
                          <tr>
                            <th>Appeal</th>
                            <th>Amount</th>
                            <th>Fund</th>
                            <th>Qty</th>
                            <th>Frequency</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donation.details.map((detail, idx) => (
                            <tr key={idx}>
                              <td>{detail.appealName || `Appeal #${detail.appealId}`}</td>
                              <td>{detail.amountName || `Amount #${detail.amountId}`}</td>
                              <td>{detail.fundName || `Fund #${detail.fundId}`}</td>
                              <td>{detail.quantity}</td>
                              <td>{detail.frequency}</td>
                              <td>{formatCurrency(detail.amount * detail.quantity, donation.currency)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const SubscriptionsModal = ({ donor, subscriptions, loading, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Subscriptions - {donor?.firstName} {donor?.lastName}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <p>Loading subscriptions...</p>
          ) : subscriptions.length === 0 ? (
            <p>No subscriptions found for this donor.</p>
          ) : (
            <div className="subscriptions-list">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="subscription-card">
                  <div className="subscription-header">
                    <h3>Subscription #{subscription.subscriptionId || subscription.id}</h3>
                    <span className={`status-badge status-${subscription.status?.toLowerCase()}`}>
                      {subscription.status}
                    </span>
                  </div>
                  <div className="subscription-info">
                    <div className="info-row">
                      <strong>Order ID:</strong> {subscription.subscriptionId || 'N/A'}
                    </div>
                    <div className="info-row">
                      <strong>Amount:</strong> {formatCurrency(subscription.amount || 0)}
                    </div>
                    <div className="info-row">
                      <strong>Frequency:</strong> {subscription.frequency || 'N/A'}
                    </div>
                    <div className="info-row">
                      <strong>Next Billing Date:</strong> {formatDate(subscription.nextBillingDate)}
                    </div>
                    <div className="info-row">
                      <strong>Start Date:</strong> {formatDate(subscription.createdAt)}
                    </div>
                    <div className="info-row">
                      <strong>Remaining Payments:</strong> {subscription.remainingCount || 'N/A'} / {subscription.totalCount || 'N/A'}
                    </div>
                  </div>
                  {subscription.details && subscription.details.length > 0 && (
                    <div className="subscription-details">
                      <h4>Subscription Details:</h4>
                      <table className="details-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Appeal</th>
                            <th>Amount</th>
                            <th>Fund</th>
                            <th>Frequency</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subscription.details.map((detail, idx) => (
                            <tr key={idx}>
                              <td>{detail.orderId}</td>
                              <td>{detail.appealName || `Appeal #${detail.appealId}`}</td>
                              <td>{detail.amountName || `Amount #${detail.amountId}`}</td>
                              <td>{detail.fundName || `Fund #${detail.fundId}`}</td>
                              <td>{detail.frequency}</td>
                              <td>{formatCurrency(detail.totalAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default Donors;
