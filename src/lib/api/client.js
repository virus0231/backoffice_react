// Modern API client with Bearer token authentication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8010/api/v1';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = this.getToken();
  }

  getToken() {
    return localStorage.getItem('auth_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('auth_token', token);
      this.token = token;
    } else {
      localStorage.removeItem('auth_token');
      this.token = null;
    }
  }

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

  async handleResponse(response) {
    const contentType = response.headers.get('content-type');

    if (contentType && (contentType.includes('application/octet-stream') || contentType.includes('text/csv') || contentType.includes('application/vnd'))) {
      return await response.blob();
    }

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          throw {
            status: 422,
            message: data.message || 'Validation failed',
            errors: data.errors,
          };
        }

        throw {
          status: response.status,
          message: data.message || data.error || 'API request failed',
          data,
        };
      }

      return data;
    }

    const text = await response.text();
    if (!response.ok) {
      throw {
        status: response.status,
        message: text || 'API request failed',
      };
    }

    return text;
  }

  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}/${endpoint}`);

    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async post(endpoint, data = {}, options = {}) {
    const url = `${this.baseURL}/${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(options.headers),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async put(endpoint, data = {}, options = {}) {
    const url = `${this.baseURL}/${endpoint}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(options.headers),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  async delete(endpoint, options = {}) {
    const url = `${this.baseURL}/${endpoint}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(options.headers),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

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

  getDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
}

const apiClient = new ApiClient();
export default apiClient;
