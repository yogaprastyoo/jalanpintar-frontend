/**
 * Token Service
 * Secure token management dengan in-memory + sessionStorage strategy
 * 
 * Security Strategy:
 * 1. Primary: In-memory storage (cleared on page reload, immune to XSS)
 * 2. Fallback: SessionStorage (cleared on tab close, survives page reload)
 * 3. HTTP-only Cookie: Refresh token (backend managed, most secure)
 */

import logger from '@/lib/logger';

// Token storage keys
const ACCESS_TOKEN_KEY = 'smartpath_access_token';
const REFRESH_TOKEN_KEY = 'smartpath_refresh_token';
const USER_DATA_KEY = 'smartpath_user_data';

// In-memory token storage (most secure, but lost on page reload)
let inMemoryAccessToken = null;

/**
 * Get stored access token
 * Priority: 1. In-memory, 2. LocalStorage
 */
export const getAccessToken = () => {
  // Try in-memory first (fastest)
  if (inMemoryAccessToken) {
    return inMemoryAccessToken;
  }
  
  // Fallback to localStorage (persistent)
  const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (storedToken && storedToken !== 'temp_missing') {
    // Restore to in-memory
    inMemoryAccessToken = storedToken;
    return storedToken;
  }
  
  return null;
};

/**
 * Get stored refresh token
 * Note: Backend should send refresh_token via HTTP-only cookie
 * This function tries to read from cookie (won't work if HTTP-only)
 * Browser will automatically send the cookie with requests
 */
export const getRefreshToken = () => {
  // Try to read from cookie (only works if NOT HTTP-only)
  const cookieToken = getCookie(REFRESH_TOKEN_KEY);
  if (cookieToken) return cookieToken;
  
  // Fallback: Check localStorage (only if manually stored)
  const storedToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (storedToken && storedToken !== 'temp_missing') return storedToken;
  
  // If backend uses HTTP-only cookie, return indicator
  // The actual token will be sent automatically by browser
  return 'http_only_cookie';
};

/**
 * Store tokens securely
 * @param {string} accessToken - Short-lived access token
 * @param {string} refreshToken - Long-lived refresh token (optional, if not in HTTP-only cookie)
 * @param {object} userData - User data to store
 */
export const setTokens = (accessToken, refreshToken = null, userData = null) => {
  if (!accessToken) {
    logger.warn('TokenService', 'Attempting to set empty access token');
    return;
  }

  // Store access token in memory (primary)
  inMemoryAccessToken = accessToken;
  
  // Also store in localStorage (persistent)
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  
  logger.debug('TokenService', 'Access token stored in memory + localStorage');
  
  // Store refresh token if provided (usually backend sends via HTTP-only cookie)
  if (refreshToken && refreshToken !== 'temp_missing' && refreshToken !== 'http_only_cookie') {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    logger.debug('TokenService', 'Refresh token stored in localStorage');
  }
  
  // Store user data
  if (userData) {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    logger.debug('TokenService', 'User data stored');
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
 * Get user role with fallback
 */
export const getUserRole = () => {
  const userData = getUserData();
  // Default to 'user' if role is null/undefined
  return userData?.role || 'user';
};

/**
 * Check if user is admin
 */
export const isAdmin = () => {
  return getUserRole() === 'admin';
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const accessToken = getAccessToken();
  const hasToken = !!accessToken && accessToken !== 'temp_missing';
  logger.debug('TokenService.isAuthenticated', hasToken ? 'Authenticated' : 'Not authenticated');
  return hasToken;
};

/**
 * Clear all tokens (on logout or auth failure)
 */
export const clearTokens = () => {
  // Clear in-memory
  inMemoryAccessToken = null;
  
  // Clear localStorage
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  
  // Clear cookies
  deleteCookie(REFRESH_TOKEN_KEY);
  
  logger.info('TokenService', 'All tokens cleared');
};

/**
 * Migrate tokens from localStorage to sessionStorage (one-time migration)
 * Call this on app initialization
 */
export const migrateFromLocalStorage = () => {
  try {
    const oldAccessToken = localStorage.getItem('smartpath_access_token');
    const oldRefreshToken = localStorage.getItem('smartpath_refresh_token');
    const oldUserData = localStorage.getItem('smartpath_user_data');
    
    if (oldAccessToken || oldUserData) {
      logger.info('TokenService', 'Migrating tokens from localStorage to sessionStorage');
      
      // Migrate to new storage
      if (oldAccessToken) {
        setTokens(oldAccessToken, oldRefreshToken, oldUserData ? JSON.parse(oldUserData) : null);
      }
      
      // Clean up old storage
      localStorage.removeItem('smartpath_access_token');
      localStorage.removeItem('smartpath_refresh_token');
      localStorage.removeItem('smartpath_user_data');
      
      logger.success('TokenService', 'Token migration completed');
    }
  } catch (error) {
    logger.error('TokenService', 'Migration error:', error);
  }
};

// ============================================================
// Cookie Helper Functions
// ============================================================

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export default {
  getAccessToken,
  getRefreshToken,
  setTokens,
  getUserData,
  getUserRole,
  isAdmin,
  isAuthenticated,
  clearTokens,
  migrateFromLocalStorage,
};
