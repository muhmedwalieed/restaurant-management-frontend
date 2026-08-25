import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../src/lib/api-client.js';
import {
  getCouponsApi,
  getCouponApi,
  createCouponApi,
  updateCouponApi,
  deleteCouponApi,
  validateCouponApi,
} from '../../src/lib/api/coupons.api.js';

vi.mock('../../src/lib/api-client.js', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe('Module 16 Coupons API Layer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getCouponsApi should call GET /coupons with params', async () => {
    apiClient.get.mockResolvedValueOnce({ items: [] });
    await getCouponsApi({ page: 1, limit: 20, type: 'PERCENTAGE', q: 'save' });
    expect(apiClient.get).toHaveBeenCalledWith('/coupons', { params: { page: 1, limit: 20, type: 'PERCENTAGE', q: 'save' } });
  });

  it('getCouponApi should call GET /coupons/:id', async () => {
    apiClient.get.mockResolvedValueOnce({ id: 'c1' });
    await getCouponApi('c1');
    expect(apiClient.get).toHaveBeenCalledWith('/coupons/c1');
  });

  it('createCouponApi should call POST /coupons', async () => {
    apiClient.post.mockResolvedValueOnce({ id: 'c1' });
    await createCouponApi({ code: 'SAVE10', type: 'PERCENTAGE', value: 10 });
    expect(apiClient.post).toHaveBeenCalledWith('/coupons', { code: 'SAVE10', type: 'PERCENTAGE', value: 10 });
  });

  it('updateCouponApi should call PATCH /coupons/:id', async () => {
    apiClient.patch.mockResolvedValueOnce({ id: 'c1' });
    await updateCouponApi('c1', { value: 15 });
    expect(apiClient.patch).toHaveBeenCalledWith('/coupons/c1', { value: 15 });
  });

  it('deleteCouponApi should call DELETE /coupons/:id', async () => {
    apiClient.delete.mockResolvedValueOnce({ message: 'deleted' });
    await deleteCouponApi('c1');
    expect(apiClient.delete).toHaveBeenCalledWith('/coupons/c1');
  });

  it('validateCouponApi should call POST /coupons/validate', async () => {
    apiClient.post.mockResolvedValueOnce({ discountAmount: 25 });
    await validateCouponApi({ code: 'save10', subtotal: 250, items: [{ productId: 'p1', subtotal: 250 }] });
    expect(apiClient.post).toHaveBeenCalledWith('/coupons/validate', {
      code: 'save10',
      subtotal: 250,
      items: [{ productId: 'p1', subtotal: 250 }],
    });
  });
});
