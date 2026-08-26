import { apiClient } from '../api-client.js';

export const uploadImageApi = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return apiClient.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
