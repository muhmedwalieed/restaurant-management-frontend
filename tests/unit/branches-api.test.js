import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../src/lib/api-client.js';
import {
  getRestaurantProfileApi,
  updateRestaurantProfileApi,
  updateRestaurantStatusApi,
} from '../../src/lib/api/restaurant.api.js';
import {
  getBranchesApi,
  getBranchByIdApi,
  createBranchApi,
  updateBranchApi,
  getBranchWorkingHoursApi,
  updateBranchWorkingHoursApi,
  getBranchSettingsApi,
  updateBranchSettingsApi,
} from '../../src/lib/api/branches.api.js';

vi.mock('../../src/lib/api-client.js', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Module 3 Restaurant & Branches API Services Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getRestaurantProfileApi should call GET /restaurant', async () => {
    apiClient.get.mockResolvedValueOnce({ id: 'rest-1', name: 'مطعم البرجر' });
    const res = await getRestaurantProfileApi();
    expect(apiClient.get).toHaveBeenCalledWith('/restaurant');
    expect(res.name).toBe('مطعم البرجر');
  });

  it('updateRestaurantProfileApi should call PATCH /restaurant', async () => {
    const payload = { name: 'الاسم الجديد', currency: 'EGP' };
    apiClient.patch.mockResolvedValueOnce({ id: 'rest-1', ...payload });
    const res = await updateRestaurantProfileApi(payload);
    expect(apiClient.patch).toHaveBeenCalledWith('/restaurant', payload);
    expect(res.name).toBe('الاسم الجديد');
  });

  it('updateRestaurantStatusApi should call PATCH /restaurant/status', async () => {
    apiClient.patch.mockResolvedValueOnce({ id: 'rest-1', status: 'INACTIVE' });
    const res = await updateRestaurantStatusApi('INACTIVE');
    expect(apiClient.patch).toHaveBeenCalledWith('/restaurant/status', { status: 'INACTIVE' });
    expect(res.status).toBe('INACTIVE');
  });

  it('getBranchesApi should call GET /branches with params', async () => {
    apiClient.get.mockResolvedValueOnce({ items: [{ id: 'br-1', name: 'فرع 1' }] });
    const res = await getBranchesApi({ status: 'ACTIVE' });
    expect(apiClient.get).toHaveBeenCalledWith('/branches', { params: { status: 'ACTIVE' } });
    expect(res.items.length).toBe(1);
  });

  it('createBranchApi should call POST /branches', async () => {
    const newBranch = { name: 'فرع المعادي', code: 'MD-03', status: 'ACTIVE', isMain: false };
    apiClient.post.mockResolvedValueOnce({ id: 'br-3', ...newBranch });
    const res = await createBranchApi(newBranch);
    expect(apiClient.post).toHaveBeenCalledWith('/branches', newBranch);
    expect(res.id).toBe('br-3');
  });

  it('updateBranchApi should call PATCH /branches/:id', async () => {
    const payload = { name: 'اسم جديد' };
    apiClient.patch.mockResolvedValueOnce({ id: 'br-1', ...payload });
    const res = await updateBranchApi('br-1', payload);
    expect(apiClient.patch).toHaveBeenCalledWith('/branches/br-1', payload);
    expect(res.name).toBe('اسم جديد');
  });

  it('updateBranchWorkingHoursApi should call PUT /branches/:id/working-hours with wrapped payload', async () => {
    const hours = [{ day: 'SAT', openTime: '09:00', closeTime: '23:00', isOpen: true }];
    apiClient.put.mockResolvedValueOnce(hours);
    const res = await updateBranchWorkingHoursApi('br-1', hours);
    expect(apiClient.put).toHaveBeenCalledWith('/branches/br-1/working-hours', { workingHours: hours });
    expect(res).toEqual(hours);
  });

  it('updateBranchSettingsApi should call PUT /branches/:id/settings', async () => {
    const settings = { currency: 'SAR', timezone: 'Asia/Riyadh' };
    apiClient.put.mockResolvedValueOnce(settings);
    const res = await updateBranchSettingsApi('br-1', settings);
    expect(apiClient.put).toHaveBeenCalledWith('/branches/br-1/settings', settings);
    expect(res).toEqual(settings);
  });
});
