import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../src/lib/api-client.js';
import {
  getOrdersApi,
  getOrderByIdApi,
  createOrderApi,
  updateOrderStatusApi,
  cancelOrderApi,
  getOrderHistoryApi,
  createPublicOrderApi,
  trackOrderApi,
} from '../../src/lib/api/orders.api.js';

vi.mock('../../src/lib/api-client.js', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe('Module 6 Orders API Layer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getOrdersApi should call GET /branches/:branchId/orders with params', async () => {
    apiClient.get.mockResolvedValueOnce({ items: [] });
    await getOrdersApi('br-1', { page: 1, limit: 10, status: 'PENDING' });
    expect(apiClient.get).toHaveBeenCalledWith('/branches/br-1/orders', {
      params: { page: 1, limit: 10, status: 'PENDING' },
    });
  });

  it('getOrderByIdApi should call GET /branches/:branchId/orders/:id', async () => {
    apiClient.get.mockResolvedValueOnce({ id: 'o1' });
    await getOrderByIdApi('br-1', 'o1');
    expect(apiClient.get).toHaveBeenCalledWith('/branches/br-1/orders/o1');
  });

  it('createOrderApi should call POST /branches/:branchId/orders with idempotency header', async () => {
    apiClient.post.mockResolvedValueOnce({ id: 'o2' });
    await createOrderApi('br-1', { type: 'DINE_IN', items: [{ productId: 'p1', quantity: 1 }] }, 'key-1');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/branches/br-1/orders',
      { type: 'DINE_IN', items: [{ productId: 'p1', quantity: 1 }] },
      { headers: { 'Idempotency-Key': 'key-1' } }
    );
  });

  it('updateOrderStatusApi should call PATCH /branches/:branchId/orders/:id/status', async () => {
    apiClient.patch.mockResolvedValueOnce({ id: 'o1', status: 'PREPARING' });
    await updateOrderStatusApi('br-1', 'o1', { newStatus: 'PREPARING', expectedVersion: 1 });
    expect(apiClient.patch).toHaveBeenCalledWith('/branches/br-1/orders/o1/status', {
      newStatus: 'PREPARING',
      expectedVersion: 1,
    });
  });

  it('cancelOrderApi should call POST /branches/:branchId/orders/:id/cancel', async () => {
    apiClient.post.mockResolvedValueOnce({ id: 'o1', status: 'CANCELLED' });
    await cancelOrderApi('br-1', 'o1', { expectedVersion: 1, reason: 'test' });
    expect(apiClient.post).toHaveBeenCalledWith('/branches/br-1/orders/o1/cancel', {
      expectedVersion: 1,
      reason: 'test',
    });
  });

  it('getOrderHistoryApi should call GET /branches/:branchId/orders/:id/history', async () => {
    apiClient.get.mockResolvedValueOnce([]);
    await getOrderHistoryApi('br-1', 'o1');
    expect(apiClient.get).toHaveBeenCalledWith('/branches/br-1/orders/o1/history');
  });
});
  it('createPublicOrderApi should call POST /orders/public with idempotency header', async () => {
    apiClient.post.mockResolvedValueOnce({ id: 'o1', orderNumber: 1001 });
    await createPublicOrderApi({ restaurantId: 'r1', type: 'DELIVERY', items: [{ productId: 'p1', quantity: 1 }] }, 'web-1');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/orders/public',
      { restaurantId: 'r1', type: 'DELIVERY', items: [{ productId: 'p1', quantity: 1 }] },
      { headers: { 'Idempotency-Key': 'web-1' } }
    );
  });

  it('trackOrderApi should call GET /orders/track with params', async () => {
    apiClient.get.mockResolvedValueOnce({ orderNumber: 1001, status: 'PREPARING' });
    await trackOrderApi({ slug: 'rest', orderNumber: 1001, phone: '+2010' });
    expect(apiClient.get).toHaveBeenCalledWith('/orders/track', { params: { slug: 'rest', orderNumber: 1001, phone: '+2010' } });
  });
