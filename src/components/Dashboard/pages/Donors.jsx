import { useState, useEffect } from 'react';
import './Donors.css';

const BASE_URL = import.meta.env.DEV
  ? '/backoffice/yoc'
  : 'https://forgottenwomen.youronlineconversation.com/backoffice/yoc';

const Donors = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all donors on mount
  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async (email = '') => {
    try {
      setLoading(true);
      setError('');

      const url = email
        ? `${BASE_URL}/donors.php?email=${encodeURIComponent(email)}`
        : `${BASE_URL}/donors.php`;

      const response = await fetch(url, {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success && result.data) {
        setDonors(result.data);
        setFilteredDonors(result.data);
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
    fetchDonors(searchEmail.trim());
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
            <label htmlFor="donor-email">Donor Email</label>
            <input
              type="email"
              id="donor-email"
              placeholder="Enter Donor Email"
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
                fetchDonors();
              }}
              disabled={loading}
            >
              Clear
            </button>
          )}
        </div>

        {loading && (
          <div className="loading-message">
            Loading donors...
          </div>
        )}

        {!loading && (
          <div className="donors-table-container">
          <table className="donors-table">
            <thead>
              <tr>
                <th>SNO</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.map((donor) => (
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
              ))}
            </tbody>
          </table>

          {filteredDonors.length === 0 && (
            <div className="no-results">
              <p>No donors found{searchEmail && ` matching "${searchEmail}"`}</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default Donors;
