import { apiClient } from '../api-client.js';

/**
 * Fetch all dynamic templates with active text, default fallback, and customization flags.
 * @returns {Promise<{ data: Array<object> }>}
 */
export const getTemplatesApi = async () => {
  return apiClient.get('/restaurant/templates');
};

/**
 * Update and customize one or more templates.
 * @param {object} payload - e.g. { templates: { WHATSAPP_WELCOME: "..." } }
 * @returns {Promise<{ data: { message: string, templates: object } }>}
 */
export const updateTemplatesApi = async (payload) => {
  return apiClient.patch('/restaurant/templates', payload);
};

/**
 * Reset a specific template or all templates back to system defaults.
 * @param {{ key?: string, resetAll?: boolean }} payload
 * @returns {Promise<{ data: { message: string } }>}
 */
export const resetTemplatesApi = async (payload) => {
  return apiClient.post('/restaurant/templates/reset', payload);
};

/**
 * Create a new custom template.
 * @param {{ title: string, text: string, category?: string, description?: string, allowedVariables?: string[] }} payload
 * @returns {Promise<{ success: boolean, data: object }>}
 */
export const createTemplateApi = async (payload) => {
  return apiClient.post('/restaurant/templates', payload);
};

/**
 * Delete a custom template or reset a system template.
 * @param {string} key
 * @returns {Promise<{ success: boolean, data: Array<object> }>}
 */
export const deleteTemplateApi = async (key) => {
  return apiClient.delete(`/restaurant/templates/${key}`);
};

