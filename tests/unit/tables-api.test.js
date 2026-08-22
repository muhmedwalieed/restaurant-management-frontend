import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../src/lib/api-client.js';
import {
  getTablesApi,
  getTableByIdApi,
  createTableApi,
  updateTableApi,
  deleteTableApi,
  regenerateQrApi,
  getTableMenuApi,
} from '../../src/lib/api/tables.api.js';

vi.mock('../../src/lib/api-client.js', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Module 5 Tables & QR API Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getTablesApi should call GET /branches/:branchId/tables with params', async () => {
    apiClient.get.mockResolvedValueOnce({ items: [], pagination: {} });
    await getTablesApi('br-1', { page: 1, limit: 10, status: 'AVAILABLE' });
    expect(apiClient.get).toHaveBeenCalledWith('/branches/br-1/tables', {
      params: { page: 1, limit: 10, status: 'AVAILABLE' },
    });
  });

  it('getTableByIdApi should call GET /branches/:branchId/tables/:id', async () => {
    apiClient.get.mockResolvedValueOnce({ id: 'tbl-1' });
    await getTableByIdApi('br-1', 'tbl-1');
    expect(apiClient.get).toHaveBeenCalledWith('/branches/br-1/tables/tbl-1');
  });

  it('createTableApi should call POST /branches/:branchId/tables', async () => {
    apiClient.post.mockResolvedValueOnce({ id: 'tbl-2' });
    await createTableApi('br-1', { label: 'T1', capacity: 4, status: 'AVAILABLE' });
    expect(apiClient.post).toHaveBeenCalledWith('/branches/br-1/tables', {
      label: 'T1',
      capacity: 4,
      status: 'AVAILABLE',
    });
  });

  it('updateTableApi should call PATCH /branches/:branchId/tables/:id', async () => {
    apiClient.patch.mockResolvedValueOnce({ id: 'tbl-1' });
    await updateTableApi('br-1', 'tbl-1', { capacity: 6 });
    expect(apiClient.patch).toHaveBeenCalledWith('/branches/br-1/tables/tbl-1', { capacity: 6 });
  });

  it('deleteTableApi should call DELETE /branches/:branchId/tables/:id', async () => {
    apiClient.delete.mockResolvedValueOnce({ message: 'deleted' });
    await deleteTableApi('br-1', 'tbl-1');
    expect(apiClient.delete).toHaveBeenCalledWith('/branches/br-1/tables/tbl-1');
  });

  it('regenerateQrApi should call POST /branches/:branchId/tables/:id/regenerate-qr', async () => {
    apiClient.post.mockResolvedValueOnce({ qrToken: 'new-token' });
    await regenerateQrApi('br-1', 'tbl-1');
    expect(apiClient.post).toHaveBeenCalledWith('/branches/br-1/tables/tbl-1/regenerate-qr');
  });

  it('getTableMenuApi should call GET /menu/table/:qrToken', async () => {
    apiClient.get.mockResolvedValueOnce({ categories: [] });
    await getTableMenuApi('abc123');
    expect(apiClient.get).toHaveBeenCalledWith('/menu/table/abc123');
  });
});