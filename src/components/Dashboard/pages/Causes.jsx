import { useState, useEffect } from 'react';
import './Causes.css';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api/v1' : 'https://forgottenwomen.youronlineconversation.com/api/v1');

const Causes = () => {
  const [filters, setFilters] = useState({
    appeal: '',
    minAmount: '',
    maxAmount: '',
    category: '',
    country: ''
  });

  const [causes, setCauses] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchDropdownData();
    fetchCauses();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [appealsRes, categoriesRes, countriesRes] = await Promise.all([
        fetch(`${API_BASE}/filters/appeals`),
        fetch(`${API_BASE}/filters/categories`),
        fetch(`${API_BASE}/filters/countries`)
      ]);

      const [appealsData, categoriesData, countriesData] = await Promise.all([
        appealsRes.json(),
        categoriesRes.json(),
        countriesRes.json()
      ]);

      if (appealsData.success) setAppeals(appealsData.data);
      if (categoriesData.success) setCategories(categoriesData.data);
      if (countriesData.success) setCountries(countriesData.data);
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  };

  const fetchCauses = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filterParams.appeal) params.append('appeal_id', filterParams.appeal);
      if (filterParams.category) params.append('category_id', filterParams.category);
      if (filterParams.country) params.append('country', filterParams.country);
      if (filterParams.minAmount) params.append('min_amount', filterParams.minAmount);
      if (filterParams.maxAmount) params.append('max_amount', filterParams.maxAmount);

      const response = await fetch(`${API_BASE}/reports/causes?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setCauses(result.data);
        setTotalAmount(result.total_amount || 0);
      } else {
        setError('Failed to load causes');
      }
    } catch (err) {
      console.error('Error fetching causes:', err);
      setError('Failed to load causes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilter = () => {
    fetchCauses(filters);
  };

  return (
    <div className="causes-page">
      <div className="causes-header">
        <h1 className="causes-title">Causes</h1>
        <div className="causes-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Causes</span>
        </div>
      </div>

      <div className="causes-content">
        {error && (
          <div className="users-error" style={{ marginBottom: 12 }}>
            <strong>Error:</strong> {error}
            <button
              onClick={() => fetchCauses()}
              className="edit-btn"
              style={{ marginLeft: 12, padding: '6px 12px' }}
            >
              Retry
            </button>
          </div>
        )}

        <div className="filter-box">
          <h2 className="filter-title">Filter Causes</h2>
          <div className="filter-row">
            <div className="filter-field">
              <label htmlFor="appeal">Appeal:</label>
              <select
                id="appeal"
                className="select-input"
                value={filters.appeal}
                onChange={(e) => handleFilterChange('appeal', e.target.value)}
              >
                <option value="">All Appeals</option>
                {appeals.map((appeal) => (
                  <option key={appeal.id} value={appeal.id}>
                    {appeal.appeal_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="min-amount">Min Amount:</label>
              <input
                type="number"
                id="min-amount"
                className="text-input"
                placeholder="Min amount"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              />
            </div>

            <div className="filter-field">
              <label htmlFor="max-amount">Max Amount:</label>
              <input
                type="number"
                id="max-amount"
                className="text-input"
                placeholder="Max amount"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              />
            </div>

            <div className="filter-field">
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                className="select-input"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="country">Country:</label>
              <select
                id="country"
                className="select-input"
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              >
                <option value="">All Countries</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <button className="filter-button" onClick={handleFilter} disabled={loading}>
              {loading ? 'Filtering...' : 'Filter'}
            </button>
          </div>
        </div>

        <div className="total-amount-box">
          <span className="total-label">Total Amount:</span>
          <span className="total-value">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="summary-section">
          <h2 className="summary-title">All Causes</h2>

          {loading && (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: '#666'
            }}>
              Loading causes...
            </div>
          )}

          <div className="summary-table-container">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Appeal</th>
                  <th>Amount</th>
                  <th>Fund List</th>
                  <th>Category</th>
                  <th>Country</th>
                  <th>Donations</th>
                </tr>
              </thead>
              <tbody>
                {!loading && causes.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
                      No causes found. Try adjusting your filters.
                    </td>
                  </tr>
                ) : (
                  causes.map((cause, index) => (
                    <tr key={cause.id}>
                      <td>{index + 1}</td>
                      <td className="cause-appeal">{cause.appeal}</td>
                      <td className="cause-amount">${cause.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="cause-fund">{cause.fundList}</td>
                      <td className="cause-category">{cause.category}</td>
                      <td className="cause-country">{cause.country}</td>
                      <td className="cause-donations">{cause.donations}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Causes;
