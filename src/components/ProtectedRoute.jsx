import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '@/lib/api';

const ProtectedRoute = ({ children, requiredRole }) => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Check if a specific role is required
  if (requiredRole) {
    const userRole = getUserRole();
    if (userRole !== requiredRole) {
      // Redirect to appropriate dashboard based on user role
      console.warn(`⚠️ Access denied: ${requiredRole} role required. User has ${userRole} role.`);
      
      if (userRole === 'admin') {
        return <Navigate to="/admin" replace />;
      } else if (userRole === 'user') {
        return <Navigate to="/user/dashboard" replace />;
      } else {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;
