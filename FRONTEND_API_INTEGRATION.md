# Frontend API Integration - Codex Execution Prompt

## Objective
Update the React frontend to connect to the refactored Laravel 12 API with Sanctum authentication, replacing the old FormData-based API calls with modern JSON+Bearer token requests.

---

## Current Frontend Stack Analysis

**Frontend**: React 19 + Vite + TypeScript/JavaScript (mixed)
**State Management**: Zustand
**Routing**: React Router v6
**Styling**: Tailwind CSS v4
**Charts**: Recharts

**Current API Setup**:
- Base: `src/utils/api.js`
- Uses FormData for ALL requests
- No authentication headers
- Session-based (cookies)

**Backend**: Laravel 12 with Sanctum Bearer tokens

---

## PHASE 1: Update API Client (Priority: CRITICAL)

### 1. Create Modern API Client

**File**: `src/lib/api/client.js`

```javascript
// Modern API client with Bearer token authentication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8010/api/v1';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = this.getToken();
  }

  /**
   * Get stored authentication token
   */
  getToken() {
    return localStorage.getItem('auth_token');
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    if (token) {
      localStorage.setItem('auth_token', token);
      this.token = token;
    } else {
      localStorage.removeItem('auth_token');
      this.token = null;
    }
  }

  /**
   * Get default headers
   */
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');

    // Handle blob responses (file downloads)
    if (contentType && contentType.includes('application/octet-stream')) {
      return await response.blob();
    }

    // Handle JSON responses
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors (422)
        if (response.status === 422 && data.errors) {
          throw {
            status: 422,
            message: data.message || 'Validation failed',
            errors: data.errors,
          };
        }

        // Handle other errors
        throw {
          status: response.status,
          message: data.message || data.error || 'API request failed',
          data,
        };
      }

      return data;
    }

    // Handle text responses
    const text = await response.text();
    if (!response.ok) {
      throw {
        status: response.status,
        message: text || 'API request failed',
      };
    }

    return text;
  }

  /**
   * Make GET request
   */
  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}/${endpoint}`);

    // Add query parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  /**
   * Make POST request
   */
  async post(endpoint, data = {}, options = {}) {
    const url = `${this.baseURL}/${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(options.headers),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  /**
   * Make PUT request
   */
  async put(endpoint, data = {}, options = {}) {
    const url = `${this.baseURL}/${endpoint}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(options.headers),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  /**
   * Make DELETE request
   */
  async delete(endpoint, options = {}) {
    const url = `${this.baseURL}/${endpoint}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(options.headers),
    });

    return this.handleResponse(response);
  }

  /**
   * Download file from blob response
   */
  downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Get current date string for file naming
   */
  getDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;
```

### 2. Update Environment Variables

**File**: `.env.local`

```env
VITE_API_BASE_URL=http://127.0.0.1:8010/api/v1
```

---

## PHASE 2: Update Authentication (Priority: CRITICAL)

### 3. Update AuthContext with Sanctum

**File**: `src/context/AuthContext.jsx`

Update the authentication context to use Bearer tokens:

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../lib/api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = apiClient.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token is still valid
      const response = await apiClient.post('auth/status');
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        // Token invalid, clear it
        apiClient.setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      apiClient.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiClient.post('auth/login', {
        email,
        password,
      });

      if (response.success && response.token) {
        apiClient.setToken(response.token);
        setUser(response.user);
        return { success: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      apiClient.setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## PHASE 3: Update Login Component

### 4. Update Login Component

**File**: `src/components/Login.jsx`

Update to use the new AuthContext:

```javascript
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { login, isAuthenticated, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    const result = await login(email, password);

    if (!result.success) {
      setLocalError(result.message);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {localError && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{localError}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
```

---

## PHASE 4: Update Data Fetching Hooks

### 5. Example: Update useMonitoringData Hook

**File**: `src/hooks/useMonitoringData.ts` (or `.js`)

Replace old API calls with new client:

```javascript
import { useState, useEffect } from 'react';
import apiClient from '../lib/api/client';

export const useMonitoringData = (startDate, endDate, selectedFilters) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = {
          startDate,
          endDate,
          kind: 'totalDonations', // or whatever kind you need
          ...selectedFilters,
        };

        // Make API call using new client
        const response = await apiClient.get('analytics', params);

        if (response.success) {
          setData(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch data');
        }
      } catch (err) {
        console.error('Failed to fetch monitoring data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate, selectedFilters]);

  return { data, loading, error };
};
```

### 6. Pattern for All Other Hooks

Apply the same pattern to ALL hooks in `src/hooks/`:
- `useRevenueData.ts`
- `useRecurringPlansData.ts`
- `useRecurringRevenueData.ts`
- `usePaymentMethodsData.ts`
- `useCountriesData.ts`
- `useFrequenciesData.ts`
- `useDayTimeData.ts`
- `useRetentionData.ts`
- `useCampaignsData.ts`
- etc.

**Pattern**:
1. Import `apiClient` from `../lib/api/client`
2. Replace `API.post()` with `apiClient.get()` or `apiClient.post()`
3. Remove FormData, use plain objects
4. Update response handling (response.success, response.data)

---

## PHASE 5: Update Page Components

### 7. Update All Page Components in `src/components/dashboard/pages/`

For each page component that makes API calls:

**Example - Category.jsx**:

```javascript
import { useState, useEffect } from 'react';
import apiClient from '../../../lib/api/client';

function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('categories');

      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      const response = await apiClient.post('categories', formData);

      if (response.success) {
        fetchCategories(); // Refresh list
        // Show success message
      }
    } catch (err) {
      console.error('Failed to create category:', err);
      // Show error message
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      const response = await apiClient.put(`categories/${id}`, formData);

      if (response.success) {
        fetchCategories(); // Refresh list
        // Show success message
      }
    } catch (err) {
      console.error('Failed to update category:', err);
      // Show error message
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await apiClient.delete(`categories/${id}`);

      if (response.success) {
        fetchCategories(); // Refresh list
        // Show success message
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
      // Show error message
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}

export default Category;
```

Apply this pattern to:
- `Causes.jsx`
- `Appeal.jsx`
- `Amount.jsx`
- `FundList.jsx`
- `Category.jsx`
- `Country.jsx`
- `Users.jsx`
- `Donors.jsx`
- `Schedule.jsx`
- `Configuration.jsx`
- All report pages

---

## PHASE 6: Update Exports/Downloads

### 8. Update Export Functionality

For pages that export data (like DonationsReport):

```javascript
const handleExport = async () => {
  try {
    const params = {
      startDate,
      endDate,
      format: 'excel', // or 'csv'
      ...filters,
    };

    const blob = await apiClient.post('reports/donations/export', params);
    const filename = `donations_${apiClient.getDateString()}.xlsx`;
    apiClient.downloadFile(blob, filename);
  } catch (err) {
    console.error('Export failed:', err);
    // Show error message
  }
};
```

---

## PHASE 7: Configure CORS (Backend)

### 9. Update Laravel CORS Configuration

**File**: `laravel-api/config/cors.php`

Ensure CORS is configured for the React frontend:

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173', // Vite dev server
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1 - API Client:
- [ ] Create `src/lib/api/client.js` with modern API client
- [ ] Update `.env.local` with correct API URL
- [ ] Test basic API connection

### Phase 2 - Authentication:
- [ ] Update `src/context/AuthContext.jsx` with Bearer token auth
- [ ] Test login/logout flow
- [ ] Verify token storage in localStorage

### Phase 3 - Login:
- [ ] Update `src/components/Login.jsx`
- [ ] Test login with valid/invalid credentials
- [ ] Test redirect after login

### Phase 4 - Data Hooks:
- [ ] Update all hooks in `src/hooks/`
- [ ] Replace FormData with JSON
- [ ] Update all API endpoint calls

### Phase 5 - Page Components:
- [ ] Update all page components in `src/components/dashboard/pages/`
- [ ] Replace old API calls with new client
- [ ] Test CRUD operations for each page

### Phase 6 - Exports:
- [ ] Update export functionality in report pages
- [ ] Test file downloads

### Phase 7 - CORS:
- [ ] Update Laravel CORS config
- [ ] Test cross-origin requests

---

## TESTING CHECKLIST

After implementation, test:

1. **Authentication**:
   - [ ] Login with valid credentials
   - [ ] Login with invalid credentials
   - [ ] Logout
   - [ ] Token persistence (refresh page)
   - [ ] Protected route access

2. **Data Fetching**:
   - [ ] Dashboard loads with data
   - [ ] Analytics pages load
   - [ ] Reports load
   - [ ] Filters work correctly

3. **CRUD Operations**:
   - [ ] Create new categories/countries/appeals
   - [ ] Update existing records
   - [ ] Delete records
   - [ ] Validation errors display properly

4. **Exports**:
   - [ ] Download donations report
   - [ ] Download other reports
   - [ ] Files are properly formatted

5. **Error Handling**:
   - [ ] 401 Unauthorized redirects to login
   - [ ] 422 Validation errors display
   - [ ] 500 Server errors show user-friendly message
   - [ ] Network errors handled gracefully

---

## IMPORTANT NOTES

1. **Token Storage**: Using localStorage (not sessionStorage) for persistence
2. **All requests use JSON**: No more FormData
3. **Bearer token in header**: `Authorization: Bearer {token}`
4. **Response format**: All Laravel responses follow `{success, data, message}` pattern
5. **Error handling**: 422 for validation, 401 for auth, 404 for not found
6. **CORS**: Must be configured on Laravel side
7. **Vite proxy**: Can optionally use Vite proxy instead of CORS

---

## OPTIONAL: Vite Proxy Configuration

**File**: `vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8010',
        changeOrigin: true,
      },
    },
  },
});
```

Then set `.env.local`:
```env
VITE_API_BASE_URL=/api/v1
```

This avoids CORS issues during development.
