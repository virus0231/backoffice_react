import { useState } from 'react';
import './Donors.css';

const Donors = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [donors, setDonors] = useState([
    {
      id: 1,
      firstName: 'Muhammad',
      lastName: 'Shuja',
      phone: '923505551212',
      email: 'muhammad.shuja@youronlineconversation.com'
    },
    {
      id: 2,
      firstName: 'Saladin',
      lastName: 'Ali',
      phone: '447470709329',
      email: 'sali@forgottenwomen.org'
    },
    {
      id: 3,
      firstName: 'Hunain',
      lastName: 'Hyder',
      phone: '921231234567',
      email: 'taha@youronlineconversation.com'
    },
    {
      id: 4,
      firstName: 'SHAHZAIB',
      lastName: 'Siddiqui',
      phone: '44208146020',
      email: 'shahzaib@youronlineconversation.com'
    },
    {
      id: 5,
      firstName: 'Hunain',
      lastName: 'Hyder',
      phone: '921231234567',
      email: 'saadsaifi@youronlineconversation.com'
    }
  ]);

  const [filteredDonors, setFilteredDonors] = useState(donors);

  const handleSearch = () => {
    if (searchEmail.trim() === '') {
      setFilteredDonors(donors);
    } else {
      const filtered = donors.filter(donor =>
        donor.email.toLowerCase().includes(searchEmail.toLowerCase())
      );
      setFilteredDonors(filtered);
    }
  };

  const handleEdit = (donor) => {
    console.log('Edit donor:', donor);
    alert(`Edit donor: ${donor.firstName} ${donor.lastName}`);
  };

  const handleDonation = (donor) => {
    console.log('View donations for:', donor);
    alert(`View donations for: ${donor.firstName} ${donor.lastName}`);
  };

  const handleSubscription = (donor) => {
    console.log('View subscription for:', donor);
    alert(`View subscription for: ${donor.firstName} ${donor.lastName}`);
  };

  return (
    <div className="donors-page">
      <div className="donors-header">
        <h1 className="donors-title">Donor List</h1>
        <div className="donors-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Donor</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Donor List</span>
        </div>
      </div>

      <div className="donors-content">
        <div className="search-section">
          <div className="search-input-group">
            <label htmlFor="donor-email">Donor Email</label>
            <input
              type="email"
              id="donor-email"
              placeholder="Enter Donor Email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>

        <div className="donors-table-container">
          <table className="donors-table">
            <thead>
              <tr>
                <th>SNO</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.map((donor) => (
                <tr key={donor.id}>
                  <td>{donor.id}</td>
                  <td className="donor-first-name">{donor.firstName}</td>
                  <td className="donor-last-name">{donor.lastName}</td>
                  <td className="donor-phone">{donor.phone}</td>
                  <td className="donor-email">{donor.email}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit-btn" onClick={() => handleEdit(donor)}>
                        Edit
                      </button>
                      <button className="action-btn donation-btn" onClick={() => handleDonation(donor)}>
                        Donation
                      </button>
                      <button className="action-btn subscription-btn" onClick={() => handleSubscription(donor)}>
                        Subscription
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDonors.length === 0 && (
            <div className="no-results">
              <p>No donors found matching "{searchEmail}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Donors;
