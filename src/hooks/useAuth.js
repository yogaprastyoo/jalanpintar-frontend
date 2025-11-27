/**
 * useAuth Hook
 * Custom hook untuk authentication dengan Zustand store
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { ROUTES } from '@/config/routes';
import { useToast } from '@/components/ui/use-toast';
import { handleError } from '@/lib/errorHandler';

export const useAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get state and actions from store
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    clearError,
    getUserRole,
    isAdmin: checkIsAdmin,
  } = useAuthStore();

  /**
   * Login with redirect
   */
  const login = useCallback(async (email, password, redirectTo = null) => {
    try {
      await storeLogin(email, password);
      
      toast({
        title: 'Login Berhasil',
        description: `Selamat datang, ${useAuthStore.getState().user?.name}!`,
      });
      
      // Redirect based on role or custom path
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        const role = getUserRole();
        navigate(role === 'admin' ? ROUTES.ADMIN_DASHBOARD.path : ROUTES.USER_DASHBOARD.path);
      }
    } catch (err) {
      handleError(err, toast, 'useAuth.login');
      throw err;
    }
  }, [storeLogin, navigate, toast, getUserRole]);

  /**
   * Register with redirect
   */
  const register = useCallback(async (userData, redirectTo = null) => {
    try {
      await storeRegister(userData);
      
      toast({
        title: 'Registrasi Berhasil',
        description: 'Akun Anda telah dibuat!',
      });
      
      // Redirect to dashboard
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate(ROUTES.USER_DASHBOARD.path);
      }
    } catch (err) {
      handleError(err, toast, 'useAuth.register');
      throw err;
    }
  }, [storeRegister, navigate, toast]);

  /**
   * Logout with redirect
   */
  const logout = useCallback(async (message = 'Logout Berhasil') => {
    try {
      await storeLogout();
      
      toast({
        title: message,
        description: 'Anda telah keluar dari sistem.',
      });
      
      navigate(ROUTES.LOGIN.path);
    } catch (err) {
      handleError(err, toast, 'useAuth.logout');
      // Still navigate to login even if logout fails
      navigate(ROUTES.LOGIN.path);
    }
  }, [storeLogout, navigate, toast]);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role) => {
    return getUserRole() === role;
  }, [getUserRole]);
  
  /**
   * Require authentication (redirect if not authenticated)
   */
  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Akses Ditolak',
        description: 'Silakan login terlebih dahulu',
        variant: 'destructive',
      });
      navigate(ROUTES.LOGIN.path);
      return false;
    }
    return true;
  }, [isAuthenticated, navigate, toast]);

  /**
   * Require admin role (redirect if not admin)
   */
  const requireAdmin = useCallback(() => {
    if (!requireAuth()) return false;
    
    if (!checkIsAdmin()) {
      toast({
        title: 'Akses Ditolak',
        description: 'Anda tidak memiliki izin admin',
        variant: 'destructive',
      });
      navigate(ROUTES.UNAUTHORIZED.path);
      return false;
    }
    return true;
  }, [requireAuth, checkIsAdmin, navigate, toast]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    register,
    logout,
    clearError,
    
    // Helpers
    getUserRole,
    hasRole,
    isAdmin: checkIsAdmin(),
    requireAuth,
    requireAdmin,
  };
};

export default useAuth;
