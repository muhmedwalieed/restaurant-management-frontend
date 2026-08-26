import { apiClient } from '../api-client.js';

export const getCategoriesApi = async (params = {}) => {
  return apiClient.get('/menu/categories', { params });
};

export const getCategoryByIdApi = async (id) => {
  return apiClient.get(`/menu/categories/${id}`);
};

export const createCategoryApi = async (payload) => {
  return apiClient.post('/menu/categories', payload);
};

export const updateCategoryApi = async (id, payload) => {
  return apiClient.patch(`/menu/categories/${id}`, payload);
};

export const deleteCategoryApi = async (id) => {
  return apiClient.delete(`/menu/categories/${id}`);
};

export const getProductsApi = async (params = {}) => {
  return apiClient.get('/menu/products', { params });
};

export const getProductByIdApi = async (id) => {
  return apiClient.get(`/menu/products/${id}`);
};

export const createProductApi = async (payload) => {
  return apiClient.post('/menu/products', payload);
};

export const updateProductApi = async (id, payload) => {
  return apiClient.patch(`/menu/products/${id}`, payload);
};

export const deleteProductApi = async (id) => {
  return apiClient.delete(`/menu/products/${id}`);
};

export const getModifiersApi = async (productId) => {
  return apiClient.get(`/menu/products/${productId}/modifiers`);
};

export const createModifierApi = async (productId, payload) => {
  return apiClient.post(`/menu/products/${productId}/modifiers`, payload);
};

export const updateModifierApi = async (productId, modifierId, payload) => {
  return apiClient.patch(`/menu/products/${productId}/modifiers/${modifierId}`, payload);
};

export const deleteModifierApi = async (productId, modifierId) => {
  return apiClient.delete(`/menu/products/${productId}/modifiers/${modifierId}`);
};

export const getPublicMenuApi = async ({ slug } = {}) => {
  return apiClient.get('/menu/public', { params: { slug } });
};
