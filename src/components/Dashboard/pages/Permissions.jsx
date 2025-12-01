import { useEffect, useState } from 'react';
import { getPhpApiBase } from '@/lib/config/phpApi';
import { getAllPermissions, getGroupedPermissions } from '../../../config/routes';
import './Permissions.css';

const BASE_URL = getPhpApiBase();

const Permissions = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize permissions state
  useEffect(() => {
    const initialPermissions = {};
    getAllPermissions().forEach(perm => {
      initialPermissions[perm.id] = false;
    });
    setPermissions(initialPermissions);
  }, []);

  // Fetch roles on mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // Fetch permissions when role changes
  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole);
    } else {
      // Reset all to unchecked
      const resetPermissions = {};
      getAllPermissions().forEach(perm => {
        resetPermissions[perm.id] = false;
      });
      setPermissions(resetPermissions);
    }
  }, [selectedRole]);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${BASE_URL}/permissions/roles`, {
        method: 'POST',
        credentials: 'include'
      });
      const result = await response.json();
      if (result?.success && result?.data) {
        setRoles(result.data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to load roles');
    }
  };

  const fetchRolePermissions = async (roleId) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${BASE_URL}/permissions/list`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_id: roleId })
      });
      const result = await response.json();

      if (result?.success) {
        const rolePermissions = result.permissions || [];
        const allPermissions = getAllPermissions();
        const updatedPermissions = {};

        // Set all permissions based on what the role has
        allPermissions.forEach(perm => {
          updatedPermissions[perm.id] = rolePermissions.includes(perm.id);
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
      const selectedPermissions = getAllPermissions()
        .filter(perm => permissions[perm.id])
        .map(perm => perm.id);

      const response = await fetch(`${BASE_URL}/permissions/update`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_id: selectedRole,
          permissions: selectedPermissions
        })
      });
      const result = await response.json();

      if (result?.success) {
        setSuccess('Permissions updated successfully!');
        // Refresh permissions to confirm
        fetchRolePermissions(selectedRole);
      } else {
        setError(result?.message || 'Failed to update permissions');
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
                  {role.user_role || role.name || role.label || role.id}
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
                {Object.entries(getGroupedPermissions()).map(([category, routes]) => (
                  <div key={category} className="permission-category">
                    <h3 className="category-title">{category}</h3>
                    <div className="category-permissions">
                      {routes.map((route) => (
                        <label key={route.id} className="permission-item">
                          <input
                            type="checkbox"
                            checked={!!permissions[route.id]}
                            onChange={() => handlePermissionChange(route.id)}
                            disabled={saving}
                          />
                          <span>{route.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
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
