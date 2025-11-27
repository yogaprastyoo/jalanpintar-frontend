/**
 * Contoh Migrasi ke Config Routes & Endpoints
 * Copy-paste ini ke file yang mau dimigrasi
 */

import { ROUTES, buildRoute } from '@/config/routes';
import { FORM_ENDPOINTS, CATEGORY_ENDPOINTS } from '@/config/endpoints';

// ============================================================
// NAVIGATION - Contoh Migrasi
// ============================================================

// ❌ SEBELUM:
// navigate('/admin/forms');
// navigate(`/admin/forms/edit/${form.id}`);
// navigate(`/user/form/${slug}`);

// ✅ SESUDAH:
// navigate(ROUTES.ADMIN_FORMS.path);
// navigate(buildRoute('ADMIN_FORMS_EDIT', form.id));
// navigate(buildRoute('USER_FORM_VIEW', slug));

// ============================================================
// API CALLS - Contoh Migrasi  
// ============================================================

// ❌ SEBELUM:
// await api.get('/forms');
// await api.post('/forms', data);
// await api.put(`/forms/${id}`, data);
// await api.delete(`/forms/${id}`);
// await api.get(`/public/forms/${slug}`);

// ✅ SESUDAH:
// await api.get(FORM_ENDPOINTS.LIST);
// await api.post(FORM_ENDPOINTS.CREATE, data);
// await api.put(FORM_ENDPOINTS.UPDATE(id), data);
// await api.delete(FORM_ENDPOINTS.DELETE(id));
// await api.get(FORM_ENDPOINTS.PUBLIC(slug));

// ============================================================
// CATEGORIES - Contoh
// ============================================================

// ❌ SEBELUM:
// await api.get('/categories');
// await api.post('/categories', data);
// await api.put(`/categories/${id}`, data);
// await api.delete(`/categories/${id}`);

// ✅ SESUDAH:
// await api.get(CATEGORY_ENDPOINTS.LIST);
// await api.post(CATEGORY_ENDPOINTS.CREATE, data);
// await api.put(CATEGORY_ENDPOINTS.UPDATE(id), data);
// await api.delete(CATEGORY_ENDPOINTS.DELETE(id));

// ============================================================
// TIPS MIGRASI CEPAT
// ============================================================

// 1. Find & Replace di VS Code (Ctrl+Shift+H):
//    Find:    navigate\(['"](/admin/forms)['"]\)
//    Replace: navigate(ROUTES.ADMIN_FORMS.path)

// 2. Find & Replace API calls:
//    Find:    api\.get\(['"]\/forms['"]\)
//    Replace: api.get(FORM_ENDPOINTS.LIST)

// 3. Dynamic routes:
//    Find:    navigate\(`/admin/forms/edit/\${(.+?)}`\)
//    Replace: navigate(buildRoute('ADMIN_FORMS_EDIT', $1))
