import { useState, useEffect } from 'react';
import { getPhpApiBase } from '@/lib/config/phpApi';
import { useToast } from '../../ToastContainer';
import './FundAmount.css';

const BASE_URL = getPhpApiBase();

const FundAmount = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [selectedAppeal, setSelectedAppeal] = useState('');
  const [appeals, setAppeals] = useState([]);
  const [amounts, setAmounts] = useState([]);
  const [funds, setFunds] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('amount-to-fund');

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
      }
    } catch (err) {
      console.error('Error fetching appeals:', err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAppeal) {
      setError('Please select an appeal');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/fund-amount-associations?appeal_id=${selectedAppeal}`, {
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success && result.data) {
        setAmounts(result.data.amounts);
        setFunds(result.data.funds);
        setAssociations(result.data.associations);
      } else {
        setError('Failed to load data');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAssociation = (amountId, fundId) => {
    setAssociations(prev => {
      const exists = prev.some(a => a.amountId === amountId && a.fundId === fundId);
      if (exists) {
        return prev.filter(a => !(a.amountId === amountId && a.fundId === fundId));
      } else {
        return [...prev, { amountId, fundId }];
      }
    });
  };

  const isAssociated = (amountId, fundId) => {
    return associations.some(a => a.amountId === amountId && a.fundId === fundId);
  };

  const handleUpdateAssociation = async () => {
    if (!selectedAppeal) {
      setError('Please select an appeal first');
      return;
    }

    try {
      setUpdating(true);
      setError(null);

      const payload = {
        appeal_id: Number(selectedAppeal),
        associations,
      };

      const response = await fetch(`${BASE_URL}/fund-amount-associations`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        showSuccess('Amount association updated successfully');
        handleSubmit();
      } else {
        setError(result.error || 'Failed to update association');
      }
    } catch (err) {
      console.error('Error updating association:', err);
      setError('Failed to update association. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fund-amount-page">
      <div className="fund-amount-header">
        <h1 className="fund-amount-title">Appeal Wise Matching</h1>
        <div className="fund-amount-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Causes</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Matching</span>
        </div>
      </div>

      <div className="fund-amount-content">
        <div className="appeal-selector">
          <label className="appeal-label">Select Appeal</label>
          <div className="appeal-selector-row">
            <select
              value={selectedAppeal}
              onChange={(e) => setSelectedAppeal(e.target.value)}
              className="appeal-select"
            >
              <option value="">Choose an appeal to manage matching</option>
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
                'Load Data'
              )}
            </button>
          </div>
          <p className="appeal-helper">Load matching funds and amounts for the selected appeal.</p>
        </div>

        {error && (
          <div className="users-error inline-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading associations...</p>
          </div>
        )}

        {!loading && selectedAppeal && amounts.length > 0 && funds.length > 0 && (
          <>
            <div className="tabs-container">
              <div className="tabs">
                <button
                  className={`tab-btn ${activeTab === 'amount-to-fund' ? 'active' : ''}`}
                  onClick={() => setActiveTab('amount-to-fund')}
                >
                  Amount To Fund
                </button>
                <button
                  className={`tab-btn ${activeTab === 'fund-to-amount' ? 'active' : ''}`}
                  onClick={() => setActiveTab('fund-to-amount')}
                >
                  Fund To Amount
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'amount-to-fund' ? (
                  <div className="matching-columns">
                    <div className="matching-column">
                      <h3 className="column-title">Amount Name</h3>
                      <div className="column-content">
                        {amounts.map(amount => (
                          <div key={amount.id} style={{ paddingBottom: 8, borderBottom: '1px solid #e5e7eb' }}>
                            <strong>{amount.name}</strong> (${amount.amount})
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="matching-column">
                      <h3 className="column-title">Fund List</h3>
                      <div className="column-content">
                        {amounts.map(amount => (
                          <div key={amount.id} style={{ paddingBottom: 8, borderBottom: '1px solid #e5e7eb' }}>
                            {funds.map(fund => (
                              <label key={fund.id} style={{ display: 'block', marginBottom: 6 }}>
                                <input
                                  type="checkbox"
                                  checked={isAssociated(amount.id, fund.id)}
                                  onChange={() => handleToggleAssociation(amount.id, fund.id)}
                                />
                                <span style={{ marginLeft: '8px' }}>{fund.name}</span>
                              </label>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="matching-columns">
                    <div className="matching-column">
                      <h3 className="column-title">Fund Name</h3>
                      <div className="column-content">
                        {funds.map(fund => (
                          <div key={fund.id} style={{ paddingBottom: 8, borderBottom: '1px solid #e5e7eb' }}>
                            <strong>{fund.name}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="matching-column">
                      <h3 className="column-title">Amount List</h3>
                      <div className="column-content">
                        {funds.map(fund => (
                          <div key={fund.id} style={{ paddingBottom: 8, borderBottom: '1px solid #e5e7eb' }}>
                            {amounts.map(amount => (
                              <label key={amount.id} style={{ display: 'block', marginBottom: 6 }}>
                                <input
                                  type="checkbox"
                                  checked={isAssociated(amount.id, fund.id)}
                                  onChange={() => handleToggleAssociation(amount.id, fund.id)}
                                />
                                <span style={{ marginLeft: '8px' }}>{amount.name} (${amount.amount})</span>
                              </label>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button className="update-btn" onClick={handleUpdateAssociation} disabled={updating}>
              {updating ? 'Updating...' : 'Update Amount Association'}
            </button>
          </>
        )}

        {!loading && selectedAppeal && (amounts.length === 0 || funds.length === 0) && (
          <div className="empty-state">
            <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <h3>No data found</h3>
            <p>
              {amounts.length === 0 && 'No amounts found for this appeal. '}
              {funds.length === 0 && 'No funds found for this appeal. '}
              Please add amounts and funds first.
            </p>
          </div>
        )}

        {!selectedAppeal && !loading && (
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
            <p>Select an appeal above and click Load Data to manage associations.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundAmount;
