// API utility for the Laravel backoffice API
// Configure base via VITE_API_BASE_URL (e.g., http://127.0.0.1:8000/api/v1)
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api/v1' : 'https://forgottenwomen.youronlineconversation.com/api/v1');

class API {
  /**
   * Make a POST request to the backoffice
   * @param {string} endpoint - Relative path, e.g., 'reports/campaigns'
   * @param {Object} data - Form data to send
   * @param {Object} options - Additional options (responseType, etc.)
   * @returns {Promise} - Response data
   */
  static async post(endpoint, data = {}, options = {}) {
    try {
      const formData = new FormData();

      // Append all data to FormData
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });

      const url = `${BASE_URL}/${endpoint}`;

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include', // Important for session cookies
        mode: 'cors', // Enable CORS
        ...options.fetchOptions
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle different response types
      if (options.responseType === 'blob') {
        return await response.blob();
      } else if (options.responseType === 'text') {
        return await response.text();
      } else {
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }
    } catch (error) {
      console.error('API Error:', error.message);
      throw error;
    }
  }

  /**
   * Download a file from blob response
   * @param {Blob} blob - The blob data
   * @param {string} filename - Name for the downloaded file
   */
  static downloadFile(blob, filename) {
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
   * @returns {string} - Formatted date string
   */
  static getDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
}

export default API;
