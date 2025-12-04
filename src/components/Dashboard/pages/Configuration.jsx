import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../ToastContainer';
import './Configuration.css';

const Configuration = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page when directly accessing this page
    navigate('/', { replace: true });
  }, [navigate]);
  const [services, setServices] = useState([
    {
      id: 1,
      name: 'site_name',
      key: 'Forgotten Women',
      status: true
    },
    {
      id: 2,
      name: 'site_url',
      key: 'forgottenwomen.youronlineconversation.com',
      status: true
    },
    {
      id: 3,
      name: 'site_logo',
      key: '6913360d1a9d5_68804a437a6f17b7_logo.png',
      status: true
    },
    {
      id: 4,
      name: 'site_loader',
      key: 'fw_loader.gif',
      status: true
    }
  ]);

  const handleAddService = () => {
    console.log('Add new service');
    showWarning('Add Service functionality');
  };

  const handleToggleStatus = (id) => {
    setServices(services.map(service =>
      service.id === id
        ? { ...service, status: !service.status }
        : service
    ));
  };

  const handleEdit = (service) => {
    console.log('Edit service:', service);
    showWarning(`Edit service: ${service.name}`);
  };

  return (
    <div className="configuration-page">
      <div className="configuration-header">
        <h1 className="configuration-title">Configuration</h1>
        <div className="configuration-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Configuration</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Service</span>
        </div>
      </div>

      <div className="configuration-content">
        <div className="action-section">
          <button className="add-service-btn" onClick={handleAddService}>
            Add Service
          </button>
        </div>

        <div className="configuration-table-container">
          <table className="configuration-table">
            <thead>
              <tr>
                <th>SNO</th>
                <th>Name</th>
                <th>Key</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr key={service.id}>
                  <td>{index + 1}</td>
                  <td className="service-name">{service.name}</td>
                  <td className="service-key">{service.key}</td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={service.status}
                        onChange={() => handleToggleStatus(service.id)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">
                        {service.status ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(service)}
                    >
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

export default Configuration;
