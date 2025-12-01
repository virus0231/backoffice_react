import { useState, useEffect } from 'react';
import { getPhpApiBase } from '@/lib/config/phpApi';
import './Appeal.css';

const BASE_URL = getPhpApiBase();

const defaultForm = () => ({
  id: null,
  appealName: '',
  description: '',
  category: '',
  appealGoal: '',
  sort: 0,
  onHome: false,
  onDonate: false,
  onFooter: false,
  status: 'enabled',
  allowCustomAmount: true,
  allowQuantity: false,
  allowDropdownAmount: false,
  allowRecurringType: true,
  allowAssociation: false,
  recurringIntervals: ['0'],
  appealType: 'Suggested',
  appealCountry: '',
  appealCause: 'NA',
  image: ''
});

const Appeal = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [addForm, setAddForm] = useState(defaultForm());
  const [editForm, setEditForm] = useState(defaultForm());
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [metaError, setMetaError] = useState('');

  useEffect(() => {
    fetchAppeals();
    fetchMeta();
  }, []);

  const fetchAppeals = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/filters/appeals`, {
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success && result.data) {
        const transformedData = result.data.map((appeal, index) => ({
          id: appeal.id,
          sno: index + 1,
          name: appeal.appeal_name,
          description: appeal.description || '',
          image: appeal.image || '',
          category: appeal.category || '',
          appealGoal: appeal.goal || '',
          sort: appeal.sort || 0,
          visibleHome: appeal.ishome_v ? Number(appeal.ishome_v) === 1 : false,
          visibleDonate: appeal.isdonate_v ? Number(appeal.isdonate_v) === 1 : false,
          visibleFooter: appeal.isfooter ? Number(appeal.isfooter) === 1 : false,
          status: appeal.status === 'active' ? 'enabled' : 'disabled',
          startDate: appeal.start_date,
          endDate: appeal.end_date,
          allowCustomAmount: appeal.isother_v ? Number(appeal.isother_v) === 1 : true,
          allowQuantity: appeal.isquantity_v ? Number(appeal.isquantity_v) === 1 : false,
          allowDropdownAmount: appeal.isdropdown_v ? Number(appeal.isdropdown_v) === 1 : false,
          allowRecurringType: appeal.isrecurring_v ? Number(appeal.isrecurring_v) === 1 : true,
          allowAssociation: appeal.isassociate ? Number(appeal.isassociate) === 1 : false,
          recurringIntervals: appeal.recurring_interval
            ? String(appeal.recurring_interval).split(',').filter(Boolean)
            : ['0'],
          appealType: appeal.type || 'Suggested',
          appealCountry: appeal.country || '',
          appealCause: appeal.cause || 'NA'
        }));
        setAppeals(transformedData);
      } else {
        setError('Failed to load appeals');
      }
    } catch (err) {
      console.error('Error fetching appeals:', err);
      setError('Failed to load appeals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      setMetaError('');
      const [catResp, countryResp] = await Promise.all([
        fetch(`${BASE_URL}/categories`, { credentials: 'include' }),
        fetch(`${BASE_URL}/filters/countries`, { credentials: 'include' })
      ]);
      const catJson = await catResp.json();
      const countryJson = await countryResp.json();
      if (catJson.success && Array.isArray(catJson.data)) {
        setCategories(catJson.data);
      } else {
        setMetaError('Unable to load categories');
      }
      if (countryJson.success && Array.isArray(countryJson.data)) {
        setCountries(countryJson.data);
      } else {
        setMetaError('Unable to load countries');
      }
    } catch (err) {
      console.error(err);
      setMetaError('Failed to load categories/countries');
    }
  };

  const clampPage = (nextEntries) => {
    const totalPages = Math.max(1, Math.ceil(filteredAppeals.length / nextEntries));
    if (page > totalPages) setPage(totalPages);
  };

  const handleToggle = (id, field) => {
    setAppeals((prev) =>
      prev.map((appeal) =>
        appeal.id === id ? { ...appeal, [field]: !appeal[field] } : appeal
      )
    );
  };

  const filteredAppeals = appeals.filter((appeal) =>
    appeal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    clampPage(entriesPerPage);
  }, [entriesPerPage, filteredAppeals.length]);

  const totalPages = Math.max(1, Math.ceil(filteredAppeals.length / entriesPerPage));
  const startIndex = (page - 1) * entriesPerPage;
  const paginatedAppeals = filteredAppeals.slice(startIndex, startIndex + entriesPerPage);

  const submitAppealForm = async (isUpdate, form) => {
    const payload = {
      status: form.status,
      appealName: form.appealName.trim(),
      description: form.description || '',
      image: form.image || '',
      onHome: form.onHome,
      appealCountry: form.appealCountry || '',
      appealCause: form.appealCause || '',
      category: form.category || '',
      appealGoal: form.appealGoal || 0,
      sort: form.sort || 0,
      onFooter: form.onFooter,
      onDonate: form.onDonate,
      allowCustomAmount: form.allowCustomAmount,
      allowQuantity: form.allowQuantity,
      allowDropdownAmount: form.allowDropdownAmount,
      allowRecurringType: form.allowRecurringType,
      allowAssociation: form.allowAssociation,
      appealType: form.appealType || 'Suggested',
      recurringIntervals: form.recurringIntervals && form.recurringIntervals.length
        ? form.recurringIntervals
        : ['0']
    };

    const url = isUpdate && form.id
      ? `${BASE_URL}/appeals/${form.id}`
      : `${BASE_URL}/appeals`;

    const method = isUpdate ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Request failed');
    }
  };

  const handleAddAppeal = () => {
    setFormError('');
    setAddForm({ ...defaultForm(), sort: appeals.length + 1 });
    setShowAddModal(true);
  };

  const handleEdit = (appeal) => {
    setFormError('');
    setEditForm({
      ...defaultForm(),
      id: appeal.id,
      appealName: appeal.name,
      description: appeal.description || '',
      category: appeal.category || '',
      appealGoal: appeal.appealGoal || '',
      sort: appeal.sort || 0,
      status: appeal.status,
      onHome: appeal.visibleHome,
      onFooter: appeal.visibleFooter,
      onDonate: appeal.visibleDonate,
      allowCustomAmount: appeal.allowCustomAmount,
      allowQuantity: appeal.allowQuantity,
      allowDropdownAmount: appeal.allowDropdownAmount,
      allowRecurringType: appeal.allowRecurringType,
      allowAssociation: appeal.allowAssociation,
      recurringIntervals: appeal.recurringIntervals || ['0'],
      appealType: appeal.appealType || 'Suggested',
      appealCountry: appeal.appealCountry || '',
      appealCause: appeal.appealCause || 'NA',
      image: appeal.image || ''
    });
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.appealName.trim()) {
      setFormError('Appeal name is required.');
      return;
    }
    setFormError('');
    try {
      setAddSubmitting(true);
      await submitAppealForm(false, addForm);
      setShowAddModal(false);
      setAddForm(defaultForm());
      fetchAppeals();
    } catch (err) {
      console.error(err);
      setFormError('Unable to add appeal. Please try again.');
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.appealName.trim()) {
      setFormError('Appeal name is required.');
      return;
    }
    setFormError('');
    try {
      setEditSubmitting(true);
      await submitAppealForm(true, editForm);
      setShowEditModal(false);
      setEditForm(defaultForm());
      fetchAppeals();
    } catch (err) {
      console.error(err);
      setFormError('Unable to update appeal. Please try again.');
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="appeal-page">
      <div className="appeal-header">
        <h1 className="appeal-title">Appeal</h1>
        <div className="appeal-breadcrumb">
          <span>Back Office</span>
          <span className="breadcrumb-separator">/</span>
          <span>Causes</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Appeals</span>
        </div>
      </div>

      <div className="appeal-content">
        <button className="add-button" onClick={handleAddAppeal}>
          Add Appeal
        </button>

        {error && (
          <div className="users-error" style={{ marginTop: 12 }}>
            <strong>Error:</strong> {error}
            <button
              onClick={fetchAppeals}
              className="edit-btn"
              style={{ marginLeft: 12, padding: '6px 12px' }}
            >
              Retry
            </button>
          </div>
        )}
        {metaError && (
          <div className="users-error" style={{ marginTop: 12 }}>
            {metaError}
          </div>
        )}

        {loading && (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#666'
          }}>
            Loading appeals...
          </div>
        )}

        <div className="table-controls">
          <div className="entries-control">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="entries-select"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>
          <div className="search-control">
            <span>Search:</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="search-input"
            />
          </div>
        </div>

        <div className="table-container">
          <table className="appeal-table">
            <thead>
              <tr>
                <th>Sno</th>
                <th>Name</th>
                <th>Sort</th>
                <th>Visible on Home</th>
                <th>Visible on Donate</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && paginatedAppeals.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
                    {searchTerm ? 'No appeals found matching your search.' : 'No appeals available.'}
                  </td>
                </tr>
              ) : (
                paginatedAppeals.map((appeal, idx) => (
                  <tr key={appeal.id ?? idx}>
                    <td>{startIndex + idx + 1}</td>
                    <td className="appeal-name">{appeal.name}</td>
                    <td>{appeal.sort}</td>
                    <td>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={appeal.visibleHome}
                          onChange={() => handleToggle(appeal.id, 'visibleHome')}
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">{appeal.visibleHome ? 'Yes' : 'No'}</span>
                      </label>
                    </td>
                    <td>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={appeal.visibleDonate}
                          onChange={() => handleToggle(appeal.id, 'visibleDonate')}
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">{appeal.visibleDonate ? 'Yes' : 'No'}</span>
                      </label>
                    </td>
                    <td>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={appeal.status === 'enabled'}
                          onChange={() => handleToggle(appeal.id, 'status')}
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">{appeal.status === 'enabled' ? 'Enabled' : 'Disabled'}</span>
                      </label>
                    </td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(appeal)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && appeals.length > 0 && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            color: '#666',
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              Showing {paginatedAppeals.length ? `${startIndex + 1}-${startIndex + paginatedAppeals.length}` : 0} of {filteredAppeals.length} entries
              {searchTerm && ` (filtered from ${appeals.length} total)`}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                className="edit-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              <span style={{ fontWeight: 600 }}>Page {page} of {totalPages}</span>
              <button
                className="edit-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="user-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="user-modal-header">
              <h3>Add Appeal</h3>
              <button className="user-modal-close" onClick={() => setShowAddModal(false)} aria-label="Close">
                ×
              </button>
            </div>
            <form className="user-modal-body" onSubmit={handleAddSubmit}>
              <div className="user-modal-grid">
                <label className="user-modal-field">
                  <span>Status</span>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </label>
                <label className="user-modal-field" style={{ gridColumn: 'span 2' }}>
                  <span>Appeal Name</span>
                  <input
                    type="text"
                    value={addForm.appealName}
                    onChange={(e) => setAddForm({ ...addForm, appealName: e.target.value })}
                    required
                  />
                </label>
                <label className="user-modal-field" style={{ gridColumn: 'span 2' }}>
                  <span>Description</span>
                  <textarea
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                    rows={2}
                    style={{ resize: 'vertical' }}
                  />
                </label>
                <label className="user-modal-field">
                  <span>Image</span>
                  <input
                    type="text"
                    value={addForm.image}
                    onChange={(e) => setAddForm({ ...addForm, image: e.target.value })}
                    placeholder="Image URL or name"
                  />
                </label>
                <label className="user-modal-field">
                  <span>Category</span>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <label className="user-modal-field">
                  <span>Sort</span>
                  <input
                    type="number"
                    value={addForm.sort}
                    onChange={(e) => setAddForm({ ...addForm, sort: Number(e.target.value) || 0 })}
                  />
                </label>
                <label className="user-modal-field">
                  <span>On Home</span>
                  <select
                    value={addForm.onHome ? 'Yes' : 'No'}
                    onChange={(e) => setAddForm({ ...addForm, onHome: e.target.value === 'Yes' })}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </label>
                <label className="user-modal-field">
                  <span>On Footer</span>
                  <select
                    value={addForm.onFooter ? 'Yes' : 'No'}
                    onChange={(e) => setAddForm({ ...addForm, onFooter: e.target.value === 'Yes' })}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </label>
                <label className="user-modal-field">
                  <span>On Donate</span>
                  <select
                    value={addForm.onDonate ? 'Yes' : 'No'}
                    onChange={(e) => setAddForm({ ...addForm, onDonate: e.target.value === 'Yes' })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label className="user-modal-field">
                  <span>Allow Custom Amount</span>
                  <select
                    value={addForm.allowCustomAmount ? 'Yes' : 'No'}
                    onChange={(e) => setAddForm({ ...addForm, allowCustomAmount: e.target.value === 'Yes' })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label className="user-modal-field">
                  <span>Allow Quantity</span>
                  <select
                    value={addForm.allowQuantity ? 'Yes' : 'No'}
                    onChange={(e) => setAddForm({ ...addForm, allowQuantity: e.target.value === 'Yes' })}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </label>
                <label className="user-modal-field">
                  <span>Allow Association</span>
                  <select
                    value={addForm.allowAssociation ? 'Yes' : 'No'}
                    onChange={(e) => setAddForm({ ...addForm, allowAssociation: e.target.value === 'Yes' })}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </label>
                <label className="user-modal-field">
                  <span>Allow Dropdown amount</span>
                  <select
                    value={addForm.allowDropdownAmount ? 'Yes' : 'No'}
                    onChange={(e) => setAddForm({ ...addForm, allowDropdownAmount: e.target.value === 'Yes' })}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </label>
                <label className="user-modal-field">
                  <span>Allow Recurring Type</span>
                  <select
                    value={addForm.allowRecurringType ? 'Yes' : 'No'}
                    onChange={(e) => setAddForm({ ...addForm, allowRecurringType: e.target.value === 'Yes' })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label className="user-modal-field" style={{ gridColumn: 'span 2' }}>
                  <span>Recurring Intervals</span>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[
                      { label: 'One-Off', value: '0' },
                      { label: 'Monthly', value: '1' },
                      { label: 'Yearly', value: '2' },
                      { label: 'Daily', value: '3' }
                    ].map((opt) => (
                      <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="checkbox"
                          checked={addForm.recurringIntervals.includes(opt.value)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setAddForm((prev) => {
                              const current = new Set(prev.recurringIntervals);
                              if (checked) current.add(opt.value); else current.delete(opt.value);
                              const list = Array.from(current);
                              return { ...prev, recurringIntervals: list.length ? list : ['0'] };
                            });
                          }}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </label>
                <label className="user-modal-field">
                  <span>Appeal Country</span>
                  <select
                    value={addForm.appealCountry}
                    onChange={(e) => setAddForm({ ...addForm, appealCountry: e.target.value })}
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <label className="user-modal-field">
                  <span>Appeal Cause</span>
                  <input
                    type="text"
                    value={addForm.appealCause}
                    onChange={(e) => setAddForm({ ...addForm, appealCause: e.target.value })}
                  />
                </label>
                <label className="user-modal-field">
                  <span>Appeal Goal</span>
                  <input
                    type="number"
                    value={addForm.appealGoal}
                    onChange={(e) => setAddForm({ ...addForm, appealGoal: e.target.value })}
                  />
                </label>
                <label className="user-modal-field">
                  <span>Appeal Type</span>
                  <select
                    value={addForm.appealType}
                    onChange={(e) => setAddForm({ ...addForm, appealType: e.target.value })}
                  >
                    <option value="Suggested">Suggested</option>
                    <option value="Fixed">Fixed</option>
                    <option value="Open">Open</option>
                  </select>
                </label>
              </div>

              {formError && <div className="users-error">{formError}</div>}

              <div className="user-modal-actions">
                <button
                  type="button"
                  className="add-user-btn refresh-btn"
                  onClick={() => { setShowAddModal(false); setAddForm(defaultForm()); }}
                  disabled={addSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="add-user-btn" disabled={addSubmitting}>
                  {addSubmitting ? 'Adding...' : 'Add Appeal'}
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
              <h3>Edit Appeal</h3>
              <button className="user-modal-close" onClick={() => setShowEditModal(false)} aria-label="Close">
                ×
              </button>
            </div>
            <form className="user-modal-body" onSubmit={handleEditSubmit}>
              <div className="user-modal-grid">
                <label className="user-modal-field">
                  <span>Status</span>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </label>
                <label className="user-modal-field" style={{ gridColumn: 'span 2' }}>
                  <span>Appeal Name</span>
                  <input
                    type="text"
                    value={editForm.appealName}
                    onChange={(e) => setEditForm({ ...editForm, appealName: e.target.value })}
                    required
                  />
                </label>
                <label className="user-modal-field" style={{ gridColumn: 'span 2' }}>
                  <span>Description</span>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={2}
                    style={{ resize: 'vertical' }}
                  />
                </label>
                <label className="user-modal-field">
                  <span>Image</span>
                  <input
                    type="text"
                    value={editForm.image}
                    onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                    placeholder="Image URL or name"
                  />
                </label>
                <label className="user-modal-field">
                  <span>Category</span>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <label className="user-modal-field">
                  <span>Sort</span>
                  <input
                    type="number"
                    value={editForm.sort}
                    onChange={(e) => setEditForm({ ...editForm, sort: Number(e.target.value) || 0 })}
                  />
                </label>
                <label className="user-modal-field">
                  <span>On Home</span>
                  <select
                    value={editForm.onHome ? 'Yes' : 'No'}
                    onChange={(e) => setEditForm({ ...editForm, onHome: e.target.value === 'Yes' })}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </label>
                <label className="user-modal-field">
                  <span>On Footer</span>
                  <select
                    value={editForm.onFooter ? 'Yes' : 'No'}
                    onChange={(e) => setEditForm({ ...editForm, onFooter: e.target.value === 'Yes' })}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </label>
                <label className="user-modal-field">
                  <span>On Donate</span>
                  <select
                    value={editForm.onDonate ? 'Yes' : 'No'}
                    onChange={(e) => setEditForm({ ...editForm, onDonate: e.target.value === 'Yes' })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label className="user-modal-field">
                  <span>Allow Custom Amount</span>
                  <select
                    value={editForm.allowCustomAmount ? 'Yes' : 'No'}
                    onChange={(e) => setEditForm({ ...editForm, allowCustomAmount: e.target.value === 'Yes' })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label className="user-modal-field">
                  <span>Allow Quantity</span>
                  <select
                    value={editForm.allowQuantity ? 'Yes' : 'No'}
                    onChange={(e) => setEditForm({ ...editForm, allowQuantity: e.target.value === 'Yes' })}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </label>
                <label className="user-modal-field">
                  <span>Allow Association</span>
                  <select
                    value={editForm.allowAssociation ? 'Yes' : 'No'}
                    onChange={(e) => setEditForm({ ...editForm, allowAssociation: e.target.value === 'Yes' })}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </label>
                <label className="user-modal-field">
                  <span>Allow Dropdown amount</span>
                  <select
                    value={editForm.allowDropdownAmount ? 'Yes' : 'No'}
                    onChange={(e) => setEditForm({ ...editForm, allowDropdownAmount: e.target.value === 'Yes' })}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </label>
                <label className="user-modal-field">
                  <span>Allow Recurring Type</span>
                  <select
                    value={editForm.allowRecurringType ? 'Yes' : 'No'}
                    onChange={(e) => setEditForm({ ...editForm, allowRecurringType: e.target.value === 'Yes' })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label className="user-modal-field" style={{ gridColumn: 'span 2' }}>
                  <span>Recurring Intervals</span>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[
                      { label: 'One-Off', value: '0' },
                      { label: 'Monthly', value: '1' },
                      { label: 'Yearly', value: '2' },
                      { label: 'Daily', value: '3' }
                    ].map((opt) => (
                      <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="checkbox"
                          checked={editForm.recurringIntervals.includes(opt.value)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setEditForm((prev) => {
                              const current = new Set(prev.recurringIntervals);
                              if (checked) current.add(opt.value); else current.delete(opt.value);
                              const list = Array.from(current);
                              return { ...prev, recurringIntervals: list.length ? list : ['0'] };
                            });
                          }}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </label>
                <label className="user-modal-field">
                  <span>Appeal Country</span>
                  <select
                    value={editForm.appealCountry}
                    onChange={(e) => setEditForm({ ...editForm, appealCountry: e.target.value })}
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <label className="user-modal-field">
                  <span>Appeal Cause</span>
                  <input
                    type="text"
                    value={editForm.appealCause}
                    onChange={(e) => setEditForm({ ...editForm, appealCause: e.target.value })}
                  />
                </label>
                <label className="user-modal-field">
                  <span>Appeal Goal</span>
                  <input
                    type="number"
                    value={editForm.appealGoal}
                    onChange={(e) => setEditForm({ ...editForm, appealGoal: e.target.value })}
                  />
                </label>
                <label className="user-modal-field">
                  <span>Appeal Type</span>
                  <select
                    value={editForm.appealType}
                    onChange={(e) => setEditForm({ ...editForm, appealType: e.target.value })}
                  >
                    <option value="Suggested">Suggested</option>
                    <option value="Fixed">Fixed</option>
                    <option value="Open">Open</option>
                  </select>
                </label>
              </div>

              {formError && <div className="users-error">{formError}</div>}

              <div className="user-modal-actions">
                <button
                  type="button"
                  className="add-user-btn refresh-btn"
                  onClick={() => { setShowEditModal(false); setEditForm(defaultForm()); }}
                  disabled={editSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="add-user-btn" disabled={editSubmitting}>
                  {editSubmitting ? 'Updating...' : 'Update Appeal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appeal;
