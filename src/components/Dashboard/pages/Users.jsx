import { useState } from 'react';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Shahzaib',
      email: 'shahzaib@youronlineconversation.com',
      role: 'admin',
      registeredDate: '2025-11-11 01:16:40',
      status: true
    }
  ]);

  const toggleStatus = (id) => {
    setUsers(users.map(user =>
      user.id === id ? { ...user, status: !user.status } : user
    ));
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <h1 className="users-title">Users List</h1>
        <div className="users-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Users</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Users List</span>
        </div>
      </div>

      <div className="users-content">
        <button className="add-user-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add User
        </button>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>SNO</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Registered Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td className="user-name">{user.name}</td>
                  <td className="user-email">{user.email}</td>
                  <td className="user-role">{user.role}</td>
                  <td className="user-date">{user.registeredDate}</td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={user.status}
                        onChange={() => toggleStatus(user.id)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">{user.status ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  </td>
                  <td>
                    <button className="edit-btn">Edit</button>
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

export default Users;
