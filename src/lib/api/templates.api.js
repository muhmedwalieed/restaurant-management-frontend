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
