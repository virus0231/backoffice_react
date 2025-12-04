import { useState, useEffect } from "react";
import { useToast } from "../../ToastContainer";
import apiClient from "@/lib/api/client";
import "./Amount.css";

const Amount = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [appeals, setAppeals] = useState([]);
  const [funds, setFunds] = useState([]);
  const [selectedAppeal, setSelectedAppeal] = useState("");
  const [amountRows, setAmountRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appealsLoading, setAppealsLoading] = useState(true);
  const [fundsLoading, setFundsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch appeals on mount
  useEffect(() => {
    fetchAppeals();
  }, []);

  // Fetch amounts and funds when appeal is selected
  useEffect(() => {
    if (selectedAppeal) {
      fetchAmounts(selectedAppeal);
      fetchFunds(selectedAppeal);
    } else {
      setAmountRows([]);
      setFunds([]);
    }
  }, [selectedAppeal]);

  const fetchAppeals = async () => {
    try {
      setAppealsLoading(true);
      const result = await apiClient.get("filters/appeals");

      if (result.success && result.data) {
        setAppeals(result.data);
      }
    } catch (err) {
      console.error("Error fetching appeals:", err);
      showError("Failed to load appeals");
    } finally {
      setAppealsLoading(false);
    }
  };

  const fetchFunds = async (appealId) => {
    try {
      setFundsLoading(true);
      const result = await apiClient.get("funds/list", { appeal_id: appealId });

      if (result.success && result.data) {
        setFunds(result.data);
      }
    } catch (err) {
      console.error("Error fetching funds:", err);
      showError("Failed to load funds");
    } finally {
      setFundsLoading(false);
    }
  };

  const fetchAmounts = async (appealId) => {
    try {
      setLoading(true);
      const result = await apiClient.get("amounts", { appeal_id: appealId });

      if (result.success && result.data) {
        if (result.data.length === 0) {
          // No amounts yet, start with one empty row
          setAmountRows([
            {
              id: null,
              name: "",
              amount: "",
              sort: 1,
              donationtype: "",
              fundlist_id: "",
              status: true,
            },
          ]);
        } else {
          // Convert string status to boolean for easier handling
          const normalizedData = result.data.map((row) => ({
            ...row,
            status: row.status === "enabled" || row.status === true,
          }));
          setAmountRows(normalizedData);
        }
      }
    } catch (err) {
      console.error("Error fetching amounts:", err);
      showError("Failed to load amounts");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    const newRow = {
      id: null,
      name: "",
      amount: "",
      sort: amountRows.length + 1,
      donationtype: "",
      fundlist_id: "",
      status: true,
    };
    setAmountRows([...amountRows, newRow]);
  };

  const handleRemoveRow = (index) => {
    if (amountRows.length > 1) {
      setAmountRows(amountRows.filter((_, i) => i !== index));
    }
  };

  const handleRowChange = (index, field, value) => {
    setAmountRows(
      amountRows.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  };

  const handleUpdateAmount = async () => {
    if (!selectedAppeal) {
      showWarning("Please select an appeal first");
      return;
    }

    // Validate rows
    const validRows = amountRows.filter((row) => row.name.trim() && row.amount);
    if (validRows.length === 0) {
      showWarning("Please add at least one amount with name and value");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        appeal_id: Number(selectedAppeal),
        amounts: validRows.map((row) => ({
          id: row.id,
          name: row.name,
          amount: row.amount,
          sort: row.sort || 0,
          donationtype: row.donationtype || "",
          fundlist_id: row.fundlist_id ? Number(row.fundlist_id) : null,
          status: row.status ? "enabled" : "disabled",
        })),
      };

      const result = await apiClient.post("amounts/bulk", payload);

      if (result.success) {
        showSuccess("Amounts updated successfully!");
        fetchAmounts(selectedAppeal);
      } else {
        showError(
          "Failed to update amounts: " + (result.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error updating amounts:", error);

      // Handle validation errors (422)
      if (error.status === 422 && error.errors) {
        const errorMessages = Object.values(error.errors).flat();
        errorMessages.forEach((msg) => showError(msg));
      } else if (error.message) {
        showError(error.message);
      } else {
        showError("An error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="amount-page">
      <div className="amount-header">
        <h1 className="amount-title">Amount List</h1>
      </div>

      <div className="amount-content">
        <div className="appeal-selector-card">
          <label className="appeal-label">Select Appeal</label>
          <select
            value={selectedAppeal}
            onChange={(e) => setSelectedAppeal(e.target.value)}
            className="appeal-select"
            disabled={appealsLoading}
          >
            <option value="">
              {appealsLoading
                ? "Loading appeals..."
                : "Select an appeal to manage amounts"}
            </option>
            {appeals.map((appeal) => (
              <option key={appeal.id} value={appeal.id}>
                {appeal.appeal_name}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading amounts...</p>
          </div>
        )}

        {!selectedAppeal && !loading && (
          <div className="empty-state">
            <svg
              className="empty-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <h3>No Appeal Selected</h3>
            <p>
              Please select an appeal from the dropdown above to manage donation
              amounts
            </p>
          </div>
        )}

        {selectedAppeal && !loading && (
          <>
            <div className="table-container">
              <table className="amount-table">
                <thead>
                  <tr>
                    <th>Donation Name</th>
                    <th>Amount</th>
                    <th>Sort</th>
                    <th>Fixed Type</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {amountRows.map((row, index) => (
                    <tr key={row.id || `new-${index}`}>
                      <td>
                        <input
                          type="text"
                          placeholder="$5"
                          value={row.name || ""}
                          onChange={(e) =>
                            handleRowChange(index, "name", e.target.value)
                          }
                          className="table-input"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="0"
                          value={row.amount || ""}
                          onChange={(e) =>
                            handleRowChange(index, "amount", e.target.value)
                          }
                          className="table-input"
                          min="0"
                          step="0.01"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="0"
                          value={row.sort || ""}
                          onChange={(e) =>
                            handleRowChange(index, "sort", e.target.value)
                          }
                          className="table-input sort-input"
                          min="0"
                        />
                      </td>
                      <td>
                        <select
                          value={row.donationtype || ""}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "donationtype",
                              e.target.value
                            )
                          }
                          className="table-select"
                        >
                          <option value="">Donation Type</option>
                          <option value="MONTHLY">Monthly</option>
                          <option value="YEARLY">Yearly</option>
                          <option value="DAILY">Daily</option>
                        </select>
                      </td>
                      <td>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={
                              row.status === true || row.status === "enabled"
                            }
                            onChange={(e) =>
                              handleRowChange(index, "status", e.target.checked)
                            }
                          />
                          <span className="toggle-slider"></span>
                          <span className="toggle-label">
                            {row.status === true || row.status === "enabled"
                              ? "Enable"
                              : "Disable"}
                          </span>
                        </label>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn add-btn"
                            onClick={handleAddRow}
                            type="button"
                            title="Add new row"
                          >
                            <svg
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                          <button
                            className="action-btn remove-btn"
                            onClick={() => handleRemoveRow(index)}
                            disabled={amountRows.length === 1}
                            type="button"
                            title="Remove row"
                          >
                            <svg
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="form-footer">
              <div className="footer-info">
                <p>
                  {amountRows.length} donation{" "}
                  {amountRows.length === 1 ? "amount" : "amounts"}
                </p>
              </div>
              <button
                className="update-btn"
                onClick={handleUpdateAmount}
                disabled={submitting}
                type="button"
              >
                {submitting ? (
                  <>
                    <span className="btn-spinner"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Amount;
