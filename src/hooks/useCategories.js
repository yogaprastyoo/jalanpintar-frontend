/**
 * useCategories Hook
 * Custom hook untuk category/folder management
 */

import { useState, useEffect, useCallback } from 'react';
import CategoryService from '@/services/CategoryService';
import { useToast } from '@/components/ui/use-toast';
import { handleError } from '@/lib/errorHandler';
import { validateCategory } from '@/schemas/categorySchema';
import logger from '@/lib/logger';

export const useCategories = (autoLoad = true) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [categoryNames, setCategoryNames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load all categories
   */
  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await CategoryService.getAll();
      logger.debug('useCategories.loadCategories', `Loaded ${response.data?.length || 0} categories`);
      
      setCategories(response.data);
      setCategoryNames(response.data.map(cat => cat.name));
      
      return response.data;
    } catch (err) {
      const parsedError = handleError(err, toast, 'useCategories.loadCategories');
      setError(parsedError.message);
      setCategories([]);
      setCategoryNames([]);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Create new category
   */
  const createCategory = useCallback(async (categoryData) => {
    // Validate data
    const validation = validateCategory(categoryData);
    if (!validation.success) {
      const errorMsg = validation.errors[0]?.message || 'Data kategori tidak valid';
      toast({
        title: 'Validasi Error',
        description: errorMsg,
        variant: 'destructive',
      });
      throw new Error(errorMsg);
    }
    
    setIsLoading(true);
    
    try {
      // Generate slug
      const slug = categoryData.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '');
      
      const payload = {
        ...validation.data,
        slug,
        is_active: true,
      };
      
      const response = await CategoryService.create(payload);
      logger.success('useCategories.createCategory', 'Category created');
      
      toast({
        title: 'Kategori Dibuat',
        description: `Kategori "${categoryData.name}" berhasil dibuat!`,
      });
      
      // Reload categories
      await loadCategories();
      
      return response.data;
    } catch (err) {
      handleError(err, toast, 'useCategories.createCategory');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast, loadCategories]);

  /**
   * Update existing category
   */
  const updateCategory = useCallback(async (categoryId, categoryData) => {
    // Validate data
    const validation = validateCategory(categoryData);
    if (!validation.success) {
      const errorMsg = validation.errors[0]?.message || 'Data kategori tidak valid';
      toast({
        title: 'Validasi Error',
        description: errorMsg,
        variant: 'destructive',
      });
      throw new Error(errorMsg);
    }
    
    setIsLoading(true);
    
    try {
      // Generate slug
      const slug = categoryData.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '');
      
      const payload = {
        ...validation.data,
        slug,
        is_active: categoryData.is_active !== false,
      };
      
      const response = await CategoryService.update(categoryId, payload);
      logger.success('useCategories.updateCategory', 'Category updated');
      
      toast({
        title: 'Kategori Diupdate',
        description: 'Kategori berhasil diperbarui!',
      });
      
      // Reload categories
      await loadCategories();
      
      return response.data;
    } catch (err) {
      handleError(err, toast, 'useCategories.updateCategory');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast, loadCategories]);

  /**
   * Delete category
   */
  const deleteCategory = useCallback(async (categoryId) => {
    try {
      await CategoryService.delete(categoryId);
      logger.success('useCategories.deleteCategory', 'Category deleted');
      
      // Remove from local state
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setCategoryNames(prev => {
        const category = categories.find(c => c.id === categoryId);
        return prev.filter(name => name !== category?.name);
      });
      
      toast({
        title: 'Kategori Dihapus',
        description: 'Kategori berhasil dihapus!',
      });
    } catch (err) {
      handleError(err, toast, 'useCategories.deleteCategory');
      throw err;
    }
  }, [toast, categories]);

  /**
   * Get category by ID
   */
  const getCategoryById = useCallback((categoryId) => {
    return categories.find(c => c.id === categoryId);
  }, [categories]);

  /**
   * Get category by name
   */
  const getCategoryByName = useCallback((name) => {
    return categories.find(c => c.name === name);
  }, [categories]);

  // Auto-load categories on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadCategories();
    }
  }, [autoLoad, loadCategories]);

  return {
    // State
    categories,
    categoryNames,
    isLoading,
    error,
    
    // Actions
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // Helpers
    getCategoryById,
    getCategoryByName,
  };
};

export default useCategories;
