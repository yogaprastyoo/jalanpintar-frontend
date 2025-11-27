/**
 * HTTP Client
 * Centralized HTTP wrapper dengan automatic token injection dan error handling
 * 
 * Features:
 * - Automatic Bearer token injection
 * - Retry mechanism dengan exponential backoff
 * - Request/response interceptors
 * - Automatic JSON parsing
 * - FormData support
 */

import logger from '@/lib/logger';
import TokenService from './TokenService';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const MAX_RETRIES = parseInt(import.meta.env.VITE_API_MAX_RETRIES || '3', 10);
const INITIAL_RETRY_DELAY = parseInt(import.meta.env.VITE_API_RETRY_DELAY || '1000', 10);

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch wrapper with retry logic for network errors
 */
const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const isNetworkError = error.message?.includes('fetch') || 
                            error.message?.includes('network') ||
                            error.name === 'TypeError';

      if (isNetworkError && !isLastAttempt) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        logger.warn(`🔄 Network error, retrying in ${delay}ms (attempt ${attempt + 1}/${retries + 1})...`);
        await sleep(delay);
        continue;
      }

      throw error;
    }
  }
};

/**
 * HTTP Client Class
 */
class HttpClient {
  constructor(baseURL = API_BASE) {
    this.baseURL = baseURL;
  }

  /**
   * Build full URL from endpoint
   */
  buildURL(endpoint) {
    return endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
  }

  /**
   * Prepare request headers
   */
  prepareHeaders(options = {}, requireAuth = true) {
    const isFormData = options.body instanceof FormData;
    
    const headers = {
      'Accept': 'application/json',
      ...options.headers,
    };

    // Don't set Content-Type for FormData (browser will set with boundary)
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Add authorization header if required
    if (requireAuth) {
      const accessToken = TokenService.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    return headers;
  }

  /**
   * Core request method
   */
  async request(endpoint, options = {}, requireAuth = true) {
    const url = this.buildURL(endpoint);
    const headers = this.prepareHeaders(options, requireAuth);

    const requestOptions = {
      ...options,
      headers,
      credentials: 'include', // Always include cookies for refresh_token
    };

    logger.debug('HttpClient', `${options.method || 'GET'} ${endpoint}`);

    try {
      const response = await fetchWithRetry(url, requestOptions);
      logger.debug('HttpClient', `Response status: ${response.status}`);
      return response;
    } catch (error) {
      logger.error('HttpClient', `Request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle response and parse JSON
   */
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `HTTP ${response.status}: ${response.statusText}` 
      }));
      throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    const response = await this.request(endpoint, {
      ...options,
      method: 'GET',
    });
    return this.handleResponse(response);
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}, options = {}) {
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : JSON.stringify(data);

    const response = await this.request(endpoint, {
      ...options,
      method: 'POST',
      body,
    });
    return this.handleResponse(response);
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}, options = {}) {
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : JSON.stringify(data);

    const response = await this.request(endpoint, {
      ...options,
      method: 'PUT',
      body,
    });
    return this.handleResponse(response);
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data = {}, options = {}) {
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : JSON.stringify(data);

    const response = await this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body,
    });
    return this.handleResponse(response);
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    const response = await this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
    return this.handleResponse(response);
  }

  /**
   * Public GET (no auth required)
   */
  async publicGet(endpoint, options = {}) {
    const response = await this.request(endpoint, {
      ...options,
      method: 'GET',
    }, false);
    return this.handleResponse(response);
  }

  /**
   * Public POST (no auth required)
   */
  async publicPost(endpoint, data = {}, options = {}) {
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : JSON.stringify(data);

    const response = await this.request(endpoint, {
      ...options,
      method: 'POST',
      body,
    }, false);
    return this.handleResponse(response);
  }
}

// Export singleton instance
export const httpClient = new HttpClient();
export default httpClient;
