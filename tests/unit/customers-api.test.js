import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../src/lib/api-client.js';
import {
  getCustomersApi,
  getCustomerByIdApi,
  createCustomerApi,
  updateCustomerApi,
  deleteCustomerApi,
  getCustomerOrdersApi,
  getCustomerAddressesApi,
  createAddressApi,
  updateAddressApi,
  deleteAddressApi,
} from '../../src/lib/api/customers.api.js';

vi.mock('../../src/lib/api-client.js', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe('Module 7 Customers API Layer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getCustomersApi should call GET /customers with params', async () => {
    apiClient.get.mockResolvedValueOnce({ items: [] });
    await getCustomersApi({ page: 1, limit: 10, q: 'ali' });
    expect(apiClient.get).toHaveBeenCalledWith('/customers', { params: { page: 1, limit: 10, q: 'ali' } });
  });

  it('getCustomerByIdApi should call GET /customers/:id', async () => {
    apiClient.get.mockResolvedValueOnce({ id: 'c1' });
    await getCustomerByIdApi('c1');
    expect(apiClient.get).toHaveBeenCalledWith('/customers/c1');
  });

  it('createCustomerApi should call POST /customers', async () => {
    apiClient.post.mockResolvedValueOnce({ id: 'c2' });
    await createCustomerApi({ name: 'Ali', phone: '+201' });
    expect(apiClient.post).toHaveBeenCalledWith('/customers', { name: 'Ali', phone: '+201' });
  });

  it('updateCustomerApi should call PATCH /customers/:id', async () => {
    apiClient.patch.mockResolvedValueOnce({ id: 'c1', name: 'Ali2' });
    await updateCustomerApi('c1', { name: 'Ali2' });
    expect(apiClient.patch).toHaveBeenCalledWith('/customers/c1', { name: 'Ali2' });
  });

  it('deleteCustomerApi should call DELETE /customers/:id', async () => {
    apiClient.delete.mockResolvedValueOnce({ message: 'deleted' });
    await deleteCustomerApi('c1');
    expect(apiClient.delete).toHaveBeenCalledWith('/customers/c1');
  });

  it('getCustomerOrdersApi should call GET /customers/:id/orders', async () => {
    apiClient.get.mockResolvedValueOnce({ items: [] });
    await getCustomerOrdersApi('c1', { page: 1 });
    expect(apiClient.get).toHaveBeenCalledWith('/customers/c1/orders', { params: { page: 1 } });
  });

  it('addresses CRUD should call the right endpoints', async () => {
    apiClient.get.mockResolvedValueOnce([]);
    await getCustomerAddressesApi('c1');
    expect(apiClient.get).toHaveBeenCalledWith('/customers/c1/addresses');

    apiClient.post.mockResolvedValueOnce({ id: 'a1' });
    await createAddressApi('c1', { label: 'HOME', street: 'St' });
    expect(apiClient.post).toHaveBeenCalledWith('/customers/c1/addresses', { label: 'HOME', street: 'St' });

    apiClient.patch.mockResolvedValueOnce({ id: 'a1' });
    await updateAddressApi('c1', 'a1', { city: 'Cairo' });
    expect(apiClient.patch).toHaveBeenCalledWith('/customers/c1/addresses/a1', { city: 'Cairo' });

    apiClient.delete.mockResolvedValueOnce({ message: 'deleted' });
    await deleteAddressApi('c1', 'a1');
    expect(apiClient.delete).toHaveBeenCalledWith('/customers/c1/addresses/a1');
  });
});
