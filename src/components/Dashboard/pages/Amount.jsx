import { useState } from 'react';
import './Amount.css';

const Amount = () => {
  const [selectedAppeal, setSelectedAppeal] = useState('');
  const [amountRows, setAmountRows] = useState([
    { id: 1, donationName: '', amount: '', sort: '', fixedType: 'Donation Type', featured: 'Disable', status: 'Enable' }
  ]);

  const handleAddRow = () => {
    const newRow = {
      id: amountRows.length + 1,
      donationName: '',
      amount: '',
      sort: '',
      fixedType: 'Donation Type',
      featured: 'Disable',
      status: 'Enable'
    };
    setAmountRows([...amountRows, newRow]);
  };

  const handleRemoveRow = (id) => {
    if (amountRows.length > 1) {
      setAmountRows(amountRows.filter(row => row.id !== id));
    }
  };

  const handleRowChange = (id, field, value) => {
    setAmountRows(amountRows.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleSubmit = () => {
    console.log('Submit appeal:', selectedAppeal);
    alert('Appeal submitted');
  };

  const handleUpdateAmount = () => {
    console.log('Update amounts:', amountRows);
    alert('Amounts updated successfully');
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
            <div className="form-col">Donation Name</div>
            <div className="form-col">Amount</div>
            <div className="form-col">Sort</div>
            <div className="form-col">Fixed Type</div>
            <div className="form-col">Featured</div>
            <div className="form-col">Status</div>
            <div className="form-col">Action</div>
          </div>

          {amountRows.map((row) => (
            <div key={row.id} className="form-data-row">
              <div className="form-col">
                <input
                  type="text"
                  placeholder="Donation Name"
                  value={row.donationName}
                  onChange={(e) => handleRowChange(row.id, 'donationName', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-col">
                <input
                  type="text"
                  placeholder="Amount"
                  value={row.amount}
                  onChange={(e) => handleRowChange(row.id, 'amount', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-col">
                <input
                  type="text"
                  placeholder="Sort"
                  value={row.sort}
                  onChange={(e) => handleRowChange(row.id, 'sort', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-col">
                <select
                  value={row.fixedType}
                  onChange={(e) => handleRowChange(row.id, 'fixedType', e.target.value)}
                  className="form-select"
                >
                  <option value="Donation Type">Donation Type</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Variable">Variable</option>
                </select>
              </div>
              <div className="form-col">
                <select
                  value={row.featured}
                  onChange={(e) => handleRowChange(row.id, 'featured', e.target.value)}
                  className="form-select"
                >
                  <option value="Disable">Disable</option>
                  <option value="Enable">Enable</option>
                </select>
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

        <button className="update-btn" onClick={handleUpdateAmount}>
          Update Amount
        </button>
      </div>
    </div>
  );
};

export default Amount;
