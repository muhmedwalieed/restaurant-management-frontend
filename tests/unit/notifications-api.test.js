import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../src/lib/api-client.js';
import {
  getNotificationsApi,
  getUnreadCountApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  getNotificationPreferencesApi,
  updateNotificationPreferencesApi,
} from '../../src/lib/api/notifications.api.js';

vi.mock('../../src/lib/api-client.js', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn() },
}));

describe('Module 17 Notifications API Layer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getNotificationsApi should call GET /notifications with params', async () => {
    apiClient.get.mockResolvedValueOnce({ items: [] });
    await getNotificationsApi({ page: 1, limit: 20, unreadOnly: true });
    expect(apiClient.get).toHaveBeenCalledWith('/notifications', { params: { page: 1, limit: 20, unreadOnly: true } });
  });

  it('getUnreadCountApi should call GET /notifications/unread-count', async () => {
    apiClient.get.mockResolvedValueOnce({ count: 3 });
    await getUnreadCountApi();
    expect(apiClient.get).toHaveBeenCalledWith('/notifications/unread-count');
  });

  it('markNotificationReadApi should call PATCH /notifications/:id/read', async () => {
    apiClient.patch.mockResolvedValueOnce({});
    await markNotificationReadApi('n1');
    expect(apiClient.patch).toHaveBeenCalledWith('/notifications/n1/read');
  });

  it('markAllNotificationsReadApi should call POST /notifications/read-all', async () => {
    apiClient.post.mockResolvedValueOnce({ updatedCount: 2 });
    await markAllNotificationsReadApi();
    expect(apiClient.post).toHaveBeenCalledWith('/notifications/read-all');
  });

  it('getNotificationPreferencesApi should call GET /notifications/preferences', async () => {
    apiClient.get.mockResolvedValueOnce({ disabledTypes: [] });
    await getNotificationPreferencesApi();
    expect(apiClient.get).toHaveBeenCalledWith('/notifications/preferences');
  });

  it('updateNotificationPreferencesApi should call PUT /notifications/preferences', async () => {
    apiClient.put.mockResolvedValueOnce({ disabledTypes: ['ORDER_CREATED'] });
    await updateNotificationPreferencesApi({ disabledTypes: ['ORDER_CREATED'] });
    expect(apiClient.put).toHaveBeenCalledWith('/notifications/preferences', { disabledTypes: ['ORDER_CREATED'] });
  });
});