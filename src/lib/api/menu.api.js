import { apiClient } from '../api-client.js';

// ==================== CATEGORIES API ====================

/**
 * Get categories list with pagination & optional status filter
 * GET /categories?page=&limit=&status=
 */
export const getCategoriesApi = async (params = {}) => {
  return apiClient.get('/menu/categories', { params });
};

/**
 * Get category by ID
 * GET /categories/:id
 */
export const getCategoryByIdApi = async (id) => {
  return apiClient.get(`/menu/categories/${id}`);
};

/**
 * Create a new category
 * POST /categories
 * Payload: { name, description, sortOrder, status }
 */
export const createCategoryApi = async (payload) => {
  return apiClient.post('/menu/categories', payload);
};

/**
 * Update category details
 * PATCH /categories/:id
 * Payload: { name, description, sortOrder, status }
 */
export const updateCategoryApi = async (id, payload) => {
  return apiClient.patch(`/menu/categories/${id}`, payload);
};

/**
 * Soft delete a category
 * DELETE /categories/:id
 */
export const deleteCategoryApi = async (id) => {
  return apiClient.delete(`/menu/categories/${id}`);
};

// ==================== PRODUCTS API ====================

/**
 * Get products list with search, categoryId filter, availability filter & pagination
 * GET /products?page=&limit=&categoryId=&isAvailable=&status=&search=
 */
export const getProductsApi = async (params = {}) => {
  return apiClient.get('/menu/products', { params });
};

/**
 * Get product details by ID
 * GET /products/:id
 */
export const getProductByIdApi = async (id) => {
  return apiClient.get(`/menu/products/${id}`);
};

/**
 * Create a new product
 * POST /products
 * Payload: { categoryId, name, description, price, imageUrl, isAvailable, status }
 */
export const createProductApi = async (payload) => {
  return apiClient.post('/menu/products', payload);
};

/**
 * Update product details / toggle availability
 * PATCH /products/:id
 * Payload: { categoryId, name, description, price, imageUrl, isAvailable, status }
 */
export const updateProductApi = async (id, payload) => {
  return apiClient.patch(`/menu/products/${id}`, payload);
};

/**
 * Soft delete a product
 * DELETE /products/:id
 */
export const deleteProductApi = async (id) => {
  return apiClient.delete(`/menu/products/${id}`);
};

// ==================== PRODUCT MODIFIERS (ADD-ONS) API ====================

/**
 * Get list of modifiers for a specific product
 * GET /products/:productId/modifiers
 */
export const getModifiersApi = async (productId) => {
  return apiClient.get(`/menu/products/${productId}/modifiers`);
};

/**
 * Create a new modifier for a product
 * POST /products/:productId/modifiers
 * Payload: { name, priceDelta, isRequired }
 */
export const createModifierApi = async (productId, payload) => {
  return apiClient.post(`/menu/products/${productId}/modifiers`, payload);
};

/**
 * Update an existing modifier for a product
 * PATCH /products/:productId/modifiers/:modifierId
 * Payload: { name, priceDelta, isRequired }
 */
export const updateModifierApi = async (productId, modifierId, payload) => {
  return apiClient.patch(`/menu/products/${productId}/modifiers/${modifierId}`, payload);
};

/**
 * Delete a modifier for a product
 * DELETE /products/:productId/modifiers/:modifierId
 */
export const deleteModifierApi = async (productId, modifierId) => {
  return apiClient.delete(`/menu/products/${productId}/modifiers/${modifierId}`);
};

// ==================== PUBLIC MENU API ====================

/**
 * Get public menu view (unauthenticated / preview)
 * GET /menu/public/:slug
 */
export const getPublicMenuApi = async ({ slug } = {}) => {
  return apiClient.get('/menu/public', { params: { slug } });
};
