import { useState, useEffect } from 'react';
import { getPhpApiBase } from '@/lib/config/phpApi';
import { useToast } from '../../ToastContainer';
import './FundList.css';

const BASE_URL = getPhpApiBase();

const FundList = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [selectedAppeal, setSelectedAppeal] = useState('');
  const [appeals, setAppeals] = useState([]);
  const [fundRows, setFundRows] = useState([
    { id: null, fundName: '', sort: '0', status: 'Enable' }
  ]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    try {
      const response = await fetch(`${BASE_URL}/filters/appeals`, {
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success && result.data) {
        setAppeals(result.data);
      } else {
        setError('Failed to load appeals');
      }
    } catch (err) {
      console.error('Error fetching appeals:', err);
      setError('Failed to load appeals. Please try again.');
    }
  };

  const fetchFunds = async (appealId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/funds/list?appeal_id=${appealId}`, {
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success && result.data) {
        if (result.data.length > 0) {
          setFundRows(result.data.map(fund => ({
            id: fund.id,
            fundName: fund.name,
            sort: String(fund.sort),
            status: fund.status
          })));
        } else {
          setFundRows([{ id: null, fundName: '', sort: '0', status: 'Enable' }]);
        }
      } else {
        setError('Failed to load funds');
      }
    } catch (err) {
      console.error('Error fetching funds:', err);
      setError('Failed to load funds. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    const newRow = {
      id: null,
      fundName: '',
      sort: '0',
      status: 'Enable'
    };
    setFundRows([...fundRows, newRow]);
  };

  const handleRemoveRow = (index) => {
    if (fundRows.length > 1) {
      setFundRows(fundRows.filter((_, idx) => idx !== index));
    }
  };

  const handleRowChange = (index, field, value) => {
    setFundRows(fundRows.map((row, idx) =>
      idx === index ? { ...row, [field]: value } : row
    ));
  };

  const handleSubmit = () => {
    if (!selectedAppeal) {
      setError('Please select an appeal');
      return;
    }
    fetchFunds(selectedAppeal);
  };

  const handleUpdateFundlist = async () => {
    if (!selectedAppeal) {
      setError('Please select an appeal first');
      return;
    }

    // Validate that all rows have fund names
    const invalidRows = fundRows.filter(row => !row.fundName.trim());
    if (invalidRows.length > 0) {
      setError('All fund names are required');
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const payload = {
        appeal_id: Number(selectedAppeal),
        funds: fundRows.map((row) => ({
          id: row.id,
          name: row.fundName.trim(),
          sort: Number(row.sort) || 0,
          status: row.status
        }))
      };

      const response = await fetch(`${BASE_URL}/funds/bulk`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        showSuccess('Fundlist updated successfully');
        fetchFunds(selectedAppeal); // Reload funds
      } else {
        setError(result.error || 'Failed to update fundlist');
      }
    } catch (err) {
      console.error('Error updating funds:', err);
      setError('Failed to update fundlist. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fundlist-page">
      <div className="fundlist-header">
        <h1 className="fundlist-title">Fund List</h1>
      </div>

      <div className="fundlist-content">
        <div className="appeal-selector-card">
          <label className="appeal-label">Select Appeal</label>
          <div className="appeal-selector-row">
            <select
              value={selectedAppeal}
              onChange={(e) => setSelectedAppeal(e.target.value)}
              className="appeal-select"
            >
              <option value="">Choose an appeal to manage funds</option>
              {appeals.map((appeal) => (
                <option key={appeal.id} value={appeal.id}>
                  {appeal.appeal_name}
                </option>
              ))}
            </select>
            <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Loading...
                </>
              ) : (
                'Load Funds'
              )}
            </button>
          </div>
          <p className="appeal-helper">Load funds for the selected appeal to edit the list.</p>
        </div>

        {error && (
          <div className="users-error inline-error" style={{ marginTop: 12 }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading funds...</p>
          </div>
        )}

        {!loading && !selectedAppeal && (
          <div className="empty-state">
            <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <h3>No Appeal Selected</h3>
            <p>Select an appeal above and click Load Funds to manage the fund list.</p>
          </div>
        )}

        {!loading && selectedAppeal && (
          <>
            <div className="table-container">
              <table className="fundlist-table">
                <thead>
                  <tr>
                    <th>Fund Name</th>
                    <th>Sort</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fundRows.map((row, index) => (
                    <tr key={row.id || `fund-${index}`}>
                      <td>
                        <input
                          type="text"
                          placeholder="Fund Name"
                          value={row.fundName}
                          onChange={(e) => handleRowChange(index, 'fundName', e.target.value)}
                          className="table-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.sort}
                          onChange={(e) => handleRowChange(index, 'sort', e.target.value)}
                          className="table-input sort-input"
                        />
                      </td>
                      <td>
                        <label className="toggle-switch">
                          <input
                            id={`status-toggle-${index}`}
                            type="checkbox"
                            className="toggle-input"
                            checked={row.status === 'Enable'}
                            onChange={(e) =>
                              handleRowChange(index, 'status', e.target.checked ? 'Enable' : 'Disable')
                            }
                            aria-label="Toggle fund status"
                          />
                          <span className="toggle-slider" aria-hidden />
                          <span className={`toggle-label ${row.status === 'Enable' ? 'on' : 'off'}`}>
                            {row.status === 'Enable' ? 'Enable' : 'Disable'}
                          </span>
                        </label>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn add-btn"
                            onClick={handleAddRow}
                            type="button"
                            title="Add new row"
                          >
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                          <button
                            className="action-btn remove-btn"
                            onClick={() => handleRemoveRow(index)}
                            disabled={fundRows.length === 1}
                            type="button"
                            title="Remove row"
                          >
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="form-footer">
              <div className="footer-info">
                <p>
                  {fundRows.length} fund {fundRows.length === 1 ? 'entry' : 'entries'} for this appeal
                </p>
              </div>
              <button className="update-btn" onClick={handleUpdateFundlist} disabled={updating}>
                {updating ? (
                  <>
                    <span className="btn-spinner" />
                    Updating...
                  </>
                ) : (
                  <>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FundList;
