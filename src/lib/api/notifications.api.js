import { apiClient } from '../api-client.js';

export const getNotificationsApi = async (params = {}) => {
  return apiClient.get('/notifications', { params });
};

export const getUnreadCountApi = async () => {
  return apiClient.get('/notifications/unread-count');
};

export const markNotificationReadApi = async (id) => {
  return apiClient.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsReadApi = async () => {
  return apiClient.post('/notifications/read-all');
};

export const getNotificationPreferencesApi = async () => {
  return apiClient.get('/notifications/preferences');
};

export const updateNotificationPreferencesApi = async (payload) => {
  return apiClient.put('/notifications/preferences', payload);
};
