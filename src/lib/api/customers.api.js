import { apiClient } from '../api-client.js';

/**
 * List customers with search & pagination
 * GET /customers?page=&limit=&q=
 */
export const getCustomersApi = async (params = {}) => {
  return apiClient.get('/customers', { params });
};

/**
 * Get customer by id
 * GET /customers/:id
 */
export const getCustomerByIdApi = async (id) => {
  return apiClient.get(`/customers/${id}`);
};

/**
 * Create a customer
 * POST /customers
 * Payload: { firstName, lastName?, phone, phones?, notes? }
 */
export const createCustomerApi = async (payload) => {
  return apiClient.post('/customers', payload);
};

/**
 * Update a customer
 * PATCH /customers/:id
 * Payload: { firstName?, lastName?, phone?, phones?, notes? }
 */
export const updateCustomerApi = async (id, payload) => {
  return apiClient.patch(`/customers/${id}`, payload);
};

/**
 * Soft delete a customer
 * DELETE /customers/:id
 */
export const deleteCustomerApi = async (id) => {
  return apiClient.delete(`/customers/${id}`);
};

/**
 * Customer order history
 * GET /customers/:id/orders
 */
export const getCustomerOrdersApi = async (id, params = {}) => {
  return apiClient.get(`/customers/${id}/orders`, { params });
};

/**
 * List customer addresses
 * GET /customers/:id/addresses
 */
export const getCustomerAddressesApi = async (id) => {
  return apiClient.get(`/customers/${id}/addresses`);
};

/**
 * Add a customer address
 * POST /customers/:id/addresses
 * Payload: { label?, street?, city?, state?, postalCode?, isDefault? }
 */
export const createAddressApi = async (customerId, payload) => {
  return apiClient.post(`/customers/${customerId}/addresses`, payload);
};

/**
 * Update a customer address
 * PATCH /customers/:id/addresses/:addressId
 */
export const updateAddressApi = async (customerId, addressId, payload) => {
  return apiClient.patch(`/customers/${customerId}/addresses/${addressId}`, payload);
};

/**
 * Soft delete a customer address
 * DELETE /customers/:id/addresses/:addressId
 */
export const deleteAddressApi = async (customerId, addressId) => {
  return apiClient.delete(`/customers/${customerId}/addresses/${addressId}`);
};