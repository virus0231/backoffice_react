import { useState } from 'react';
import './FundAmount.css';

const FundAmount = () => {
  const [selectedAppeal, setSelectedAppeal] = useState('');
  const [activeTab, setActiveTab] = useState('amount-to-fund');

  const handleSubmit = () => {
    console.log('Submit appeal:', selectedAppeal);
    alert('Appeal submitted');
  };

  const handleUpdateAssociation = () => {
    alert('Amount association updated successfully');
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
                    {/* Content for Amount Name will be loaded here */}
                  </div>
                </div>
                <div className="matching-column">
                  <h3 className="column-title">Fund List</h3>
                  <div className="column-content">
                    {/* Content for Fund List will be loaded here */}
                  </div>
                </div>
              </div>
            ) : (
              <div className="matching-columns">
                <div className="matching-column">
                  <h3 className="column-title">Fund Name</h3>
                  <div className="column-content">
                    {/* Content for Fund Name will be loaded here */}
                  </div>
                </div>
                <div className="matching-column">
                  <h3 className="column-title">Amount List</h3>
                  <div className="column-content">
                    {/* Content for Amount List will be loaded here */}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <button className="update-btn" onClick={handleUpdateAssociation}>
          Update Amount Association
        </button>
      </div>
    </div>
  );
};

export default FundAmount;
