import { useState, useEffect } from 'react';
import './FeaturedAmount.css';

const BASE_URL = import.meta.env.DEV
  ? '/backoffice/yoc'
  : 'https://forgottenwomen.youronlineconversation.com/backoffice/yoc';

const FeaturedAmount = () => {
  const [featuredAmounts, setFeaturedAmounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedAmounts();
  }, []);

  const fetchFeaturedAmounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/featured-amounts.php`, {
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success && result.data) {
        setFeaturedAmounts(result.data);
      } else {
        setError('Failed to load featured amounts');
      }
    } catch (err) {
      console.error('Error fetching featured amounts:', err);
      setError('Failed to load featured amounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = !currentStatus;

    // Optimistic UI update
    setFeaturedAmounts(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );

    try {
      const response = await fetch(`${BASE_URL}/toggle-featured-status.php`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount_id: id,
          status: newStatus
        })
      });

      const result = await response.json();

      if (!result.success) {
        // Revert on failure
        setFeaturedAmounts(prev =>
          prev.map(item =>
            item.id === id ? { ...item, status: currentStatus } : item
          )
        );
        setError('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      // Revert on failure
      setFeaturedAmounts(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: currentStatus } : item
        )
      );
      setError('Failed to update status. Please try again.');
    }
  };

  return (
    <div className="featured-amount-page">
      <div className="featured-amount-header">
        <h1 className="featured-amount-title">Featured Amounts</h1>
        <div className="featured-amount-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Causes</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Featured Amounts</span>
        </div>
      </div>

      <div className="featured-amount-content">
        {error && (
          <div className="users-error" style={{ marginBottom: 12 }}>
            <strong>Error:</strong> {error}
            <button
              onClick={fetchFeaturedAmounts}
              className="edit-btn"
              style={{ marginLeft: 12, padding: '6px 12px' }}
            >
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#666'
          }}>
            Loading featured amounts...
          </div>
        )}

        <div className="table-container">
          <table className="featured-amount-table">
            <thead>
              <tr>
                <th>SNO</th>
                <th>Name</th>
                <th>Amount</th>
                <th>Appeal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!loading && featuredAmounts.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
                    No featured amounts available.
                  </td>
                </tr>
              ) : (
                featuredAmounts.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td className="amount-name">{item.name}</td>
                    <td className="amount-value">${item.amount}</td>
                    <td className="amount-appeal">{item.appeal_name}</td>
                    <td>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={item.status}
                          onChange={() => handleToggleStatus(item.id, item.status)}
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">{item.status ? 'Enable' : 'Disable'}</span>
                      </label>
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

export default FeaturedAmount;
