import { useState } from 'react';
import './FundList.css';

const FundList = () => {
  const [selectedAppeal, setSelectedAppeal] = useState('');
  const [fundRows, setFundRows] = useState([
    { id: 1, fundName: '', sort: '0', status: 'Enable' }
  ]);

  const handleAddRow = () => {
    const newRow = {
      id: fundRows.length + 1,
      fundName: '',
      sort: '0',
      status: 'Enable'
    };
    setFundRows([...fundRows, newRow]);
  };

  const handleRemoveRow = (id) => {
    if (fundRows.length > 1) {
      setFundRows(fundRows.filter(row => row.id !== id));
    }
  };

  const handleRowChange = (id, field, value) => {
    setFundRows(fundRows.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleSubmit = () => {
    console.log('Submit appeal:', selectedAppeal);
    alert('Appeal submitted');
  };

  const handleUpdateFundlist = () => {
    console.log('Update funds:', fundRows);
    alert('Fundlist updated successfully');
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
            <option value="world-emergencies">World Emergencies</option>
            <option value="indonesia">Indonesia Emergency</option>
            <option value="rohingya">Rohingya Emergency</option>
            <option value="syria">Syrian Refugees</option>
            <option value="yemen">Yemen Emergency</option>
            <option value="gaza">Gaza Emergency</option>
          </select>
          <button className="submit-btn" onClick={handleSubmit}>
            Submit
          </button>
        </div>

        <div className="form-container">
          <div className="form-header-row">
            <div className="form-col">Fund Name</div>
            <div className="form-col">Sort</div>
            <div className="form-col">Status</div>
            <div className="form-col">Action</div>
          </div>

          {fundRows.map((row) => (
            <div key={row.id} className="form-data-row">
              <div className="form-col">
                <input
                  type="text"
                  placeholder="Fund Name"
                  value={row.fundName}
                  onChange={(e) => handleRowChange(row.id, 'fundName', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-col">
                <input
                  type="text"
                  value={row.sort}
                  onChange={(e) => handleRowChange(row.id, 'sort', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-col">
                <select
                  value={row.status}
                  onChange={(e) => handleRowChange(row.id, 'status', e.target.value)}
                  className="form-select"
                >
                  <option value="Enable">Enable</option>
                  <option value="Disable">Disable</option>
                </select>
              </div>
              <div className="form-col action-col">
                <button className="add-row-btn" onClick={handleAddRow}>+</button>
                <button className="remove-row-btn" onClick={() => handleRemoveRow(row.id)}>-</button>
              </div>
            </div>
          ))}
        </div>

        <button className="update-btn" onClick={handleUpdateFundlist}>
          Update Fundlist
        </button>
      </div>
    </div>
  );
};

export default FundList;
