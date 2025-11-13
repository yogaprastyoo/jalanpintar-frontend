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
const LOGIN_ENDPOINT = import.meta.env.VITE_API_LOGIN || '/api/auth/login';
const REGISTER_ENDPOINT = import.meta.env.VITE_API_REGISTER || '/api/auth/register';
const REFRESH_ENDPOINT = import.meta.env.VITE_API_REFRESH || '/api/auth/refresh';
const LOGOUT_ENDPOINT = import.meta.env.VITE_API_LOGOUT || '/api/auth/logout';

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
 */
export const getUserRole = () => {
  const userData = getUserData();
  return userData?.role || null;
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
 * Check if user is authenticated (has tokens)
 */
export const isAuthenticated = () => {
  return !!getAccessToken() && !!getRefreshToken();
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

/**
 * Main API fetch wrapper with automatic token refresh
 * @param {string} endpoint - API endpoint (e.g., '/api/forms')
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @param {boolean} requireAuth - Whether this request requires authentication
 * @returns {Promise<Response>}
 */
export const apiFetch = async (endpoint, options = {}, requireAuth = true) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  // Check if body is FormData - don't set Content-Type for FormData
  const isFormData = options.body instanceof FormData;
  
  // Merge headers
  const headers = {
    'Accept': 'application/json',
    ...options.headers,
  };
  
  // Only set Content-Type if not FormData (browser will auto-set for FormData with boundary)
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Add authorization header if required
  if (requireAuth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  // First attempt
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If 401 and we have a refresh token, try to refresh and retry
  if (response.status === 401 && requireAuth && getRefreshToken()) {
    try {
      const newAccessToken = await refreshAccessToken();
      
      // Retry request with new token
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      clearTokens();
      // Optionally redirect to login page
      // window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
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
};

export default api;
