/**
 * API Client for Laravel Sanctum Token-Based Authentication
 * 
 * Features:
 * - Automatic access token injection
 * - Auto-refresh on 401 with refresh token
 * - Token storage in localStorage
 * - Request/response interceptors
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const LOGIN_ENDPOINT = import.meta.env.VITE_API_LOGIN || '/login';
const REGISTER_ENDPOINT = import.meta.env.VITE_API_REGISTER || '/register';
const REFRESH_ENDPOINT = import.meta.env.VITE_API_REFRESH || '/refresh';
const LOGOUT_ENDPOINT = import.meta.env.VITE_API_LOGOUT || '/logout';

// Token storage keys
const ACCESS_TOKEN_KEY = 'smartpath_access_token';
const REFRESH_TOKEN_KEY = 'smartpath_refresh_token';
const USER_DATA_KEY = 'smartpath_user_data';

/**
 * Cookie helper functions
 */
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/**
 * Get stored access token (from localStorage)
 */
export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get stored refresh token (from cookies for security)
 */
export const getRefreshToken = () => {
  // Try cookies first (more secure)
  const cookieToken = getCookie(REFRESH_TOKEN_KEY);
  if (cookieToken) return cookieToken;
  
  // Fallback to localStorage for backward compatibility
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Store tokens
 * - Access token in localStorage (short-lived, needs JS access)
 * - Refresh token in httpOnly-style cookie (long-lived, more secure)
 * - User data in localStorage (for role checking)
 */
export const setTokens = (accessToken, refreshToken, userData = null) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
  
  if (refreshToken) {
    // Store in cookie (7 days expiry)
    setCookie(REFRESH_TOKEN_KEY, refreshToken, 7);
    
    // Also store in localStorage as fallback
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  
  if (userData) {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  }
};

/**
 * Get stored user data
 */
export const getUserData = () => {
  const data = localStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
};

/**
 * Get user role
 * Default to 'user' if role is null/undefined (for newly registered users)
 */
export const getUserRole = () => {
  const userData = getUserData();
  // If role is null or undefined, default to 'user'
  // Backend should set proper role, but this is a fallback
  return userData?.role || 'user';
};

/**
 * Check if user is admin
 */
export const isAdmin = () => {
  return getUserRole() === 'admin';
};

/**
 * Clear all tokens (on logout or auth failure)
 */
export const clearTokens = () => {
  // Clear localStorage
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  
  // Clear cookies
  deleteCookie(REFRESH_TOKEN_KEY);
};

/**
 * Check if user is authenticated (has access token)
 * Note: Only check access token, as backend may not return refresh token
 */
export const isAuthenticated = () => {
  const accessToken = getAccessToken();
  const hasToken = !!accessToken && accessToken !== 'temp_missing';
  console.log('🔐 isAuthenticated check:', hasToken, '| Token:', accessToken ? 'Present' : 'Missing');
  return hasToken;
};

/**
 * Refresh access token using refresh token
 * Returns new access token or throws error
 */
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  
  // TEMPORARY: If backend didn't provide refresh_token, redirect to login
  if (!refreshToken || refreshToken === 'temp_missing') {
    console.warn('⚠️ Cannot refresh token - backend did not provide refresh_token');
    console.warn('🔄 Access token expired - redirecting to login...');
    clearTokens();
    window.location.href = '/login';
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_BASE}${REFRESH_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Refresh token expired or invalid');
    }

    const data = await response.json();
    
    // Laravel Sanctum typically returns: { access_token, refresh_token }
    const newAccessToken = data.access_token || data.token;
    const newRefreshToken = data.refresh_token;

    if (!newAccessToken) {
      throw new Error('No access token in refresh response');
    }

    setTokens(newAccessToken, newRefreshToken || refreshToken);
    return newAccessToken;
  } catch (error) {
    clearTokens();
    window.location.href = '/login';
    throw error;
  }
};

/**
 * Login with credentials
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} User data and tokens
 */
export const login = async (email, password) => {
  console.log('📡 Login request to:', `${API_BASE}${LOGIN_ENDPOINT}`);
  
  const response = await fetch(`${API_BASE}${LOGIN_ENDPOINT}`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  console.log('📨 Login response status:', response.status);
  console.log('📨 Login response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    let errorMessage = 'Login failed';
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || JSON.stringify(error);
    } catch (e) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    console.error('❌ Login error:', errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log('✅ Login data received:', data);
  
  // Store tokens with security best practices:
  // - Access token in localStorage (short-lived, needs JS access for API calls)
  // - Refresh token in cookie (long-lived, more secure from XSS)
  const accessToken = data.access_token || data.token;
  const refreshToken = data.refresh_token;
  
  console.log('🔑 Access token:', accessToken ? 'Present' : 'Missing');
  console.log('🔄 Refresh token:', refreshToken ? 'Present' : 'Missing');
  
  // TEMPORARY WORKAROUND: Save access_token even without refresh_token
  // Backend needs to return refresh_token for proper token rotation
  if (accessToken) {
    setTokens(accessToken, refreshToken || 'temp_missing', data.user);
    if (!refreshToken) {
      console.warn('⚠️ Backend is not returning refresh_token - using temporary workaround');
      console.warn('⚠️ Token refresh will redirect to login when access_token expires');
    } else {
      console.log('💾 Access token saved to localStorage');
      console.log('🍪 Refresh token saved to cookie');
      console.log('👤 User data saved:', data.user?.email, 'Role:', data.user?.role);
    }
  } else {
    console.error('❌ No access_token in response!');
    console.warn('Response structure:', Object.keys(data));
  }

  return data;
};

/**
 * Register new user
 * @param {Object} userData - Registration data (name, email, password, etc.)
 * @returns {Promise<Object>} User data and tokens
 */
export const register = async (userData) => {
  const response = await fetch(`${API_BASE}${REGISTER_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  const data = await response.json();
  
  // Store tokens (same as login - you get tokens immediately)
  const accessToken = data.access_token || data.token;
  const refreshToken = data.refresh_token;
  
  // TEMPORARY WORKAROUND: Same as login
  if (accessToken) {
    setTokens(accessToken, refreshToken || 'temp_missing', data.user);
    if (!refreshToken) {
      console.warn('⚠️ Backend is not returning refresh_token on registration');
    } else {
      console.log('👤 New user registered:', data.user?.email, 'Role:', data.user?.role);
    }
  }

  return data;
};

/**
 * Logout and clear tokens
 */
export const logout = async () => {
  const accessToken = getAccessToken();
  
  if (accessToken) {
    try {
      await fetch(`${API_BASE}${LOGOUT_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    }
  }
  
  clearTokens();
};

// Flag to prevent multiple concurrent refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Main API fetch wrapper with automatic token refresh
 * @param {string} endpoint - API endpoint (e.g., 'forms')
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @param {boolean} requireAuth - Whether this request requires authentication
 * @returns {Promise<Response>}
 */
export const apiFetch = async (endpoint, options = {}, requireAuth = true) => {
  const makeRequest = async (token) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const isFormData = options.body instanceof FormData;

    const headers = {
      'Accept': 'application/json',
      ...options.headers,
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (requireAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, { ...options, headers });
  };

  let accessToken = getAccessToken();
  
  // Check if user is authenticated when auth is required
  if (requireAuth && !accessToken) {
    console.warn('⚠️ No access token found for authenticated request');
    throw new Error('Authentication required. Please login again.');
  }

  console.log(`🔄 Making ${options.method || 'GET'} request to ${endpoint}`);
  if (requireAuth) {
    console.log('🔑 Using access token:', accessToken ? 'Present' : 'Missing');
  }
  
  let response = await makeRequest(accessToken);
  console.log(`📡 Response status: ${response.status}`);

  if (response.status === 401 && requireAuth && getRefreshToken()) {
    console.log('🔄 Token expired, attempting refresh...');
    
    if (isRefreshing) {
      console.log('⏳ Already refreshing, queuing request...');
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (newAccessToken) => {
            console.log('🔄 Retrying queued request with new token...');
            makeRequest(newAccessToken).then(res => resolve(res)).catch(reject);
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const newAccessToken = await refreshAccessToken();
      console.log('✅ Token refreshed successfully');
      processQueue(null, newAccessToken);
      response = await makeRequest(newAccessToken); // Retry the original request
      console.log(`📡 Retry response status: ${response.status}`);
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      processQueue(error, null);
      clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    } finally {
      isRefreshing = false;
    }
  }

  return response;
};

/**
 * Convenience methods for common HTTP verbs
 */

export const api = {
  /**
   * GET request
   */
  get: async (endpoint, options = {}) => {
    const response = await apiFetch(endpoint, {
      ...options,
      method: 'GET',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `GET ${endpoint} failed`);
    }
    
    return response.json();
  },

  /**
   * POST request
   */
  post: async (endpoint, data = {}, options = {}) => {
    const response = await apiFetch(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `POST ${endpoint} failed`);
    }
    
    return response.json();
  },

  /**
   * PUT request
   */
  put: async (endpoint, data = {}, options = {}) => {
    const response = await apiFetch(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `PUT ${endpoint} failed`);
    }
    
    return response.json();
  },

  /**
   * PATCH request
   */
  patch: async (endpoint, data = {}, options = {}) => {
    const response = await apiFetch(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `PATCH ${endpoint} failed`);
    }
    
    return response.json();
  },

  /**
   * DELETE request
   */
  delete: async (endpoint, options = {}) => {
    const response = await apiFetch(endpoint, {
      ...options,
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `DELETE ${endpoint} failed`);
    }
    
    return response.json();
  },

  /**
   * Public GET request (no auth required)
   */
  publicGet: async (endpoint, options = {}) => {
    const response = await apiFetch(endpoint, {
      ...options,
      method: 'GET',
    }, false);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `GET ${endpoint} failed`);
    }
    
    return response.json();
  },

  /**
   * Public POST request (no auth required)
   */
  publicPost: async (endpoint, data = {}, options = {}) => {
    // Check if data is FormData, don't stringify it
    const isFormData = data instanceof FormData;
    
    const response = await apiFetch(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    }, false);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `POST ${endpoint} failed`);
    }
    
    return response.json();
  },

  /**
   * Verify affiliate code for a specific form (public endpoint)
   */
  verifyAffiliateCode: async (affiliateCode, formId) => {
    try {
      return await api.publicPost('/public/affiliates/verify', {
        affiliate_code: affiliateCode,
        form_id: formId
      });
    } catch (error) {
      console.error('Failed to verify affiliate code:', error);
      throw error;
    }
  },

  /**
   * Admin Affiliate Management Endpoints
   */

  // Get all affiliates for admin
  getAffiliates: async () => {
    try {
      return await api.get('/admin/affiliates');
    } catch (error) {
      console.error('Failed to get affiliates:', error);
      throw error;
    }
  },

  // Get pending affiliates for admin
  getPendingAffiliates: async () => {
    try {
      return await api.get('/admin/affiliates/pending');
    } catch (error) {
      console.error('Failed to get pending affiliates:', error);
      throw error;
    }
  },

  // Approve affiliate
  approveAffiliate: async (affiliateId) => {
    try {
      return await api.post(`/admin/affiliates/${affiliateId}/approve`);
    } catch (error) {
      console.error('Failed to approve affiliate:', error);
      throw error;
    }
  },

  // Reject affiliate
  rejectAffiliate: async (affiliateId) => {
    try {
      return await api.post(`/admin/affiliates/${affiliateId}/reject`);
    } catch (error) {
      console.error('Failed to reject affiliate:', error);
      throw error;
    }
  },

  // Create new affiliate (admin only)
  createAffiliate: async (affiliateData) => {
    try {
      return await api.post('/admin/affiliates', affiliateData);
    } catch (error) {
      console.error('Failed to create affiliate:', error);
      throw error;
    }
  },

  /**
   * New Authenticated Form Submission & User Endpoints
   */

  // Submit form (authenticated) - email auto-filled from logged user
  submitForm: async (formSlug, payload) => {
    try {
      // Send the payload directly - it already contains the correct structure:
      // { data: {...}, pricing_tier_id: X, affiliate_code: 'ABC' }
      return await api.post('/submissions', {
        form_slug: formSlug,
        ...payload // Spread the payload to maintain the correct structure
      });
    } catch (error) {
      console.error('Failed to submit form:', error);
      throw error;
    }
  },

  // Get user's form submission status
  getUserForms: async () => {
    try {
      return await api.get('/user/forms');
    } catch (error) {
      console.error('Failed to get user forms:', error);
      throw error;
    }
  },

  // Check if user has submitted a specific form
  checkFormSubmissionStatus: async (formSlug) => {
    try {
      return await api.get(`/user/forms/${formSlug}/status`);
    } catch (error) {
      console.error('Failed to check form submission status:', error);
      throw error;
    }
  },

  // Get user's affiliate statistics and codes
  getMyAffiliateStats: async () => {
    try {
      return await api.get('/affiliates/my/statistics');
    } catch (error) {
      console.error('Failed to get affiliate stats:', error);
      throw error;
    }
  },

  // Get affiliate leaderboard
  getAffiliateLeaderboard: async (formId = null, metric = 'total_earned') => {
    try {
      const params = new URLSearchParams();
      if (formId) params.set('form_id', formId);
      params.set('metric', metric);
      
      return await api.get(`/affiliates/leaderboard?${params}`);
    } catch (error) {
      console.error('Failed to get affiliate leaderboard:', error);
      throw error;
    }
  },

  // Get user's current affiliate codes for all forms
  getMyAffiliateCodes: async () => {
    try {
      return await api.get('/affiliates/my/codes');
    } catch (error) {
      console.error('Failed to get affiliate codes:', error);
      throw error;
    }
  },


};

export default api;
