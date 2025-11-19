import { useState } from 'react';
import './DonorReport.css';

const DonorReport = () => {
  const lybuntDonors = [
    { name: 'saad', email: 'saadsajid@youronlineconversation.com', phone: '0987654', lastDonation: '76' }
  ];

  const sybuntDonors = [];

  const topLevelDonors = [];

  const midLevelDonors = [];

  const lowLevelDonors = [];

  const handleExport = (section) => {
    console.log(`Export ${section}`);
    alert(`Exporting ${section} donors...`);
  };

  return (
    <div className="donor-report-page">
      <div className="donor-report-header">
        <h1 className="donor-report-title">Donor Segmentation Reports</h1>
      </div>

      <div className="donor-report-content">
        {/* LYBUNT Donors Section */}
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
      </div>
    </div>
  );
};

export default DonorReport;
