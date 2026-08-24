import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotificationsApi,
  getUnreadCountApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  getNotificationPreferencesApi,
  updateNotificationPreferencesApi,
} from '../../../lib/api/notifications.api.js';

export const useNotificationsQuery = (params = {}) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => getNotificationsApi(params),
  });
};

export const useUnreadCountQuery = () => {
  return useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => getUnreadCountApi(),
  });
};

export const useMarkNotificationReadMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => markNotificationReadApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
};

export const useMarkAllNotificationsReadMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsReadApi(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
};

export const useNotificationPreferencesQuery = () => {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => getNotificationPreferencesApi(),
  });
};

export const useUpdateNotificationPreferencesMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => updateNotificationPreferencesApi(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });
};