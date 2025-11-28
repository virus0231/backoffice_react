import { useState, useEffect } from 'react';
import './DonorReport.css';

const BASE_URL = import.meta.env.DEV
  ? '/backoffice/yoc'
  : 'https://forgottenwomen.youronlineconversation.com/backoffice/yoc';

const DonorReport = () => {
  const [lybuntDonors, setLybuntDonors] = useState([]);
  const [sybuntDonors, setSybuntDonors] = useState([]);
  const [topLevelDonors, setTopLevelDonors] = useState([]);
  const [midLevelDonors, setMidLevelDonors] = useState([]);
  const [lowLevelDonors, setLowLevelDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDonorSegmentation();
  }, []);

  const fetchDonorSegmentation = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/donor-segmentation.php`, {
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success && result.data) {
        setLybuntDonors(result.data.lybunt || []);
        setSybuntDonors(result.data.sybunt || []);
        setTopLevelDonors(result.data.topLevel || []);
        setMidLevelDonors(result.data.midLevel || []);
        setLowLevelDonors(result.data.lowLevel || []);
      } else {
        setError('Failed to load donor segmentation');
      }
    } catch (err) {
      console.error('Error fetching donor segmentation:', err);
      setError('Failed to load donor segmentation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (section) => {
    alert(`Export functionality for ${section} donors will be implemented`);
  };

  return (
    <div className="donor-report-page">
      <div className="donor-report-header">
        <h1 className="donor-report-title">Donor Segmentation Reports</h1>
      </div>

      <div className="donor-report-content">
        {error && (
          <div className="users-error" style={{ marginBottom: 12 }}>
            <strong>Error:</strong> {error}
            <button
              onClick={fetchDonorSegmentation}
              className="edit-btn"
              style={{ marginLeft: 12, padding: '6px 12px' }}
            >
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#666'
          }}>
            Loading donor segmentation...
          </div>
        )}

        {/* LYBUNT Donors Section */}
        {!loading && (
          <>
            <div className="segment-section">
              <div className="segment-header">
                <div>
                  <h2 className="segment-title">LYBUNT Donors</h2>
                  <p className="segment-subtitle">Last Year But Not This Year</p>
                </div>
                <button className="export-btn" onClick={() => handleExport('LYBUNT')}>
                  Export
                </button>
              </div>
              <div className="segment-table-container">
                <table className="segment-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Last Donation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lybuntDonors.length > 0 ? (
                      lybuntDonors.map((donor, index) => (
                        <tr key={index}>
                          <td className="donor-name">{donor.name}</td>
                          <td className="donor-email">{donor.email}</td>
                          <td className="donor-phone">{donor.phone}</td>
                          <td className="donor-date">{donor.lastDonation}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="no-data">No donors in this segment</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SYBUNT Donors Section */}
            <div className="segment-section">
          <div className="segment-header">
            <div>
              <h2 className="segment-title">SYBUNT Donors</h2>
              <p className="segment-subtitle">Same Year But Not This Year</p>
            </div>
            <button className="export-btn" onClick={() => handleExport('SYBUNT')}>
              Export
            </button>
          </div>
          <div className="segment-table-container">
            <table className="segment-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Last Donation</th>
                </tr>
              </thead>
              <tbody>
                {sybuntDonors.length > 0 ? (
                  sybuntDonors.map((donor, index) => (
                    <tr key={index}>
                      <td className="donor-name">{donor.name}</td>
                      <td className="donor-email">{donor.email}</td>
                      <td className="donor-phone">{donor.phone}</td>
                      <td className="donor-date">{donor.lastDonation}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">No donors in this segment</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Level Donors Section */}
        <div className="segment-section">
          <div className="segment-header">
            <div>
              <h2 className="segment-title">Top Level Donors</h2>
              <p className="segment-subtitle">$1,000 or More</p>
            </div>
            <button className="export-btn" onClick={() => handleExport('Top Level')}>
              Export
            </button>
          </div>
          <div className="segment-table-container">
            <table className="segment-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Total Donated</th>
                </tr>
              </thead>
              <tbody>
                {topLevelDonors.length > 0 ? (
                  topLevelDonors.map((donor, index) => (
                    <tr key={index}>
                      <td className="donor-name">{donor.name}</td>
                      <td className="donor-email">{donor.email}</td>
                      <td className="donor-phone">{donor.phone}</td>
                      <td className="donor-amount">${donor.totalDonated.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">No donors in this segment</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mid Level Donors Section */}
        <div className="segment-section">
          <div className="segment-header">
            <div>
              <h2 className="segment-title">Mid Level Donors</h2>
              <p className="segment-subtitle">$100 - $999</p>
            </div>
            <button className="export-btn" onClick={() => handleExport('Mid Level')}>
              Export
            </button>
          </div>
          <div className="segment-table-container">
            <table className="segment-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Total Donated</th>
                </tr>
              </thead>
              <tbody>
                {midLevelDonors.length > 0 ? (
                  midLevelDonors.map((donor, index) => (
                    <tr key={index}>
                      <td className="donor-name">{donor.name}</td>
                      <td className="donor-email">{donor.email}</td>
                      <td className="donor-phone">{donor.phone}</td>
                      <td className="donor-amount">${donor.totalDonated.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">No donors in this segment</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Level Donors Section */}
        <div className="segment-section">
          <div className="segment-header">
            <div>
              <h2 className="segment-title">Low Level Donors</h2>
              <p className="segment-subtitle">$1 - $99</p>
            </div>
            <button className="export-btn" onClick={() => handleExport('Low Level')}>
              Export
            </button>
          </div>
          <div className="segment-table-container">
            <table className="segment-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Total Donated</th>
                </tr>
              </thead>
              <tbody>
                {lowLevelDonors.length > 0 ? (
                  lowLevelDonors.map((donor, index) => (
                    <tr key={index}>
                      <td className="donor-name">{donor.name}</td>
                      <td className="donor-email">{donor.email}</td>
                      <td className="donor-phone">{donor.phone}</td>
                      <td className="donor-amount">${donor.totalDonated.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">No donors in this segment</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DonorReport;
