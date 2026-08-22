import { apiClient } from '../api-client.js';

/**
 * List my notifications (self-scoped) with pagination + filters
 * GET /notifications?page=&limit=&unreadOnly=&type=
 */
export const getNotificationsApi = async (params = {}) => {
  return apiClient.get('/notifications', { params });
};

/**
 * Unread notifications count
 * GET /notifications/unread-count
 */
export const getUnreadCountApi = async () => {
  return apiClient.get('/notifications/unread-count');
};

/**
 * Mark one notification as read
 * PATCH /notifications/:id/read
 */
export const markNotificationReadApi = async (id) => {
  return apiClient.patch(`/notifications/${id}/read`);
};

/**
 * Mark all my notifications as read
 * POST /notifications/read-all
 */
export const markAllNotificationsReadApi = async () => {
  return apiClient.post('/notifications/read-all');
};

/**
 * Get my notification preferences
 * GET /notifications/preferences
 */
export const getNotificationPreferencesApi = async () => {
  return apiClient.get('/notifications/preferences');
};

/**
 * Update my notification preferences
 * PUT /notifications/preferences
 * Payload: { disabledTypes: string[] }
 */
export const updateNotificationPreferencesApi = async (payload) => {
  return apiClient.put('/notifications/preferences', payload);
};