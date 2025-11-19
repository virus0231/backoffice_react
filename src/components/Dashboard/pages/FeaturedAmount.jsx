import { useState } from 'react';
import './FeaturedAmount.css';

const FeaturedAmount = () => {
  const [featuredAmounts, setFeaturedAmounts] = useState([
    { id: 1, sno: 1, name: '$50 - General Water Donation', status: true },
    { id: 2, sno: 2, name: '$30 - Food Pack', status: true },
    { id: 3, sno: 3, name: '20 - Zakat', status: true },
    { id: 4, sno: 4, name: '$50', status: true }
  ]);

  const handleToggleStatus = (id) => {
    setFeaturedAmounts(featuredAmounts.map(item =>
      item.id === id ? { ...item, status: !item.status } : item
    ));
  };

  return (
    <div className="featured-amount-page">
      <div className="featured-amount-header">
        <h1 className="featured-amount-title">Appeal</h1>
        <div className="featured-amount-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Causes</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Appeals</span>
        </div>
      </div>

      <div className="featured-amount-content">
        <div className="table-container">
          <table className="featured-amount-table">
            <thead>
              <tr>
                <th>SNO</th>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {featuredAmounts.map((item) => (
                <tr key={item.id}>
                  <td>{item.sno}</td>
                  <td className="amount-name">{item.name}</td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={item.status}
                        onChange={() => handleToggleStatus(item.id)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">{item.status ? 'Enable' : 'Disable'}</span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeaturedAmount;
