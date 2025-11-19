import { useState } from 'react';
import './Appeal.css';

const Appeal = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const [appeals, setAppeals] = useState([
    { id: 1, sno: 1, name: 'World Emergencies', sort: 0, visibleHome: false, visibleDonate: true, status: 'enabled' },
    { id: 2, sno: 2, name: 'Indonesia Emergency', sort: 0, visibleHome: false, visibleDonate: false, status: 'enabled' },
    { id: 3, sno: 3, name: 'Rohingya Emergency', sort: 0, visibleHome: false, visibleDonate: false, status: 'enabled' },
    { id: 4, sno: 4, name: 'Syrian Refugees', sort: 0, visibleHome: false, visibleDonate: false, status: 'enabled' },
    { id: 5, sno: 5, name: 'Yemen Emergency', sort: 0, visibleHome: false, visibleDonate: false, status: 'enabled' },
    { id: 6, sno: 6, name: 'Gaza Emergency', sort: 0, visibleHome: false, visibleDonate: false, status: 'enabled' },
    { id: 7, sno: 7, name: 'Ethiopia Emergency', sort: 0, visibleHome: false, visibleDonate: true, status: 'enabled' },
    { id: 8, sno: 8, name: 'Offer Your Zakat', sort: -72, visibleHome: false, visibleDonate: true, status: 'enabled' },
    { id: 9, sno: 9, name: 'Somalia Gender based violence Center', sort: 0, visibleHome: false, visibleDonate: false, status: 'disabled' },
    { id: 10, sno: 10, name: 'Bosnia Childrens educaton (Mobile Library Mally)', sort: 10, visibleHome: false, visibleDonate: false, status: 'enabled' }
  ]);

  const handleToggle = (id, field) => {
    setAppeals(appeals.map(appeal =>
      appeal.id === id ? { ...appeal, [field]: !appeal[field] } : appeal
    ));
  };

  const handleEdit = (id) => {
    console.log('Edit appeal:', id);
    alert('Edit functionality will be implemented');
  };

  const handleAddAppeal = () => {
    alert('Add Appeal functionality will be implemented');
  };

  return (
    <div className="appeal-page">
      <div className="appeal-header">
        <h1 className="appeal-title">Appeal</h1>
        <div className="appeal-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Causes</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Appeals</span>
        </div>
      </div>

      <div className="appeal-content">
        <button className="add-button" onClick={handleAddAppeal}>
          Add Appeal
        </button>

        <div className="table-controls">
          <div className="entries-control">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="entries-select"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>
          <div className="search-control">
            <span>Search:</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="table-container">
          <table className="appeal-table">
            <thead>
              <tr>
                <th>Sno</th>
                <th>Id</th>
                <th>Name</th>
                <th>Sort</th>
                <th>Visible on Home</th>
                <th>Visible on Donate</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appeals.map((appeal) => (
                <tr key={appeal.id}>
                  <td>{appeal.sno}</td>
                  <td>{appeal.id}</td>
                  <td className="appeal-name">{appeal.name}</td>
                  <td>{appeal.sort}</td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={appeal.visibleHome}
                        onChange={() => handleToggle(appeal.id, 'visibleHome')}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">{appeal.visibleHome ? 'Yes' : 'No'}</span>
                    </label>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={appeal.visibleDonate}
                        onChange={() => handleToggle(appeal.id, 'visibleDonate')}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">{appeal.visibleDonate ? 'Yes' : 'No'}</span>
                    </label>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={appeal.status === 'enabled'}
                        onChange={() => handleToggle(appeal.id, 'status')}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">{appeal.status === 'enabled' ? 'Enabled' : 'Disable'}</span>
                    </label>
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(appeal.id)}>
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

export default Appeal;
