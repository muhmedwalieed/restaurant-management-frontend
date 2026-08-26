import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../src/lib/api-client.js';
import { getKdsOrdersApi, updateKdsOrderStatusApi } from '../../src/lib/api/orders.api.js';

vi.mock('../../src/lib/api-client.js', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe('Module 6 KDS API Layer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getKdsOrdersApi should call GET /branches/:branchId/kds/orders with params', async () => {
    apiClient.get.mockResolvedValueOnce({ items: [] });
    await getKdsOrdersApi('br-1', { page: 1, limit: 20, status: 'PREPARING' });
    expect(apiClient.get).toHaveBeenCalledWith('/branches/br-1/kds/orders', {
      params: { page: 1, limit: 20, status: 'PREPARING' },
    });
  });

  it('updateKdsOrderStatusApi should call PATCH /branches/:branchId/kds/orders/:id/status', async () => {
    apiClient.patch.mockResolvedValueOnce({ id: 'o1', status: 'PREPARING' });
    await updateKdsOrderStatusApi('br-1', 'o1', { newStatus: 'PREPARING', expectedVersion: 1 });
    expect(apiClient.patch).toHaveBeenCalledWith('/branches/br-1/kds/orders/o1/status', {
      newStatus: 'PREPARING',
      expectedVersion: 1,
    });
  });
});
