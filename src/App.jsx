import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import { isAuthenticated, getUserRole } from '@/lib/api';
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
    return <Navigate to="/login" replace />;
  }

  const userRole = getUserRole();
  
  console.log('🚦 RoleBasedRedirect - User role:', userRole);
  
  if (userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (userRole === 'user' || !userRole) {
    // Default to user dashboard if role is 'user' or null
    return <Navigate to="/user/dashboard" replace />;
  } else {
    // Fallback untuk role yang tidak dikenal
    console.warn('⚠️ Unknown role:', userRole, '- redirecting to login');
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/forms" element={<ProtectedRoute requiredRole="admin"><FormList /></ProtectedRoute>} />
          <Route path="/admin/forms/new" element={<ProtectedRoute requiredRole="admin"><FormBuilderEditor /></ProtectedRoute>} />
          <Route path="/admin/forms/edit/:formId" element={<ProtectedRoute requiredRole="admin"><FormBuilderEditor /></ProtectedRoute>} />
          <Route path="/admin/forms/responses/:formSlug" element={<ProtectedRoute requiredRole="admin"><FormResponses /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute requiredRole="admin"><AnnouncementManager /></ProtectedRoute>} />
          <Route path="/admin/affiliates" element={<ProtectedRoute requiredRole="admin"><AffiliateManager /></ProtectedRoute>} />
          
          {/* Protected User Routes */}
          <Route path="/user/dashboard" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />
          <Route path="/user/leaderboard" element={<ProtectedRoute requiredRole="user"><UserLeaderboard /></ProtectedRoute>} />

          {/* Redirect route for affiliate links */}
          <Route path="/forms/:slug" element={<FormRedirect />} />

          {/* Public User Routes */}
          <Route path="/user/form/:formSlug" element={<UserFormView />} />
          <Route path="/user/announcements" element={<UserAnnouncementCheck />} />
          <Route path="/success" element={<FormSuccess />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
