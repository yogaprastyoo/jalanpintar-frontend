/**
 * Route Configuration
 * Single source of truth untuk semua frontend routes
 * Disinkronkan dengan kode yang sudah work di App.jsx
 */

export const ROUTES = {
  // ============================================================
  // Public Routes
  // ============================================================
  HOME: {
    path: '/',
    requireAuth: false,
  },
  
  LOGIN: {
    path: '/login',
    requireAuth: false,
  },
  
  UNAUTHORIZED: {
    path: '/unauthorized',
    requireAuth: false,
  },
  
  SUCCESS: {
    path: '/success',
    requireAuth: false,
  },

  // ============================================================
  // Admin Routes
  // ============================================================
  ADMIN_DASHBOARD: {
    path: '/admin',
    requireAuth: true,
    allowedRoles: ['admin'],
  },
  
  ADMIN_FORMS: {
    path: '/admin/forms',
    requireAuth: true,
    allowedRoles: ['admin'],
  },
  
  ADMIN_FORMS_NEW: {
    path: '/admin/forms/new',
    requireAuth: true,
    allowedRoles: ['admin'],
  },
  
  ADMIN_FORMS_EDIT: {
    path: '/admin/forms/edit/:formId',
    requireAuth: true,
    allowedRoles: ['admin'],
    build: (formId) => `/admin/forms/edit/${formId}`,
  },
  
  ADMIN_FORMS_RESPONSES: {
    path: '/admin/forms/responses/:formSlug',
    requireAuth: true,
    allowedRoles: ['admin'],
    build: (formSlug) => `/admin/forms/responses/${formSlug}`,
  },
  
  ADMIN_ANNOUNCEMENTS: {
    path: '/admin/announcements',
    requireAuth: true,
    allowedRoles: ['admin'],
  },
  
  ADMIN_AFFILIATES: {
    path: '/admin/affiliates',
    requireAuth: true,
    allowedRoles: ['admin'],
  },

  // ============================================================
  // User Routes
  // ============================================================
  USER_DASHBOARD: {
    path: '/user/dashboard',
    requireAuth: true,
    allowedRoles: ['user'],
  },
  
  USER_LEADERBOARD: {
    path: '/user/leaderboard',
    requireAuth: true,
    allowedRoles: ['user'],
  },

  USER_FORM_VIEW: {
    path: '/user/form/:formSlug',
    requireAuth: false, // Public
    build: (formSlug) => `/user/form/${formSlug}`,
  },
  
  USER_ANNOUNCEMENTS: {
    path: '/user/announcements',
    requireAuth: false, // Public
  },

  // ============================================================
  // Redirect Routes
  // ============================================================
  FORM_REDIRECT: {
    path: '/forms/:slug',
    requireAuth: false,
    build: (slug) => `/forms/${slug}`,
  },
};

/**
 * Helper: Check if route requires auth
 */
export const requiresAuth = (routeKey) => {
  return ROUTES[routeKey]?.requireAuth ?? true;
};

/**
 * Helper: Check if user can access route
 */
export const canAccess = (routeKey, userRole) => {
  const route = ROUTES[routeKey];
  if (!route) return false;
  if (!route.requireAuth) return true;
  if (!route.allowedRoles) return true;
  return route.allowedRoles.includes(userRole);
};

/**
 * Helper: Get route path
 */
export const getPath = (routeKey) => {
  return ROUTES[routeKey]?.path || '/';
};

/**
 * Helper: Build route with params
 */
export const buildRoute = (routeKey, params) => {
  const route = ROUTES[routeKey];
  if (!route) return '/';
  return route.build ? route.build(params) : route.path;
};
