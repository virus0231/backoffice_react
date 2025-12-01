import { useEffect, useMemo, useState } from 'react';
import './Users.css';
import { getPhpApiBase } from '@/lib/config/phpApi';

const BASE_URL = getPhpApiBase();

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addForm, setAddForm] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    roleId: '2', // default to admin
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editForm, setEditForm] = useState({
    id: '',
    username: '',
    displayName: '',
    email: '',
    password: '',
    roleId: '2',
  });

  const normalizeUser = (user) => {
    const isActive = String(user.user_status ?? user.status ?? '0') === '0';
    const login = user.user_login ?? user.username ?? '';
    return {
      id: user.id ?? user.ID,
      username: login,
      name: user.display_name || login,
      email: user.email || user.user_email || '',
      role: user.role_name || user.user_role || '',
      roleId: user.user_role || '',
      registeredDate: user.user_registered || '',
      status: isActive
    };
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${BASE_URL}/users`, { credentials: 'include' });
      const result = await response.json();
      const rows = Array.isArray(result?.data) ? result.data : [];
      const normalized = rows.map(normalizeUser).filter((u) => u.id !== undefined);
      setUsers(normalized);
    } catch (err) {
      console.error('Error loading users', err);
      setError('Unable to load users right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const roleOptions = useMemo(
    () => [
      { id: '2', label: 'Admin' },
      { id: '3', label: 'Marketing' },
      { id: '4', label: 'Content' },
      { id: '5', label: 'Client' },
    ],
    []
  );

  const resetAddForm = () => {
    setAddForm({
      username: '',
      displayName: '',
      email: '',
      password: '',
      roleId: '2',
    });
    setAddError('');
  };

  const resetEditForm = () => {
    setEditForm({
      id: '',
      username: '',
      displayName: '',
      email: '',
      password: '',
      roleId: '2',
    });
    setEditError('');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!addForm.username || !addForm.displayName || !addForm.email || !addForm.password) {
      setAddError('All fields are required.');
      return;
    }
    setAddLoading(true);
    setAddError('');
    try {
      const resp = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: addForm.username.trim(),
          display_name: addForm.displayName.trim(),
          email: addForm.email.trim(),
          password: addForm.password,
          role_id: addForm.roleId,
        })
      });

      const data = await resp.json();
      if (data.success) {
        setShowAddModal(false);
        resetAddForm();
        fetchUsers();
      } else {
        setAddError(data.error || 'Unable to create user.');
      }
    } catch (err) {
      console.error('Error creating user', err);
      setAddError('Error creating user. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const nextStatus = !target.status;

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, status: nextStatus } : user
      )
    );

    try {
      await fetch(`${BASE_URL}/users/${id}/status`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (err) {
      console.error('Error updating status', err);
      setError('Failed to update user status.');
      // Revert on failure
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, status: target.status } : user
        )
      );
    }
  };

  const openEditModal = (user) => {
    setEditForm({
      id: user.id,
      username: user.username || user.name || '',
      displayName: user.name || user.username || '',
      email: user.email || '',
      password: '',
      roleId: user.roleId ? String(user.roleId) : '2',
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editForm.id || !editForm.username || !editForm.displayName || !editForm.email) {
      setEditError('Username, display name and email are required.');
      return;
    }
    setEditLoading(true);
    setEditError('');
    try {
      await fetch(`${BASE_URL}/users/${editForm.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editForm.username.trim(),
          display_name: editForm.displayName.trim(),
          email: editForm.email.trim(),
          password: editForm.password,
          role_id: editForm.roleId,
        })
      });

      setShowEditModal(false);
      resetEditForm();
      fetchUsers();
    } catch (err) {
      console.error('Error updating user', err);
      setEditError('Failed to update user. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <h1 className="users-title">Users List</h1>
      </div>

      <div className="users-content">
        <div className="users-actions">
          <button className="add-user-btn" onClick={() => { resetAddForm(); setShowAddModal(true); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add User
          </button>
          <button className="add-user-btn refresh-btn" onClick={fetchUsers} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && <div className="users-error">{error}</div>}

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
              {loading ? (
                <tr>
                  <td colSpan="7" className="loading-row">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">No users found.</td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr key={user.id}>
                    <td>{idx + 1}</td>
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
                          disabled={loading}
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">{user.status ? 'Enabled' : 'Disabled'}</span>
                      </label>
                    </td>
                    <td>
                      <button className="edit-btn" onClick={() => openEditModal(user)}>Edit</button>
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
              <h3>Add User</h3>
              <button className="user-modal-close" onClick={() => setShowAddModal(false)} aria-label="Close">
                ×
              </button>
            </div>
            <form className="user-modal-body" onSubmit={handleAddUser}>
              <div className="user-modal-grid">
                <label className="user-modal-field">
                  <span>Username</span>
                  <input
                    type="text"
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                    required
                  />
                </label>
                <label className="user-modal-field">
                  <span>Display Name</span>
                  <input
                    type="text"
                    value={addForm.displayName}
                    onChange={(e) => setAddForm({ ...addForm, displayName: e.target.value })}
                    required
                  />
                </label>
                <label className="user-modal-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    required
                  />
                </label>
                <label className="user-modal-field">
                  <span>Password</span>
                  <input
                    type="password"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </label>
                <label className="user-modal-field">
                  <span>Role</span>
                  <select
                    value={addForm.roleId}
                    onChange={(e) => setAddForm({ ...addForm, roleId: e.target.value })}
                  >
                    {roleOptions.map((role) => (
                      <option key={role.id} value={role.id}>{role.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              {addError && <div className="users-error">{addError}</div>}

              <div className="user-modal-actions">
                <button
                  type="button"
                  className="add-user-btn refresh-btn"
                  onClick={() => { resetAddForm(); setShowAddModal(false); }}
                  disabled={addLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="add-user-btn" disabled={addLoading}>
                  {addLoading ? 'Creating...' : 'Create User'}
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
              <h3>Edit User</h3>
              <button className="user-modal-close" onClick={() => setShowEditModal(false)} aria-label="Close">
                ×
              </button>
            </div>
            <form className="user-modal-body" onSubmit={handleEditUser}>
              <div className="user-modal-grid">
                <label className="user-modal-field">
                  <span>Username</span>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    required
                  />
                </label>
                <label className="user-modal-field">
                  <span>Display Name</span>
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    required
                  />
                </label>
                <label className="user-modal-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                  />
                </label>
                <label className="user-modal-field">
                  <span>Password (leave blank to keep)</span>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    minLength={6}
                  />
                </label>
                <label className="user-modal-field">
                  <span>Role</span>
                  <select
                    value={editForm.roleId}
                    onChange={(e) => setEditForm({ ...editForm, roleId: e.target.value })}
                  >
                    {roleOptions.map((role) => (
                      <option key={role.id} value={role.id}>{role.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              {editError && <div className="users-error">{editError}</div>}

              <div className="user-modal-actions">
                <button
                  type="button"
                  className="add-user-btn refresh-btn"
                  onClick={() => { resetEditForm(); setShowEditModal(false); }}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="add-user-btn" disabled={editLoading}>
                  {editLoading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
