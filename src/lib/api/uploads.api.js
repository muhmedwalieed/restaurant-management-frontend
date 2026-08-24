import { apiClient } from '../api-client.js';

/**
 * Upload an image file to the server.
 * POST /uploads (multipart/form-data, field "image")
 * @returns {Promise<{ url: string }>} the public path of the uploaded image
 */
export const uploadImageApi = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return apiClient.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};