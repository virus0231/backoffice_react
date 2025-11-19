import { useState } from 'react';
import './Category.css';

const Category = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Emergency Response' },
    { id: 2, name: 'Health Care' },
    { id: 3, name: 'Food Aid' },
    { id: 4, name: 'Clean Water' },
    { id: 5, name: 'Economic Development' },
    { id: 6, name: 'Religious Dues' },
    { id: 7, name: 'Child Sponsorship' },
    { id: 8, name: 'Winterization' },
    { id: 9, name: 'Education' },
    { id: 10, name: 'Ramadhan' }
  ]);

  const handleAddCategory = () => {
    alert('Add Category functionality will be implemented');
  };

  const handleEdit = (id) => {
    console.log('Edit category:', id);
    alert('Edit functionality will be implemented');
  };

  return (
    <div className="category-page">
      <div className="category-header">
        <h1 className="category-title">Appeal</h1>
        <div className="category-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Causes</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Catagory</span>
        </div>
      </div>

      <div className="category-content">
        <button className="add-button" onClick={handleAddCategory}>
          Add Catagory
        </button>

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
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td className="category-name">{category.name}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(category.id)}>
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

export default Category;
