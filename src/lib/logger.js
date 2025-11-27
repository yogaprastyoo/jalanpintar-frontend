/**
 * Development Logger Utility
 * Controlled by environment variables:
 * - VITE_ENABLE_LOGGING: explicitly enable/disable logging (true/false)
 * - VITE_APP_ENV: environment mode (development/staging/production)
 */

const isLoggingEnabled = import.meta.env.VITE_ENABLE_LOGGING === 'true';
const isDevelopment = import.meta.env.VITE_APP_ENV === 'development';

const logger = {
  /**
   * Log info messages (only when logging is enabled)
   */
  info: (...args) => {
    if (isLoggingEnabled) {
      console.log(...args);
    }
  },

  /**
   * Log warning messages (only when logging is enabled)
   */
  warn: (...args) => {
    if (isLoggingEnabled) {
      console.warn(...args);
    }
  },

  /**
   * Log error messages (always shown, even in production)
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Log debug messages with prefix (only when logging is enabled)
   */
  debug: (label, ...args) => {
    if (isLoggingEnabled) {
      console.log(`🐛 [${label}]`, ...args);
    }
  },

  /**
   * Log success messages (only when logging is enabled)
   */
  success: (...args) => {
    if (isLoggingEnabled) {
      console.log('✅', ...args);
    }
  },

  /**
   * Group related logs (only when logging is enabled)
   */
  group: (label, callback) => {
    if (isLoggingEnabled) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  },

  /**
   * Performance timing (only when logging is enabled)
   */
  time: (label) => {
    if (isLoggingEnabled) {
      console.time(label);
    }
  },

  timeEnd: (label) => {
    if (isLoggingEnabled) {
      console.timeEnd(label);
    }
  }
};

export default logger;
