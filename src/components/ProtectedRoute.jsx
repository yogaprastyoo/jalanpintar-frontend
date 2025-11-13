import { Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '@/lib/api';

const ProtectedRoute = ({ children, requireAdmin = true }) => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Check if admin access is required
  if (requireAdmin && !isAdmin()) {
    // Redirect to unauthorized page if not admin
    console.warn('⚠️ Access denied: Admin role required');
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
