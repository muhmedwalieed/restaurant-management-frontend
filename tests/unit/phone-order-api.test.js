import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../src/lib/api-client.js';
import { lookupCallerApi, createPhoneOrderApi } from '../../src/lib/api/phone-order.api.js';

vi.mock('../../src/lib/api-client.js', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe('Module 14 Phone Ordering API Layer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lookupCallerApi should call POST /phone-order/lookup', async () => {
    apiClient.post.mockResolvedValueOnce({ customer: { phone: '+2010' }, recentOrders: [] });
    await lookupCallerApi('+201012345678');
    expect(apiClient.post).toHaveBeenCalledWith('/phone-order/lookup', { phone: '+201012345678' });
  });

  it('createPhoneOrderApi should call POST /phone-order/branches/:branchId/orders', async () => {
    apiClient.post.mockResolvedValueOnce({ id: 'o1', orderNumber: 1001 });
    await createPhoneOrderApi('br-1', { type: 'DELIVERY', customerPhone: '+2010', items: [{ productId: 'p1', quantity: 1 }] });
    expect(apiClient.post).toHaveBeenCalledWith('/phone-order/branches/br-1/orders', {
      type: 'DELIVERY',
      customerPhone: '+2010',
      items: [{ productId: 'p1', quantity: 1 }],
    });
  });
});
