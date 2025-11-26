import { useState, useEffect } from 'react';
import './Amount.css';

const BASE_URL = import.meta.env.DEV
  ? '/backoffice/yoc'
  : 'https://forgottenwomen.youronlineconversation.com/backoffice/yoc';

const Amount = () => {
  const [appeals, setAppeals] = useState([]);
  const [selectedAppeal, setSelectedAppeal] = useState('');
  const [amountRows, setAmountRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appealsLoading, setAppealsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch appeals on mount
  useEffect(() => {
    fetchAppeals();
  }, []);

  // Fetch amounts when appeal is selected
  useEffect(() => {
    if (selectedAppeal) {
      fetchAmounts(selectedAppeal);
    } else {
      setAmountRows([]);
    }
  }, [selectedAppeal]);

  const fetchAppeals = async () => {
    try {
      setAppealsLoading(true);
      const response = await fetch(`${BASE_URL}/filters/appeals.php`, {
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success && result.data) {
        setAppeals(result.data);
      }
    } catch (err) {
      console.error('Error fetching appeals:', err);
      setError('Failed to load appeals');
    } finally {
      setAppealsLoading(false);
    }
  };

  const fetchAmounts = async (appealId) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${BASE_URL}/amounts.php?appeal_id=${appealId}`, {
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success && result.data) {
        if (result.data.length === 0) {
          // No amounts yet, start with one empty row
          setAmountRows([{
            id: null,
            name: '',
            amount: '',
            sort: 0,
            donationtype: '',
            featured: 'disabled',
            status: 'enabled'
          }]);
        } else {
          setAmountRows(result.data);
        }
      }
    } catch (err) {
      console.error('Error fetching amounts:', err);
      setError('Failed to load amounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    const newRow = {
      id: null, // null means it's a new row
      name: '',
      amount: '',
      sort: amountRows.length,
      donationtype: '',
      featured: 'disabled',
      status: 'enabled'
    };
    setAmountRows([...amountRows, newRow]);
  };

  const handleRemoveRow = (index) => {
    if (amountRows.length > 1) {
      setAmountRows(amountRows.filter((_, i) => i !== index));
    }
  };

  const handleRowChange = (index, field, value) => {
    setAmountRows(amountRows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    ));
  };

  const handleUpdateAmount = async () => {
    if (!selectedAppeal) {
      setError('Please select an appeal first');
      return;
    }

    // Validate rows
    const validRows = amountRows.filter(row => row.name.trim() && row.amount);
    if (validRows.length === 0) {
      setError('Please add at least one amount with name and value');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('action', 'update_amount');
      formData.append('amounts_count', validRows.length);

      validRows.forEach((row, index) => {
        const i = index + 1;
        if (row.id) {
          formData.append(`amount_id_${i}`, row.id);
        }
        formData.append(`amount_name_${i}`, row.name);
        formData.append(`amount_amount_${i}`, row.amount);
        formData.append(`amount_donation_type_${i}`, row.donationtype || '');
        formData.append(`amount_sort_${i}`, row.sort || 0);
        formData.append(`amount_featured_${i}`, row.featured === 'enabled' ? 1 : 0);
        formData.append(`amount_enable_${i}`, row.status === 'enabled' ? 0 : 1);
      });

      // Set appeal_id in session (backend expects this)
      sessionStorage.setItem('new_appeal_id', selectedAppeal);

      const response = await fetch(`${BASE_URL}/cause.php`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const text = await response.text();
      const lowered = text.toLowerCase();

      if (lowered.includes('updated') || lowered.includes('inserted')) {
        setSuccess('Amounts updated successfully!');
        // Refetch amounts to get updated data
        fetchAmounts(selectedAppeal);
      } else {
        setError('Failed to update amounts: ' + text);
      }
    } catch (err) {
      console.error('Error updating amounts:', err);
      setError('Failed to update amounts. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="amount-page">
      <div className="amount-header">
        <h1 className="amount-title">Amount List</h1>
        <div className="amount-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Causes</span>
          <span className="breadcrumb-separator">/</span>
          <span>Appeals</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Amount</span>
        </div>
      </div>

      <div className="amount-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <div className="appeal-selector">
          <select
            value={selectedAppeal}
            onChange={(e) => setSelectedAppeal(e.target.value)}
            className="appeal-select"
            disabled={appealsLoading}
          >
            <option value="">
              {appealsLoading ? 'Loading appeals...' : 'Select Appeal'}
            </option>
            {appeals.map((appeal) => (
              <option key={appeal.id} value={appeal.id}>
                {appeal.appeal_name}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="loading-message">
            Loading amounts...
          </div>
        )}

        {selectedAppeal && !loading && (
          <>
            <div className="form-container">
              <div className="form-header-row">
                <div className="form-col">Donation Name</div>
                <div className="form-col">Amount</div>
                <div className="form-col">Sort</div>
                <div className="form-col">Fixed Type</div>
                <div className="form-col">Featured</div>
                <div className="form-col">Status</div>
                <div className="form-col">Action</div>
              </div>

              {amountRows.map((row, index) => (
                <div key={row.id || `new-${index}`} className="form-data-row">
                  <div className="form-col">
                    <input
                      type="text"
                      placeholder="Donation Name"
                      value={row.name || ''}
                      onChange={(e) => handleRowChange(index, 'name', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-col">
                    <input
                      type="text"
                      placeholder="Amount"
                      value={row.amount || ''}
                      onChange={(e) => handleRowChange(index, 'amount', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-col">
                    <input
                      type="text"
                      placeholder="Sort"
                      value={row.sort || ''}
                      onChange={(e) => handleRowChange(index, 'sort', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-col">
                    <select
                      value={row.donationtype || ''}
                      onChange={(e) => handleRowChange(index, 'donationtype', e.target.value)}
                      className="form-select"
                    >
                      <option value="">Donation Type</option>
                      <option value="Fixed">Fixed</option>
                      <option value="Variable">Variable</option>
                    </select>
                  </div>
                  <div className="form-col">
                    <select
                      value={row.featured || 'disabled'}
                      onChange={(e) => handleRowChange(index, 'featured', e.target.value)}
                      className="form-select"
                    >
                      <option value="disabled">Disable</option>
                      <option value="enabled">Enable</option>
                    </select>
                  </div>
                  <div className="form-col">
                    <select
                      value={row.status || 'enabled'}
                      onChange={(e) => handleRowChange(index, 'status', e.target.value)}
                      className="form-select"
                    >
                      <option value="enabled">Enable</option>
                      <option value="disabled">Disable</option>
                    </select>
                  </div>
                  <div className="form-col action-col">
                    <button className="add-row-btn" onClick={handleAddRow}>+</button>
                    <button
                      className="remove-row-btn"
                      onClick={() => handleRemoveRow(index)}
                      disabled={amountRows.length === 1}
                    >
                      -
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="update-btn"
              onClick={handleUpdateAmount}
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Amount'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Amount;
