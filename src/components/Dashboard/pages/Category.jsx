import { useState, useEffect } from 'react';
import API from '../../../utils/api';
import './Category.css';

const BASE_URL = import.meta.env.DEV
  ? '/backoffice/yoc'
  : 'https://forgottenwomen.youronlineconversation.com/backoffice/yoc';

const Category = () => {
  const [categories, setCategories] = useState([]);
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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/categories.php`, {
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setFormError('');
    setAddForm({ name: '' });
    setShowAddModal(true);
  };

  const handleEdit = (category) => {
    setFormError('');
    setEditForm({ id: category.id, name: category.name });
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setFormError('');
    try {
      setAddSubmitting(true);
      const formData = new FormData();
      formData.append('action', 'add_catagory');
      formData.append('catagory_name', addForm.name.trim());

      const response = await fetch(`${BASE_URL}/cause.php`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const text = await response.text();

      if (text.toLowerCase().includes('inserted')) {
        setShowAddModal(false);
        setAddForm({ name: '' });
        fetchCategories();
      } else {
        setFormError(text || 'Failed to add category');
      }
    } catch (err) {
      console.error(err);
      setFormError('Unable to add category. Please try again.');
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setFormError('');
    try {
      setEditSubmitting(true);
      const formData = new FormData();
      formData.append('action', 'update_catagory');
      formData.append('catagory_id', editForm.id);
      formData.append('catagory_name', editForm.name.trim());

      const response = await fetch(`${BASE_URL}/cause.php`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const text = await response.text();

      if (text.toLowerCase().includes('updated')) {
        setShowEditModal(false);
        setEditForm({ id: null, name: '' });
        fetchCategories();
      } else {
        setFormError(text || 'Failed to update category');
      }
    } catch (err) {
      console.error(err);
      setFormError('Unable to update category. Please try again.');
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="category-page">
      <div className="category-header">
        <h1 className="category-title">Category</h1>
        <div className="category-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Causes</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Category</span>
        </div>
      </div>

      <div className="category-content">
        <button className="add-button" onClick={handleAddCategory}>
          Add Category
        </button>

        {error && (
          <div className="users-error" style={{ marginTop: 12 }}>
            <strong>Error:</strong> {error}
            <button
              onClick={fetchCategories}
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
            Loading categories...
          </div>
        )}

        <div className="table-container">
          <table className="category-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && categories.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
                    No categories available.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td className="category-name">{category.name}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(category)}>
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
              <h3>Add Category</h3>
              <button className="user-modal-close" onClick={() => setShowAddModal(false)} aria-label="Close">
                ×
              </button>
            </div>
            <form className="user-modal-body" onSubmit={handleAddSubmit}>
              <div className="user-modal-grid">
                <label className="user-modal-field" style={{ gridColumn: 'span 2' }}>
                  <span>Category Name</span>
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
                  {addSubmitting ? 'Adding...' : 'Add Category'}
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
              <h3>Edit Category</h3>
              <button className="user-modal-close" onClick={() => setShowEditModal(false)} aria-label="Close">
                ×
              </button>
            </div>
            <form className="user-modal-body" onSubmit={handleEditSubmit}>
              <div className="user-modal-grid">
                <label className="user-modal-field" style={{ gridColumn: 'span 2' }}>
                  <span>Category Name</span>
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
                  {editSubmitting ? 'Updating...' : 'Update Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
