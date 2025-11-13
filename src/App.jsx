
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/forms" element={<ProtectedRoute><FormList /></ProtectedRoute>} />
          <Route path="/admin/forms/new" element={<ProtectedRoute><FormBuilderEditor /></ProtectedRoute>} />
          <Route path="/admin/forms/edit/:formId" element={<ProtectedRoute><FormBuilderEditor /></ProtectedRoute>} />
          <Route path="/admin/forms/responses/:formId" element={<ProtectedRoute><FormResponses /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute><AnnouncementManager /></ProtectedRoute>} />
          <Route path="/admin/affiliates" element={<ProtectedRoute><AffiliateManager /></ProtectedRoute>} />
          
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
