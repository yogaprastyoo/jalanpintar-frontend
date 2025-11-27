import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import { isAuthenticated, getUserRole } from '@/lib/api';
import { ROUTES } from '@/config/routes';
import logger from '@/lib/logger';
import LoginPage from '@/pages/LoginPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import AdminDashboard from '@/pages/AdminDashboard';
import FormList from '@/pages/FormList';
import FormBuilderEditor from '@/pages/FormBuilderEditor';
import FormResponses from '@/pages/FormResponses';
import AnnouncementManager from '@/pages/AnnouncementManager';
import AffiliateManager from '@/pages/AffiliateManager';
import UserFormView from '@/pages/UserFormView';
import UserAnnouncementCheck from '@/pages/UserAnnouncementCheck';
import FormSuccess from '@/pages/FormSuccess';
import UserDashboard from '@/pages/UserDashboard';
import UserLeaderboard from '@/pages/UserLeaderboard';
import FormRedirect from '@/pages/FormRedirect';

// Component untuk redirect berdasarkan role
const RoleBasedRedirect = () => {
  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN.path} replace />;
  }

  const userRole = getUserRole();
  
  logger.debug('RoleBasedRedirect', `User role: ${userRole}`);
  
  if (userRole === 'admin') {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD.path} replace />;
  } else if (userRole === 'user' || !userRole) {
    return <Navigate to={ROUTES.USER_DASHBOARD.path} replace />;
  } else {
    logger.warn('Unknown role:', userRole, '- redirecting to login');
    return <Navigate to={ROUTES.LOGIN.path} replace />;
  }
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path={ROUTES.HOME.path} element={<RoleBasedRedirect />} />
          <Route path={ROUTES.LOGIN.path} element={<LoginPage />} />
          <Route path={ROUTES.UNAUTHORIZED.path} element={<UnauthorizedPage />} />
          
          {/* Protected Admin Routes */}
          <Route path={ROUTES.ADMIN_DASHBOARD.path} element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN_FORMS.path} element={<ProtectedRoute requiredRole="admin"><FormList /></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN_FORMS_NEW.path} element={<ProtectedRoute requiredRole="admin"><FormBuilderEditor /></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN_FORMS_EDIT.path} element={<ProtectedRoute requiredRole="admin"><FormBuilderEditor /></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN_FORMS_RESPONSES.path} element={<ProtectedRoute requiredRole="admin"><FormResponses /></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN_ANNOUNCEMENTS.path} element={<ProtectedRoute requiredRole="admin"><AnnouncementManager /></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN_AFFILIATES.path} element={<ProtectedRoute requiredRole="admin"><AffiliateManager /></ProtectedRoute>} />
          
          {/* Protected User Routes */}
          <Route path={ROUTES.USER_DASHBOARD.path} element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />
          <Route path={ROUTES.USER_LEADERBOARD.path} element={<ProtectedRoute requiredRole="user"><UserLeaderboard /></ProtectedRoute>} />

          {/* Redirect route for affiliate links */}
          <Route path={ROUTES.FORM_REDIRECT.path} element={<FormRedirect />} />

          {/* Public User Routes */}
          <Route path={ROUTES.USER_FORM_VIEW.path} element={<UserFormView />} />
          <Route path={ROUTES.USER_ANNOUNCEMENTS.path} element={<UserAnnouncementCheck />} />
          <Route path={ROUTES.SUCCESS.path} element={<FormSuccess />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
