import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../src/lib/api-client.js';
import { createPosOrderApi, processPaymentApi, processRefundApi } from '../../src/lib/api/orders.api.js';

vi.mock('../../src/lib/api-client.js', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe('Module 8 POS & Payment API Layer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('createPosOrderApi should call POST /branches/:branchId/pos/orders with idempotency header', async () => {
    apiClient.post.mockResolvedValueOnce({ id: 'o1', orderNumber: 1001 });
    await createPosOrderApi('br-1', { type: 'DINE_IN', tableId: 't1', items: [{ productId: 'p1', quantity: 2 }] }, 'pos-key');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/branches/br-1/pos/orders',
      { type: 'DINE_IN', tableId: 't1', items: [{ productId: 'p1', quantity: 2 }] },
      { headers: { 'Idempotency-Key': 'pos-key' } }
    );
  });

  it('processPaymentApi should call POST /branches/:branchId/orders/:id/payment', async () => {
    apiClient.post.mockResolvedValueOnce({ id: 'o1', paymentStatus: 'PAID' });
    await processPaymentApi('br-1', 'o1', { paymentMethod: 'CASH', expectedVersion: 1 });
    expect(apiClient.post).toHaveBeenCalledWith('/branches/br-1/orders/o1/payment', {
      paymentMethod: 'CASH',
      expectedVersion: 1,
    });
  });

  it('processRefundApi should call POST /branches/:branchId/orders/:id/refund', async () => {
    apiClient.post.mockResolvedValueOnce({ id: 'o1', paymentStatus: 'REFUNDED' });
    await processRefundApi('br-1', 'o1', { expectedVersion: 1, reason: 'wrong item' });
    expect(apiClient.post).toHaveBeenCalledWith('/branches/br-1/orders/o1/refund', {
      expectedVersion: 1,
      reason: 'wrong item',
    });
  });
});
