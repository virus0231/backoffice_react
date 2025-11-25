import { useEffect, useState } from 'react';
import API from '../../../utils/api';
import './Permissions.css';

// Define all available permissions/modules
const AVAILABLE_PERMISSIONS = [
  { id: 1, name: 'Users', path: '/backend/pages/users/' },
  { id: 2, name: 'Permissions', path: '/backend/pages/permission/' },
  { id: 3, name: 'Causes', path: '/backend/pages/causes/' },
  { id: 4, name: 'Donor', path: '/backend/pages/donor/' },
  { id: 5, name: 'Donation', path: '/backend/pages/donation/' },
  { id: 6, name: 'Schedules', path: '/backend/pages/schedules/' },
  { id: 7, name: 'Configuration', path: '/backend/pages/dm/' },
  { id: 8, name: 'Reports', path: '/backend/pages/report/' },
  { id: 9, name: 'CRM', path: '/backend/pages/crm/' },
  { id: 10, name: 'Seasons', path: '/backend/pages/seasons/' },
  { id: 11, name: 'Manual Transaction', path: '/backend/pages/ManualTransaction/' },
];

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
    AVAILABLE_PERMISSIONS.forEach(perm => {
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
      AVAILABLE_PERMISSIONS.forEach(perm => {
        resetPermissions[perm.id] = false;
      });
      setPermissions(resetPermissions);
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

        // Set all permissions based on what the role has
        AVAILABLE_PERMISSIONS.forEach(perm => {
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
      const selectedPermissions = AVAILABLE_PERMISSIONS
        .filter(perm => permissions[perm.id])
        .map(perm => perm.id);

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
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <label key={perm.id} className="permission-item">
                    <input
                      type="checkbox"
                      checked={!!permissions[perm.id]}
                      onChange={() => handlePermissionChange(perm.id)}
                      disabled={saving}
                    />
                    <span>{perm.name}</span>
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
