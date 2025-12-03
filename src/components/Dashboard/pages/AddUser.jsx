import { useState } from 'react';
import apiClient from '@/lib/api/client';
import './AddUser.css';

const AddUser = () => {
  const [formData, setFormData] = useState({
    userName: '',
    userPassword: '',
    displayName: '',
    userEmail: '',
    userRole: ''
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userName || !formData.userPassword || !formData.userEmail) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('users', {
        username: formData.userName,
        password: formData.userPassword,
        display_name: formData.displayName,
        email: formData.userEmail,
        role_id: formData.userRole
      });

      if (response?.success) {
        alert('User added successfully!');
        // Reset form
        setFormData({
          userName: '',
          userPassword: '',
          displayName: '',
          userEmail: '',
          userRole: ''
        });
      } else {
        alert('Failed to add user. Please try again.');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-page">
      <div className="add-user-header">
        <h1 className="add-user-title">Add User</h1>
        <div className="add-user-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Users</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Add User</span>
        </div>
      </div>

      <div className="add-user-content">
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="userName">User Name</label>
              <input
                type="text"
                id="userName"
                placeholder="sohail"
                value={formData.userName}
                onChange={(e) => handleInputChange('userName', e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="userPassword">User Password</label>
              <input
                type="password"
                id="userPassword"
                placeholder="••••••••••"
                value={formData.userPassword}
                onChange={(e) => handleInputChange('userPassword', e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                type="text"
                id="displayName"
                placeholder="Enter Display Name"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="userEmail">User Email</label>
              <input
                type="email"
                id="userEmail"
                placeholder="Enter User Email"
                value={formData.userEmail}
                onChange={(e) => handleInputChange('userEmail', e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="userRole">User Role</label>
              <select
                id="userRole"
                value={formData.userRole}
                onChange={(e) => handleInputChange('userRole', e.target.value)}
                className="form-select"
                required
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-add-user" disabled={loading}>
              {loading ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
