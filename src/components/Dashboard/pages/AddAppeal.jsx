import { useState } from 'react';
import apiClient from '@/lib/api/client';
import { useToast } from '../../ToastContainer';
import './AddAppeal.css';

const AddAppeal = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [formData, setFormData] = useState({
    status: 'Enabled',
    appealName: '',
    description: '',
    image: '',
    category: '',
    sort: 0,
    onHome: 'No',
    onFooter: 'No',
    onDonate: 'Yes',
    allowCustomAmount: 'Yes',
    allowQuantity: 'No',
    allowAssociation: 'No',
    allowDropdownAmount: 'No',
    allowRecurringType: 'Yes',
    recurringIntervals: {
      oneOff: true,
      monthly: true,
      yearly: false,
      daily: false
    },
    appealCountry: '',
    appealCause: 'NA',
    appealGoal: '',
    appealType: 'Suggested'
  });

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (interval) => {
    setFormData(prev => ({
      ...prev,
      recurringIntervals: {
        ...prev.recurringIntervals,
        [interval]: !prev.recurringIntervals[interval]
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setFormData(prev => ({
        ...prev,
        image: file.name
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create intervals string
      const intervals = [];
      if (formData.recurringIntervals.oneOff) intervals.push('0');
      if (formData.recurringIntervals.monthly) intervals.push('1');
      if (formData.recurringIntervals.yearly) intervals.push('2');
      if (formData.recurringIntervals.daily) intervals.push('3');

      const requestData = {
        status: formData.status.toLowerCase(),
        appealName: formData.appealName,
        description: formData.description,
        image: formData.image,
        category: formData.category,
        sort: formData.sort,
        onHome: formData.onHome === 'Yes',
        onFooter: formData.onFooter === 'Yes',
        onDonate: formData.onDonate === 'Yes',
        allowCustomAmount: formData.allowCustomAmount === 'Yes',
        allowQuantity: formData.allowQuantity === 'Yes',
        allowAssociation: formData.allowAssociation === 'Yes',
        allowDropdownAmount: formData.allowDropdownAmount === 'Yes',
        allowRecurringType: formData.allowRecurringType === 'Yes',
        recurringIntervals: intervals,
        appealCountry: formData.appealCountry,
        appealCause: formData.appealCause,
        appealGoal: formData.appealGoal,
        appealType: formData.appealType
      };

      const response = await apiClient.post('appeals', requestData);

      if (response.success) {
        showSuccess('Appeal added successfully!');
        // Reset form
        setFormData({
          status: 'Enabled',
          appealName: '',
          description: '',
          image: '',
          category: '',
          sort: 0,
          onHome: 'No',
          onFooter: 'No',
          onDonate: 'Yes',
          allowCustomAmount: 'Yes',
          allowQuantity: 'No',
          allowAssociation: 'No',
          allowDropdownAmount: 'No',
          allowRecurringType: 'Yes',
          recurringIntervals: {
            oneOff: true,
            monthly: true,
            yearly: false,
            daily: false
          },
          appealCountry: '',
          appealCause: 'NA',
          appealGoal: '',
          appealType: 'Suggested'
        });
        setImageFile(null);
      } else {
        showError('Failed to add appeal. Please try again.');
      }
    } catch (error) {
      console.error('Error adding appeal:', error);

      // Handle validation errors (422)
      if (error.status === 422 && error.errors) {
        // Display all validation errors
        const errorMessages = Object.values(error.errors).flat();
        errorMessages.forEach(msg => showError(msg));
      } else if (error.message) {
        showError(error.message);
      } else {
        showError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-appeal-page">
      <div className="add-appeal-header">
        <h1 className="add-appeal-title">Add New Appeal</h1>
        <div className="add-appeal-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Causes</span>
          <span className="breadcrumb-separator">/</span>
          <span>Appeals</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Add Appeal</span>
        </div>
      </div>

      <div className="add-appeal-content">
        <div className="appeal-tab">
          <span className="appeal-tab-active">Appeal</span>
        </div>

        <form onSubmit={handleSubmit} className="appeal-form">
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="form-select"
              >
                <option value="Enabled">Enabled</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="appealName">Appeal Name</label>
              <input
                type="text"
                id="appealName"
                placeholder="Appeal Name"
                value={formData.appealName}
                onChange={(e) => handleInputChange('appealName', e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="form-textarea"
                rows="3"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="image">Image</label>
              <div className="image-input-wrapper">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-file-input"
                />
                <span className="file-label">{formData.image || '#'}</span>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="form-select"
              >
                <option value="">Select Category</option>
                <option value="emergency">Emergency</option>
                <option value="education">Education</option>
                <option value="health">Health</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="form-group small">
              <label htmlFor="sort">Sort</label>
              <input
                type="number"
                id="sort"
                value={formData.sort}
                onChange={(e) => handleInputChange('sort', e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="onHome">On Home</label>
              <select
                id="onHome"
                value={formData.onHome}
                onChange={(e) => handleInputChange('onHome', e.target.value)}
                className="form-select"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="onFooter">On Footer</label>
              <select
                id="onFooter"
                value={formData.onFooter}
                onChange={(e) => handleInputChange('onFooter', e.target.value)}
                className="form-select"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="onDonate">On Donate</label>
              <select
                id="onDonate"
                value={formData.onDonate}
                onChange={(e) => handleInputChange('onDonate', e.target.value)}
                className="form-select"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="allowCustomAmount">Allow Custom Amount</label>
              <select
                id="allowCustomAmount"
                value={formData.allowCustomAmount}
                onChange={(e) => handleInputChange('allowCustomAmount', e.target.value)}
                className="form-select"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="allowQuantity">Allow Quantity</label>
              <select
                id="allowQuantity"
                value={formData.allowQuantity}
                onChange={(e) => handleInputChange('allowQuantity', e.target.value)}
                className="form-select"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="allowAssociation">Allow Association</label>
              <select
                id="allowAssociation"
                value={formData.allowAssociation}
                onChange={(e) => handleInputChange('allowAssociation', e.target.value)}
                className="form-select"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="allowDropdownAmount">Allow Dropdown amount</label>
              <select
                id="allowDropdownAmount"
                value={formData.allowDropdownAmount}
                onChange={(e) => handleInputChange('allowDropdownAmount', e.target.value)}
                className="form-select"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="allowRecurringType">Allow Recurring Type</label>
              <select
                id="allowRecurringType"
                value={formData.allowRecurringType}
                onChange={(e) => handleInputChange('allowRecurringType', e.target.value)}
                className="form-select"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Recurring Intervals</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.recurringIntervals.oneOff}
                    onChange={() => handleCheckboxChange('oneOff')}
                  />
                  <span>One-Off</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.recurringIntervals.monthly}
                    onChange={() => handleCheckboxChange('monthly')}
                  />
                  <span>Monthly</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.recurringIntervals.yearly}
                    onChange={() => handleCheckboxChange('yearly')}
                  />
                  <span>Yearly</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.recurringIntervals.daily}
                    onChange={() => handleCheckboxChange('daily')}
                  />
                  <span>Daily</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="appealCountry">Appeal Country</label>
              <select
                id="appealCountry"
                value={formData.appealCountry}
                onChange={(e) => handleInputChange('appealCountry', e.target.value)}
                className="form-select"
              >
                <option value="">Select Country</option>
                <option value="UK">United Kingdom</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="appealCause">Appeal Cause</label>
              <input
                type="text"
                id="appealCause"
                value={formData.appealCause}
                onChange={(e) => handleInputChange('appealCause', e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="appealGoal">Appeal Goal</label>
              <input
                type="number"
                id="appealGoal"
                placeholder="200000"
                value={formData.appealGoal}
                onChange={(e) => handleInputChange('appealGoal', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="appealType">Appeal Type</label>
              <select
                id="appealType"
                value={formData.appealType}
                onChange={(e) => handleInputChange('appealType', e.target.value)}
                className="form-select"
              >
                <option value="Suggested">Suggested</option>
                <option value="Fixed">Fixed</option>
                <option value="Open">Open</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-add-appeal" disabled={loading}>
              {loading ? 'Adding...' : 'Add Appeal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAppeal;
