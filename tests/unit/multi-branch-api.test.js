import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../src/lib/api-client.js';
import {
  getMyBranchesApi,
  getBranchUsersApi,
  grantBranchAccessApi,
  revokeBranchAccessApi,
} from '../../src/lib/api/multi-branch.api.js';

vi.mock('../../src/lib/api-client.js', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

describe('Module 19 Multi-Branch API Layer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getMyBranchesApi should call GET /employees/me/branches', async () => {
    apiClient.get.mockResolvedValueOnce([]);
    await getMyBranchesApi();
    expect(apiClient.get).toHaveBeenCalledWith('/employees/me/branches');
  });

  it('getBranchUsersApi should call GET /branches/:branchId/users', async () => {
    apiClient.get.mockResolvedValueOnce([]);
    await getBranchUsersApi('br-1');
    expect(apiClient.get).toHaveBeenCalledWith('/branches/br-1/users');
  });

  it('grantBranchAccessApi should call POST /branches/:branchId/users', async () => {
    apiClient.post.mockResolvedValueOnce({ id: 'x' });
    await grantBranchAccessApi('br-1', 'emp-1');
    expect(apiClient.post).toHaveBeenCalledWith('/branches/br-1/users', { employeeId: 'emp-1' });
  });

  it('revokeBranchAccessApi should call DELETE /branches/:branchId/users/:employeeId', async () => {
    apiClient.delete.mockResolvedValueOnce({ message: 'revoked' });
    await revokeBranchAccessApi('br-1', 'emp-1');
    expect(apiClient.delete).toHaveBeenCalledWith('/branches/br-1/users/emp-1');
  });
});
