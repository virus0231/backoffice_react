import { useState, useEffect } from 'react';
import { getPhpApiBase } from '@/lib/config/phpApi';
import './FundAmount.css';

const BASE_URL = getPhpApiBase();

const FundAmount = () => {
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
        alert('Amount association updated successfully');
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
          <select
            value={selectedAppeal}
            onChange={(e) => setSelectedAppeal(e.target.value)}
            className="appeal-select"
          >
            <option value="">Select Appeal</option>
            {appeals.map((appeal) => (
              <option key={appeal.id} value={appeal.id}>
                {appeal.appeal_name}
              </option>
            ))}
          </select>
          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Loading...' : 'Submit'}
          </button>
        </div>

        {error && (
          <div className="users-error" style={{ marginTop: 12 }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#666'
          }}>
            Loading associations...
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
                          <div key={amount.id} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                            <strong>{amount.name}</strong> (${amount.amount})
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="matching-column">
                      <h3 className="column-title">Fund List</h3>
                      <div className="column-content">
                        {amounts.map(amount => (
                          <div key={amount.id} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                            {funds.map(fund => (
                              <label key={fund.id} style={{ display: 'block', marginBottom: '4px' }}>
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
                          <div key={fund.id} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                            <strong>{fund.name}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="matching-column">
                      <h3 className="column-title">Amount List</h3>
                      <div className="column-content">
                        {funds.map(fund => (
                          <div key={fund.id} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                            {amounts.map(amount => (
                              <label key={amount.id} style={{ display: 'block', marginBottom: '4px' }}>
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
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#666'
          }}>
            {amounts.length === 0 && 'No amounts found for this appeal. '}
            {funds.length === 0 && 'No funds found for this appeal. '}
            Please add amounts and funds first.
          </div>
        )}

        {!selectedAppeal && !loading && (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#666'
          }}>
            Please select an appeal and click Submit to manage associations.
          </div>
        )}
      </div>
    </div>
  );
};

export default FundAmount;
