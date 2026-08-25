import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../src/lib/api-client.js';
import { getAuditLogsApi, getAuditLogApi } from '../../src/lib/api/audit-logs.api.js';

vi.mock('../../src/lib/api-client.js', () => ({
  apiClient: { get: vi.fn() },
}));

describe('Module 18 Audit Logs API Layer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getAuditLogsApi should call GET /audit-logs with params', async () => {
    apiClient.get.mockResolvedValueOnce({ items: [] });
    await getAuditLogsApi({ page: 1, limit: 20, action: 'ORDER_CANCELLED', entityType: 'order' });
    expect(apiClient.get).toHaveBeenCalledWith('/audit-logs', {
      params: { page: 1, limit: 20, action: 'ORDER_CANCELLED', entityType: 'order' },
    });
  });

  it('getAuditLogApi should call GET /audit-logs/:id', async () => {
    apiClient.get.mockResolvedValueOnce({ id: 'a1' });
    await getAuditLogApi('a1');
    expect(apiClient.get).toHaveBeenCalledWith('/audit-logs/a1');
  });
});
