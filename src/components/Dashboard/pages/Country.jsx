import { useState } from 'react';
import './Country.css';

const Country = () => {
  const [countries, setCountries] = useState([
    { id: 1, name: 'Gaza' },
    { id: 2, name: 'Yemen' },
    { id: 4, name: 'Indonesia' },
    { id: 5, name: 'Ethiopia' },
    { id: 6, name: 'Myanmar' },
    { id: 7, name: 'Lebanon' },
    { id: 8, name: 'Turkey' },
    { id: 9, name: 'Jordan' },
    { id: 10, name: 'Somalia' },
    { id: 12, name: 'Bosnia' },
    { id: 13, name: 'Pakistan' }
  ]);

  const handleAddCountry = () => {
    alert('Add Country functionality will be implemented');
  };

  const handleEdit = (id) => {
    console.log('Edit country:', id);
    alert('Edit functionality will be implemented');
  };

  return (
    <div className="country-page">
      <div className="country-header">
        <h1 className="country-title">Country</h1>
        <div className="country-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Causes</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Country</span>
        </div>
      </div>

      <div className="country-content">
        <button className="add-button" onClick={handleAddCountry}>
          Add Country
        </button>

        <div className="table-container">
          <table className="country-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((country) => (
                <tr key={country.id}>
                  <td>{country.id}</td>
                  <td className="country-name">{country.name}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(country.id)}>
                      Edit
                    </button>
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

export default Country;
