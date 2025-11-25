import { useEffect, useState } from 'react';
import API from '../../../utils/api';
import './Permissions.css';

const Permissions = () => {
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch roles and modules on mount
  useEffect(() => {
    fetchRoles();
    fetchModules();
  }, []);

  // Fetch permissions when role changes
  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole);
    } else {
      setPermissions({});
    }
  }, [selectedRole]);

  const fetchRoles = async () => {
    try {
      const response = await API.post('permission.php', { action: 'get-roles' });
      if (response?.success && response?.data) {
        setRoles(response.data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to load roles');
    }
  };

  const fetchModules = async () => {
    try {
      const response = await API.post('permission.php', { action: 'get-permissions' });
      if (response?.success && response?.data) {
        setModules(response.data);
        // Initialize permissions state
        const initialPermissions = {};
        response.data.forEach(module => {
          initialPermissions[module.id] = false;
        });
        setPermissions(initialPermissions);
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError('Failed to load permission modules');
    }
  };

  const fetchRolePermissions = async (roleId) => {
    setLoading(true);
    setError('');
    try {
      const response = await API.post('permission.php', {
        action: 'get-role-permissions',
        role_id: roleId
      });

      if (response?.success) {
        const rolePermissions = response.permissions || [];
        const updatedPermissions = {};

        modules.forEach(module => {
          updatedPermissions[module.id] = rolePermissions.includes(module.id);
        });

        setPermissions(updatedPermissions);
      }
    } catch (err) {
      console.error('Error fetching role permissions:', err);
      setError('Failed to load permissions for this role');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permissionKey) => {
    setPermissions({
      ...permissions,
      [permissionKey]: !permissions[permissionKey]
    });
    setSuccess('');
    setError('');
  };

  const handleAssignPermissions = async () => {
    if (!selectedRole) {
      setError('Please select a role first');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Convert permissions object to array of permission IDs
      const selectedPermissions = modules
        .filter(module => permissions[module.id])
        .map(module => module.id);

      const response = await API.post('permission.php', {
        action: 'update-role-permissions',
        role_id: selectedRole,
        permissions: JSON.stringify(selectedPermissions)
      });

      if (response?.success) {
        setSuccess('Permissions updated successfully!');
        // Refresh permissions to confirm
        fetchRolePermissions(selectedRole);
      } else {
        setError(response?.message || 'Failed to update permissions');
      }
    } catch (err) {
      console.error('Error updating permissions:', err);
      setError('Failed to update permissions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="permissions-page">
      <div className="permissions-header">
        <h1 className="permissions-title">Permission</h1>
        <div className="permissions-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Permission</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Prevelages</span>
        </div>
      </div>

      <div className="permissions-content">
        <div className="permissions-card">
          <div className="role-selector">
            <label htmlFor="role-select">Select Role:</label>
            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="role-dropdown"
              disabled={loading}
            >
              <option value="">Select User Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.user_role}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="permissions-error">{error}</div>}
          {success && <div className="permissions-success">{success}</div>}

          {loading ? (
            <div className="permissions-loading">Loading permissions...</div>
          ) : selectedRole ? (
            <>
              <div className="permissions-list">
                {modules.map((module) => (
                  <label key={module.id} className="permission-item">
                    <input
                      type="checkbox"
                      checked={!!permissions[module.id]}
                      onChange={() => handlePermissionChange(module.id)}
                      disabled={saving}
                    />
                    <span>{module.permission_name || module.name}</span>
                  </label>
                ))}
              </div>

              <button
                className="assign-btn"
                onClick={handleAssignPermissions}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Assign Permissions'}
              </button>
            </>
          ) : (
            <div className="permissions-empty">
              Please select a role to manage permissions
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Permissions;
