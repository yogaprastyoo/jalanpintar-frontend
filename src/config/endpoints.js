/**
 * API Endpoint Configuration
 * Disinkronkan dengan backend Laravel yang sudah work
 * Hanya endpoint yang benar-benar dipakai di kode
 */

// ============================================================
// Form Endpoints
// ============================================================
export const FORM_ENDPOINTS = {
  LIST: '/forms',
  CREATE: '/forms',
  UPDATE: (formId) => `/forms/${formId}`,
  DELETE: (formId) => `/forms/${formId}`,
  PUBLIC: (slug) => `/public/forms/${slug}`,
  SUBMISSIONS: (formId) => `/forms/${formId}/submissions`,
  USER_FORMS: '/user/forms',
  USER_SEARCH: (slug) => `/user/forms?search=${slug}`,
};

// ============================================================
// Category Endpoints
// ============================================================
export const CATEGORY_ENDPOINTS = {
  LIST: '/categories',
  CREATE: '/categories',
  UPDATE: (id) => `/categories/${id}`,
  DELETE: (id) => `/categories/${id}`,
};

// ============================================================
// Affiliate Endpoints
// ============================================================
export const AFFILIATE_ENDPOINTS = {
  LEADERBOARD: '/affiliates/leaderboard',
  MY_STATS: '/affiliates/my/statistics',
};

// ============================================================
// Auth Endpoints
// ============================================================
export const AUTH_ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  REFRESH: '/refresh',
};

// ============================================================
// Helpers
// ============================================================
export const buildEndpoint = (endpoint, params) => {
  return typeof endpoint === 'function' ? endpoint(params) : endpoint;
};

export const withQueryParams = (endpoint, params) => {
  const query = new URLSearchParams(params).toString();
  return query ? `${endpoint}?${query}` : endpoint;
};
