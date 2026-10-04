/**
 * Centralized API service layer.
 * Backend: FastAPI running at http://localhost:8000
 */

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Predict CLV for a single customer via the real FastAPI backend.
 * @param {object} customerData - Raw form state
 * @returns {Promise<object>}
 */
export async function predictCLV(customerData) {
  const payload = {
    customer_id: customerData.customerId || `UI_${Date.now()}`,
    Age_Group:        customerData.ageGroup      || '25-34',
    Location:         customerData.location      || 'Urban',
    Platform:         customerData.platform      || 'Netflix',
    Plan:             customerData.plan          || 'Standard',
    Billing_Cycle:    customerData.billingCycle  || 'Monthly',
    Monthly_Fee:      parseFloat(customerData.fee)           || 0,
    Movies_Watched:   parseInt(customerData.movies, 10)      || 0,
    Watch_Hours:      parseFloat(customerData.watch)         || 0,
    Login_Days:       parseInt(customerData.login, 10)       || 0,
    Last_Active_Days: parseInt(customerData.lastActive, 10)  || 0,
    Renewals:         parseInt(customerData.renewals, 10)    || 0,
    Upgrades:         parseInt(customerData.upgrades, 10)    || 0,
    Downgrades:       parseInt(customerData.downgrades, 10)  || 0,
    Payment_Failures: parseInt(customerData.paymentFailures, 10) || 0,
    Discount:         parseFloat(customerData.discount)      || 0,
    Support_Tickets:  parseInt(customerData.supportTickets, 10)  || 0,
    Churn:            parseInt(customerData.churn, 10),
    Lifetime_Months:  parseFloat(customerData.lifetimeMonths),
  };

  const response = await fetch(`${API_BASE}/api/predict-clv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 422) {
      const msg = Array.isArray(err.detail) ? err.detail.map(d => `${d.loc?.join('->')}: ${d.msg}`).join(', ') : err.detail;
      throw new Error(`Validation Error: ${msg || 'Invalid input fields'}`);
    }
    throw new Error(err.detail || `Server error: ${response.status}`);
  }

  const data = await response.json();
  return {
    predictedCLV:   data.predicted_clv,
    predicted6mCLV: data.predicted_6m_clv,
    predicted12mCLV: data.predicted_12m_clv,
    modelVersion:   data.model_version,
    customerId:     data.customer_id,
    isLive:         true,
  };
}

/**
 * Fetch model performance metrics from the backend.
 * @returns {Promise<object>}
 */
export async function fetchModelPerformance() {
  const response = await fetch(`${API_BASE}/api/model/performance`);
  if (!response.ok) throw new Error('Failed to fetch model performance');
  return response.json();
}

/**
 * Fetch model status from backend.
 * @returns {Promise<object>}
 */
export async function fetchModelStatus() {
  const response = await fetch(`${API_BASE}/api/model/status`);
  if (!response.ok) throw new Error('Failed to fetch model status');
  return response.json();
}

/**
 * Fetch feature importance metrics from backend.
 * @returns {Promise<Array>}
 */
export async function fetchFeatureImportance() {
  const response = await fetch(`${API_BASE}/api/model/feature-importance`);
  if (!response.ok) throw new Error('Failed to fetch feature importance');
  return response.json();
}

/**
 * Fetch backend health status.
 * @returns {Promise<object>}
 */
export async function fetchHealth() {
  const response = await fetch(`${API_BASE}/api/health`);
  if (!response.ok) throw new Error('Backend is not reachable');
  return response.json();
}

/**
 * Fetch prediction history.
 * @param {number} skip
 * @param {number} limit
 * @returns {Promise<object>}
 */
export async function fetchPredictionHistory(skip = 0, limit = 50) {
  const response = await fetch(`${API_BASE}/api/predictions/history?skip=${skip}&limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch prediction history');
  return response.json();
}

/**
 * Fetch analytics summary.
 * @returns {Promise<object>}
 */
export async function fetchAnalyticsSummary() {
  const response = await fetch(`${API_BASE}/api/analytics/summary`);
  if (!response.ok) throw new Error('Failed to fetch analytics summary');
  return response.json();
}

/**
 * Fetch platform comparison analytics.
 * @returns {Promise<Array>}
 */
export async function fetchPlatformComparison() {
  const response = await fetch(`${API_BASE}/api/analytics/platform-comparison`);
  if (!response.ok) throw new Error('Failed to fetch platform comparison');
  return response.json();
}

/**
 * Fetch CLV distribution histogram.
 * @returns {Promise<Array>}
 */
export async function fetchCLVDistribution() {
  const response = await fetch(`${API_BASE}/api/analytics/clv-distribution`);
  if (!response.ok) throw new Error('Failed to fetch CLV distribution');
  return response.json();
}

/**
 * Fetch CLV by plan.
 * @returns {Promise<Array>}
 */
export async function fetchCLVByPlan() {
  const response = await fetch(`${API_BASE}/api/analytics/clv-by-plan`);
  if (!response.ok) throw new Error('Failed to fetch CLV by plan');
  return response.json();
}

/**
 * Fetch customer list.
 */
export async function fetchCustomers(skip = 0, limit = 50, platform = '') {
  let url = `${API_BASE}/api/customers?skip=${skip}&limit=${limit}`;
  if (platform) url += `&platform=${encodeURIComponent(platform)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch customers');
  return response.json();
}

/**
 * Fetch customer details by ID.
 */
export async function fetchCustomerById(customerId) {
  const response = await fetch(`${API_BASE}/api/customers/${encodeURIComponent(customerId)}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Customer fetch error: ${response.status}`);
  }
  return response.json();
}

/**
 * Upload CSV file for batch CLV prediction.
 * @param {File} file
 * @returns {Promise<Blob>}
 */
export async function predictBatchCSV(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE}/api/predict-batch`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 422) {
      const msg = Array.isArray(err.detail) ? err.detail.map(d => d.msg).join(', ') : err.detail;
      throw new Error(`Batch CSV Validation Error: ${msg || 'Invalid file or schema'}`);
    }
    throw new Error(err.detail || `Batch prediction failed: ${response.status}`);
  }

  return response.blob();
}
