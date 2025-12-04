import { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';
import './Country.css';

const Country = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [addForm, setAddForm] = useState({ name: '' });
  const [editForm, setEditForm] = useState({ id: null, name: '' });

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiClient.get('filters/countries');

      if (result.success && result.data) {
        setCountries(result.data);
      } else {
        setError(result.message || 'Failed to load countries');
      }
    } catch (err) {
      console.error('Error fetching countries:', err);
      setError('Failed to load countries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCountry = () => {
    setFormError('');
    setAddForm({ name: '' });
    setShowAddModal(true);
  };

  const handleEdit = (country) => {
    setFormError('');
    setEditForm({ id: country.id, name: country.name });
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      setFormError('Country name is required.');
      return;
    }

    setFormError('');
    try {
      setAddSubmitting(true);
      const result = await apiClient.post('countries', { name: addForm.name.trim() });

      if (result.success) {
        setShowAddModal(false);
        setAddForm({ name: '' });
        fetchCountries();
      } else {
        setFormError(result.message || result.error || 'Failed to add country');
      }
    } catch (error) {
      console.error('Error adding country:', error);

      // Handle validation errors (422)
      if (error.status === 422 && error.errors) {
        // Display all validation errors
        const errorMessages = Object.values(error.errors).flat();
        errorMessages.forEach(msg => setFormError(msg));
      } else if (error.message) {
        setFormError(error.message);
      } else {
        setFormError('An error occurred. Please try again.');
      }
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      setFormError('Country name is required.');
      return;
    }

    setFormError('');
    try {
      setEditSubmitting(true);
      const result = await apiClient.put(`countries/${editForm.id}`, { name: editForm.name.trim() });

      if (result.success) {
        setShowEditModal(false);
        setEditForm({ id: null, name: '' });
        fetchCountries();
      } else {
        setFormError(result.message || result.error || 'Failed to update country');
      }
    } catch (error) {
      console.error('Error updating country:', error);

      // Handle validation errors (422)
      if (error.status === 422 && error.errors) {
        // Display all validation errors
        const errorMessages = Object.values(error.errors).flat();
        errorMessages.forEach(msg => setFormError(msg));
      } else if (error.message) {
        setFormError(error.message);
      } else {
        setFormError('An error occurred. Please try again.');
      }
    } finally {
      setEditSubmitting(false);
    }
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

        {error && (
          <div className="users-error" style={{ marginTop: 12 }}>
            <strong>Error:</strong> {error}
            <button
              onClick={fetchCountries}
              className="edit-btn"
              style={{ marginLeft: 12, padding: '6px 12px' }}
            >
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#666'
          }}>
            Loading countries...
          </div>
        )}

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
              {!loading && countries.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
                    No countries available.
                  </td>
                </tr>
              ) : (
                countries.map((country) => (
                  <tr key={country.id}>
                    <td>{country.id}</td>
                    <td className="country-name">{country.name}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(country)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="user-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="user-modal-header">
              <h3>Add Country</h3>
              <button className="user-modal-close" onClick={() => setShowAddModal(false)} aria-label="Close">
                ×
              </button>
            </div>
            <form className="user-modal-body" onSubmit={handleAddSubmit}>
              <div className="user-modal-grid">
                <label className="user-modal-field" style={{ gridColumn: 'span 2' }}>
                  <span>Country Name</span>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ name: e.target.value })}
                    required
                    autoFocus
                  />
                </label>
              </div>

              {formError && <div className="users-error">{formError}</div>}

              <div className="user-modal-actions">
                <button
                  type="button"
                  className="add-user-btn refresh-btn"
                  onClick={() => { setShowAddModal(false); setAddForm({ name: '' }); }}
                  disabled={addSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="add-user-btn" disabled={addSubmitting}>
                  {addSubmitting ? 'Adding...' : 'Add Country'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="user-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="user-modal-header">
              <h3>Edit Country</h3>
              <button className="user-modal-close" onClick={() => setShowEditModal(false)} aria-label="Close">
                ×
              </button>
            </div>
            <form className="user-modal-body" onSubmit={handleEditSubmit}>
              <div className="user-modal-grid">
                <label className="user-modal-field" style={{ gridColumn: 'span 2' }}>
                  <span>Country Name</span>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    autoFocus
                  />
                </label>
              </div>

              {formError && <div className="users-error">{formError}</div>}

              <div className="user-modal-actions">
                <button
                  type="button"
                  className="add-user-btn refresh-btn"
                  onClick={() => { setShowEditModal(false); setEditForm({ id: null, name: '' }); }}
                  disabled={editSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="add-user-btn" disabled={editSubmitting}>
                  {editSubmitting ? 'Updating...' : 'Update Country'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Country;
