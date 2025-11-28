import { useState, useEffect } from 'react';
import './FundList.css';

const BASE_URL = import.meta.env.DEV
  ? '/backoffice/yoc'
  : 'https://forgottenwomen.youronlineconversation.com/backoffice/yoc';

const FundList = () => {
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
      const response = await fetch(`${BASE_URL}/filters/appeals.php`, {
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

      const response = await fetch(`${BASE_URL}/funds-list.php?appeal_id=${appealId}`, {
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
      const formData = new FormData();
      formData.append('action', 'update_fund');
      formData.append('appeal_id', selectedAppeal);
      formData.append('funds_count', fundRows.length);

      fundRows.forEach((row, index) => {
        const i = index + 1;
        if (row.id) {
          formData.append(`fund_id_${i}`, row.id);
        }
        formData.append(`fund_name_${i}`, row.fundName.trim());
        formData.append(`fund_sort_${i}`, row.sort);
        formData.append(`fund_enable_${i}`, row.status === 'Enable' ? 0 : 1);
      });

      const response = await fetch(`${BASE_URL}/cause.php`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const text = await response.text();

      if (text.toLowerCase().includes('inserted') || text.toLowerCase().includes('updated')) {
        alert('Fundlist updated successfully');
        fetchFunds(selectedAppeal); // Reload funds
      } else {
        setError(text || 'Failed to update fundlist');
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
        <div className="fundlist-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Causes</span>
          <span className="breadcrumb-separator">/</span>
          <span>Appeals</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Fund</span>
        </div>
      </div>

      <div className="fundlist-content">
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
            Loading funds...
          </div>
        )}

        {!loading && selectedAppeal && (
          <>
            <div className="form-container">
              <div className="form-header-row">
                <div className="form-col">Fund Name</div>
                <div className="form-col">Sort</div>
                <div className="form-col">Status</div>
                <div className="form-col">Action</div>
              </div>

              {fundRows.map((row, index) => (
                <div key={index} className="form-data-row">
                  <div className="form-col">
                    <input
                      type="text"
                      placeholder="Fund Name"
                      value={row.fundName}
                      onChange={(e) => handleRowChange(index, 'fundName', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-col">
                    <input
                      type="number"
                      value={row.sort}
                      onChange={(e) => handleRowChange(index, 'sort', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-col">
                    <select
                      value={row.status}
                      onChange={(e) => handleRowChange(index, 'status', e.target.value)}
                      className="form-select"
                    >
                      <option value="Enable">Enable</option>
                      <option value="Disable">Disable</option>
                    </select>
                  </div>
                  <div className="form-col action-col">
                    <button className="add-row-btn" onClick={handleAddRow}>+</button>
                    <button className="remove-row-btn" onClick={() => handleRemoveRow(index)}>-</button>
                  </div>
                </div>
              ))}
            </div>

            <button className="update-btn" onClick={handleUpdateFundlist} disabled={updating}>
              {updating ? 'Updating...' : 'Update Fundlist'}
            </button>
          </>
        )}

        {!loading && !selectedAppeal && (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#666'
          }}>
            Please select an appeal and click Submit to load funds.
          </div>
        )}
      </div>
    </div>
  );
};

export default FundList;
