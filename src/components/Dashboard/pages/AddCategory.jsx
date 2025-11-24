import { useState } from 'react';
import API from '../../../utils/api';
import './AddCategory.css';

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('cause.php', {
        action: 'addCategory',
        categoryName: categoryName
      });

      if (response.includes('success') || response.includes('added')) {
        alert('Category added successfully!');
        setCategoryName('');
      } else {
        alert('Failed to add category. Please try again.');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-category-page">
      <div className="add-category-header">
        <h1 className="add-category-title">Add New Category</h1>
        <div className="add-category-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Causes</span>
          <span className="breadcrumb-separator">/</span>
          <span>Categories</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Add Category</span>
        </div>
      </div>

      <div className="add-category-content">
        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label htmlFor="categoryName">Category Name</label>
            <input
              type="text"
              id="categoryName"
              placeholder="Enter Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-add-category" disabled={loading}>
              {loading ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;
