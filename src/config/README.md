# Route & Endpoint Configuration

## 📁 Files

- **routes.js** - Frontend routes dengan auth metadata
- **endpoints.js** - Backend API endpoints

## 🚀 Usage

### Routes

```javascript
import { ROUTES, buildRoute, canAccess } from '@/config/routes';

// Get path
ROUTES.ADMIN_DASHBOARD.path  // '/admin'

// Check auth
ROUTES.ADMIN_DASHBOARD.requireAuth  // true
ROUTES.USER_FORM_VIEW.requireAuth   // false

// Navigate
navigate(ROUTES.ADMIN_FORMS.path);
navigate(buildRoute('ADMIN_FORMS_EDIT', 123));  // '/admin/forms/edit/123'

// Check permission
canAccess('ADMIN_DASHBOARD', userRole);  // true/false
```

### Endpoints

```javascript
import { FORM_ENDPOINTS, buildEndpoint } from '@/config/endpoints';

// Static endpoint
await api.get(FORM_ENDPOINTS.LIST);  // '/forms'

// Dynamic endpoint
await api.get(FORM_ENDPOINTS.PUBLIC('my-form'));  // '/public/forms/my-form'
await api.put(FORM_ENDPOINTS.UPDATE(123), data);  // '/forms/123'
```

## 📊 Quick Reference

### Public Routes (No Login)
- `/` - Home
- `/login` - Login
- `/success` - Success page
- `/user/form/:slug` - View form (public)
- `/user/announcements` - Announcements (public)

### Admin Routes
- `/admin` - Dashboard
- `/admin/forms` - Forms list
- `/admin/forms/new` - Create form
- `/admin/forms/edit/:formId` - Edit form
- `/admin/forms/responses/:slug` - View responses
- `/admin/announcements` - Announcements
- `/admin/affiliates` - Affiliates

### User Routes
- `/user/dashboard` - User dashboard
- `/user/leaderboard` - Leaderboard

### API Endpoints
- `FORM_ENDPOINTS` - Form CRUD
- `CATEGORY_ENDPOINTS` - Category CRUD  
- `AFFILIATE_ENDPOINTS` - Affiliate data
- `AUTH_ENDPOINTS` - Auth endpoints

## ✅ Benefits

- ✅ Autocomplete di IDE
- ✅ No typos
- ✅ Easy refactoring
- ✅ Self-documenting
