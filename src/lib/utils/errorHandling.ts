/**
 * Comprehensive error handling utilities
 */

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
  timestamp: Date;
}

export class APIError extends Error implements AppError {
  code?: string;
  status?: number;
  details?: any;
  timestamp: Date;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

export class ValidationError extends Error implements AppError {
  code: string = 'VALIDATION_ERROR';
  timestamp: Date;
  details?: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.timestamp = new Date();
  }
}

export class NetworkError extends Error implements AppError {
  code: string = 'NETWORK_ERROR';
  timestamp: Date;
  details?: any;

  constructor(message: string = 'Network connection failed', details?: any) {
    super(message);
    this.name = 'NetworkError';
    this.details = details;
    this.timestamp = new Date();
  }
}

/**
 * Enhanced fetch wrapper with comprehensive error handling
 */
export async function safeFetch(
  url: string,
  options?: RequestInit,
  retries: number = 3,
  timeout: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const fetchWithRetry = async (attemptNumber: number): Promise<Response> => {
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          `HTTP_${response.status}`,
          { url, status: response.status, statusText: response.statusText }
        );
      }

      return response;
    } catch (error) {
      if (attemptNumber < retries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attemptNumber) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(attemptNumber + 1);
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Failed to connect to server', { url, originalError: error.message });
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError('Request timeout', { url, timeout });
      }

      throw error;
    }
  };

  return fetchWithRetry(1);
}

/**
 * Parse API response with error handling
 */
export async function parseAPIResponse<T>(response: Response): Promise<T> {
  try {
    const text = await response.text();

    if (!text) {
      throw new APIError('Empty response from server', response.status);
    }

    const data = JSON.parse(text);

    // Handle PHP API error structure
    if (data.success === false) {
      throw new APIError(
        data.message || 'API request failed',
        response.status,
        data.code,
        data.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new APIError('Invalid JSON response from server', response.status, 'INVALID_JSON');
    }

    throw error;
  }
}

/**
 * Handle and format errors for display
 */
export function formatErrorForDisplay(error: unknown): { message: string; isRetriable: boolean } {
  if (error instanceof NetworkError) {
    return {
      message: 'Connection problem. Please check your internet connection and try again.',
      isRetriable: true
    };
  }

  if (error instanceof APIError) {
    if (error.status && error.status >= 500) {
      return {
        message: 'Server error. Please try again in a moment.',
        isRetriable: true
      };
    }

    if (error.status === 404) {
      return {
        message: 'The requested data was not found.',
        isRetriable: false
      };
    }

    if (error.status === 403) {
      return {
        message: 'Access denied. Please check your permissions.',
        isRetriable: false
      };
    }

    return {
      message: error.message || 'An error occurred while loading data.',
      isRetriable: error.status ? error.status >= 500 : true
    };
  }

  if (error instanceof ValidationError) {
    return {
      message: error.message,
      isRetriable: false
    };
  }

  return {
    message: 'An unexpected error occurred. Please try again.',
    isRetriable: true
  };
}

/**
 * Log errors to console in development or to monitoring service in production
 */
export function logError(error: unknown, context?: string) {
  const errorInfo = {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo);
  } else {
    // In production, send to analytics
    if (typeof window !== 'undefined') {
      import('../monitoring/analytics').then(({ trackError }) => {
        trackError('application_error', errorInfo);
      });
    }
    console.error('Production error:', errorInfo.message);
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      // Don't retry validation errors or 4xx errors
      if (error instanceof ValidationError ||
          (error instanceof APIError && error.status && error.status < 500 && error.status !== 429)) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}