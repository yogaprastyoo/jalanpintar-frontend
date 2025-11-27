/**
 * Authentication Service
 * Handle login, register, logout operations
 */

import httpClient from './HttpClient';
import TokenService from './TokenService';
import logger from '@/lib/logger';
import { AUTH_ENDPOINTS } from '@/config/endpoints';

const LOGIN_ENDPOINT = import.meta.env.VITE_API_LOGIN || '/login';
const REGISTER_ENDPOINT = import.meta.env.VITE_API_REGISTER || '/register';
const REFRESH_ENDPOINT = import.meta.env.VITE_API_REFRESH || '/refresh';
const LOGOUT_ENDPOINT = import.meta.env.VITE_API_LOGOUT || '/logout';

class AuthService {
  /**
   * Login with credentials
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} User data and tokens
   */
  async login(email, password) {
    logger.debug('AuthService.login', `Attempting login for: ${email}`);
    
    try {
      const data = await httpClient.publicPost(LOGIN_ENDPOINT, {
        email,
        password,
      });

      logger.success('AuthService.login', 'Login successful');
      
      // Store tokens
      const accessToken = data.access_token || data.token;
      const refreshToken = data.refresh_token;
      
      if (accessToken) {
        TokenService.setTokens(accessToken, refreshToken, data.user);
        logger.info('AuthService.login', 'Tokens and user data saved');
      } else {
        throw new Error('No access token in response');
      }

      return data;
    } catch (error) {
      logger.error('AuthService.login', error.message);
      throw error;
    }
  }

  /**
   * Register new user
   * @param {Object} userData - Registration data (name, email, password, etc.)
   * @returns {Promise<Object>} User data and tokens
   */
  async register(userData) {
    logger.debug('AuthService.register', `Registering user: ${userData.email}`);
    
    try {
      const data = await httpClient.publicPost(REGISTER_ENDPOINT, userData);

      logger.success('AuthService.register', 'Registration successful');
      
      // Store tokens
      const accessToken = data.access_token || data.token;
      const refreshToken = data.refresh_token;
      
      if (accessToken) {
        TokenService.setTokens(accessToken, refreshToken, data.user);
        logger.info('AuthService.register', 'User registered and logged in');
      }

      return data;
    } catch (error) {
      logger.error('AuthService.register', error.message);
      throw error;
    }
  }

  /**
   * Logout and clear tokens
   */
  async logout() {
    logger.debug('AuthService.logout', 'Logging out user');
    
    const accessToken = TokenService.getAccessToken();
    
    if (accessToken) {
      try {
        await httpClient.post(LOGOUT_ENDPOINT);
        logger.success('AuthService.logout', 'Logout request successful');
      } catch (error) {
        logger.warn('AuthService.logout', 'Logout request failed, clearing tokens anyway');
      }
    }
    
    TokenService.clearTokens();
    logger.info('AuthService.logout', 'User logged out');
  }

  /**
   * Refresh access token using refresh token
   * @returns {Promise<string>} New access token
   */
  async refreshToken() {
    logger.debug('AuthService.refreshToken', 'Refreshing access token');
    
    try {
      const data = await httpClient.publicPost(REFRESH_ENDPOINT, {});
      
      const newAccessToken = data.access_token || data.token;
      const newRefreshToken = data.refresh_token;

      if (!newAccessToken) {
        throw new Error('No access token in refresh response');
      }

      TokenService.setTokens(newAccessToken, newRefreshToken);
      logger.success('AuthService.refreshToken', 'Token refreshed successfully');
      
      return newAccessToken;
    } catch (error) {
      logger.error('AuthService.refreshToken', 'Token refresh failed');
      TokenService.clearTokens();
      throw error;
    }
  }

  /**
   * Get current user data
   */
  getCurrentUser() {
    return TokenService.getUserData();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return TokenService.isAuthenticated();
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    return TokenService.isAdmin();
  }

  /**
   * Get user role
   */
  getUserRole() {
    return TokenService.getUserRole();
  }
}

export default new AuthService();
