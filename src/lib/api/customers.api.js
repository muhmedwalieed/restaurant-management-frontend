import { apiClient } from '../api-client.js';

export const getCustomersApi = async (params = {}) => {
  return apiClient.get('/customers', { params });
};

export const getCustomerByIdApi = async (id) => {
  return apiClient.get(`/customers/${id}`);
};

export const createCustomerApi = async (payload) => {
  return apiClient.post('/customers', payload);
};

export const updateCustomerApi = async (id, payload) => {
  return apiClient.patch(`/customers/${id}`, payload);
};

export const deleteCustomerApi = async (id) => {
  return apiClient.delete(`/customers/${id}`);
};

export const getCustomerOrdersApi = async (id, params = {}) => {
  return apiClient.get(`/customers/${id}/orders`, { params });
};

export const getCustomerAddressesApi = async (id) => {
  return apiClient.get(`/customers/${id}/addresses`);
};

export const createAddressApi = async (customerId, payload) => {
  return apiClient.post(`/customers/${customerId}/addresses`, payload);
};

export const updateAddressApi = async (customerId, addressId, payload) => {
  return apiClient.patch(`/customers/${customerId}/addresses/${addressId}`, payload);
};

export const deleteAddressApi = async (customerId, addressId) => {
  return apiClient.delete(`/customers/${customerId}/addresses/${addressId}`);
};
