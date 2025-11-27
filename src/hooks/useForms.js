/**
 * useForms Hook
 * Custom hook untuk form management
 */

import { useState, useEffect, useCallback } from 'react';
import FormService from '@/services/FormService';
import { useToast } from '@/components/ui/use-toast';
import { handleError } from '@/lib/errorHandler';
import logger from '@/lib/logger';

export const useForms = (autoLoad = true) => {
  const { toast } = useToast();
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load all forms
   */
  const loadForms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await FormService.getAll();
      logger.debug('useForms.loadForms', `Loaded ${response.data?.length || 0} forms`);
      
      // Map API response to UI format
      const formsData = response.data.map(form => ({
        id: form.id,
        slug: form.slug,
        title: form.title || form.name,
        folder: form.category?.name || form.folder || 'Uncategorized',
        submissions: form.submissions_count || form.responses_count || 0,
        createdAt: form.created_at,
      }));
      
      setForms(formsData);
      return formsData;
    } catch (err) {
      const parsedError = handleError(err, toast, 'useForms.loadForms');
      setError(parsedError.message);
      setForms([]);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Get form by ID
   */
  const getForm = useCallback(async (formId) => {
    try {
      const response = await FormService.getById(formId);
      return response.data;
    } catch (err) {
      handleError(err, toast, 'useForms.getForm');
      throw err;
    }
  }, [toast]);

  /**
   * Get form by slug (public)
   */
  const getFormBySlug = useCallback(async (slug) => {
    try {
      const response = await FormService.getBySlug(slug);
      return response.data;
    } catch (err) {
      handleError(err, toast, 'useForms.getFormBySlug');
      throw err;
    }
  }, [toast]);

  /**
   * Create new form
   */
  const createForm = useCallback(async (formData) => {
    setIsLoading(true);
    
    try {
      const response = await FormService.create(formData);
      logger.success('useForms.createForm', 'Form created');
      
      toast({
        title: 'Form Dibuat',
        description: 'Form berhasil dibuat!',
      });
      
      // Reload forms
      await loadForms();
      
      return response.data;
    } catch (err) {
      handleError(err, toast, 'useForms.createForm');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast, loadForms]);

  /**
   * Update existing form
   */
  const updateForm = useCallback(async (formId, formData) => {
    setIsLoading(true);
    
    try {
      const response = await FormService.update(formId, formData);
      logger.success('useForms.updateForm', 'Form updated');
      
      toast({
        title: 'Form Diupdate',
        description: 'Form berhasil diperbarui!',
      });
      
      // Reload forms
      await loadForms();
      
      return response.data;
    } catch (err) {
      handleError(err, toast, 'useForms.updateForm');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast, loadForms]);

  /**
   * Delete form
   */
  const deleteForm = useCallback(async (formId) => {
    try {
      await FormService.delete(formId);
      logger.success('useForms.deleteForm', 'Form deleted');
      
      // Remove from local state
      setForms(prev => prev.filter(f => f.id !== formId));
      
      toast({
        title: 'Form Dihapus',
        description: 'Form berhasil dihapus!',
      });
    } catch (err) {
      handleError(err, toast, 'useForms.deleteForm');
      throw err;
    }
  }, [toast]);

  /**
   * Get form submissions
   */
  const getSubmissions = useCallback(async (formId) => {
    try {
      const response = await FormService.getSubmissions(formId);
      return response.data;
    } catch (err) {
      handleError(err, toast, 'useForms.getSubmissions');
      throw err;
    }
  }, [toast]);

  /**
   * Get user forms
   */
  const getUserForms = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await FormService.getUserForms();
      return response.data;
    } catch (err) {
      handleError(err, toast, 'useForms.getUserForms');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Auto-load forms on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadForms();
    }
  }, [autoLoad, loadForms]);

  return {
    // State
    forms,
    isLoading,
    error,
    
    // Actions
    loadForms,
    getForm,
    getFormBySlug,
    createForm,
    updateForm,
    deleteForm,
    getSubmissions,
    getUserForms,
  };
};

export default useForms;
