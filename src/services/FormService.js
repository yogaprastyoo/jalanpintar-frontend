/**
 * Form Service
 * Handle form CRUD operations
 */

import httpClient from './HttpClient';
import { FORM_ENDPOINTS } from '@/config/endpoints';
import logger from '@/lib/logger';

class FormService {
  /**
   * Get all forms
   */
  async getAll() {
    logger.debug('FormService.getAll', 'Fetching all forms');
    try {
      const response = await httpClient.get(FORM_ENDPOINTS.LIST);
      logger.debug('FormService.getAll', `Fetched ${response.data?.length || 0} forms`);
      return response;
    } catch (error) {
      logger.error('FormService.getAll', error.message);
      throw error;
    }
  }

  /**
   * Get form by ID
   */
  async getById(formId) {
    logger.debug('FormService.getById', `Fetching form: ${formId}`);
    try {
      const response = await httpClient.get(FORM_ENDPOINTS.UPDATE(formId));
      return response;
    } catch (error) {
      logger.error('FormService.getById', error.message);
      throw error;
    }
  }

  /**
   * Get form by slug (public)
   */
  async getBySlug(slug) {
    logger.debug('FormService.getBySlug', `Fetching public form: ${slug}`);
    try {
      const response = await httpClient.publicGet(FORM_ENDPOINTS.PUBLIC(slug));
      return response;
    } catch (error) {
      logger.error('FormService.getBySlug', error.message);
      throw error;
    }
  }

  /**
   * Create new form
   */
  async create(formData) {
    logger.debug('FormService.create', 'Creating new form');
    try {
      const response = await httpClient.post(FORM_ENDPOINTS.CREATE, formData);
      logger.success('FormService.create', 'Form created successfully');
      return response;
    } catch (error) {
      logger.error('FormService.create', error.message);
      throw error;
    }
  }

  /**
   * Update existing form
   */
  async update(formId, formData) {
    logger.debug('FormService.update', `Updating form: ${formId}`);
    try {
      const response = await httpClient.put(FORM_ENDPOINTS.UPDATE(formId), formData);
      logger.success('FormService.update', 'Form updated successfully');
      return response;
    } catch (error) {
      logger.error('FormService.update', error.message);
      throw error;
    }
  }

  /**
   * Delete form
   */
  async delete(formId) {
    logger.debug('FormService.delete', `Deleting form: ${formId}`);
    try {
      const response = await httpClient.delete(FORM_ENDPOINTS.DELETE(formId));
      logger.success('FormService.delete', 'Form deleted successfully');
      return response;
    } catch (error) {
      logger.error('FormService.delete', error.message);
      throw error;
    }
  }

  /**
   * Get form submissions
   */
  async getSubmissions(formId) {
    logger.debug('FormService.getSubmissions', `Fetching submissions for form: ${formId}`);
    try {
      const response = await httpClient.get(FORM_ENDPOINTS.SUBMISSIONS(formId));
      return response;
    } catch (error) {
      logger.error('FormService.getSubmissions', error.message);
      throw error;
    }
  }

  /**
   * Get user forms (authenticated user's forms)
   */
  async getUserForms() {
    logger.debug('FormService.getUserForms', 'Fetching user forms');
    try {
      const response = await httpClient.get(FORM_ENDPOINTS.USER_FORMS);
      return response;
    } catch (error) {
      logger.error('FormService.getUserForms', error.message);
      throw error;
    }
  }

  /**
   * Search user forms by slug
   */
  async searchUserForms(slug) {
    logger.debug('FormService.searchUserForms', `Searching forms: ${slug}`);
    try {
      const response = await httpClient.get(FORM_ENDPOINTS.USER_SEARCH(slug));
      return response;
    } catch (error) {
      logger.error('FormService.searchUserForms', error.message);
      throw error;
    }
  }
}

export default new FormService();
