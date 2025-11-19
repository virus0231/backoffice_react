import { useState } from 'react';
import './Permissions.css';

const Permissions = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [permissions, setPermissions] = useState({
    users: false,
    permissions: false,
    fundAssociation: false,
    donor: false,
    donation: false,
    schedules: false,
    configuration: false,
    qurbani: false,
    employee: false,
    reports: false,
    cause: false
  });

  const handlePermissionChange = (permission) => {
    setPermissions({
      ...permissions,
      [permission]: !permissions[permission]
    });
  };

  const handleAssignPermissions = () => {
    if (!selectedRole) {
      alert('Please select a role first');
      return;
    }
    console.log('Assigning permissions:', { role: selectedRole, permissions });
    alert('Permissions assigned successfully!');
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
            >
              <option value="">Select User Role</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <div className="permissions-list">
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.users}
                onChange={() => handlePermissionChange('users')}
              />
              <span>Users</span>
            </label>

            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.permissions}
                onChange={() => handlePermissionChange('permissions')}
              />
              <span>Permissions</span>
            </label>

            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.fundAssociation}
                onChange={() => handlePermissionChange('fundAssociation')}
              />
              <span>Fund Association</span>
            </label>

            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.donor}
                onChange={() => handlePermissionChange('donor')}
              />
              <span>donor</span>
            </label>

            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.donation}
                onChange={() => handlePermissionChange('donation')}
              />
              <span>Donation</span>
            </label>

            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.schedules}
                onChange={() => handlePermissionChange('schedules')}
              />
              <span>Schedules</span>
            </label>

            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.configuration}
                onChange={() => handlePermissionChange('configuration')}
              />
              <span>Configuration</span>
            </label>

            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.qurbani}
                onChange={() => handlePermissionChange('qurbani')}
              />
              <span>Qurbani</span>
            </label>

            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.employee}
                onChange={() => handlePermissionChange('employee')}
              />
              <span>Employee</span>
            </label>

            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.reports}
                onChange={() => handlePermissionChange('reports')}
              />
              <span>Reports</span>
            </label>

            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.cause}
                onChange={() => handlePermissionChange('cause')}
              />
              <span>cause</span>
            </label>
          </div>

          <button className="assign-btn" onClick={handleAssignPermissions}>
            Assign Permissions
          </button>
        </div>
      </div>
    </div>
  );
};

export default Permissions;
