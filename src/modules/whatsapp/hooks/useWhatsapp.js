import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConnectionApi,
  connectConnectionApi,
  updateConnectionApi,
  disconnectConnectionApi,
  sendMessageApi,
  getMessagesApi,
  retryWebhooksApi,
} from '../../../lib/api/whatsapp.api.js';

export const useConnectionQuery = () => {
  return useQuery({
    queryKey: ['whatsapp-connection'],
    queryFn: () => getConnectionApi(),
    retry: false,
  });
};

export const useConnectConnectionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => connectConnectionApi(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['whatsapp-connection'] }),
  });
};

export const useUpdateConnectionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => updateConnectionApi(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['whatsapp-connection'] }),
  });
};

export const useDisconnectConnectionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => disconnectConnectionApi(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['whatsapp-connection'] }),
  });
};

export const useSendMessageMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => sendMessageApi(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['whatsapp-messages'] }),
  });
};

export const useMessagesQuery = (params = {}) => {
  return useQuery({
    queryKey: ['whatsapp-messages', params],
    queryFn: () => getMessagesApi(params),
  });
};

export const useRetryWebhooksMutation = () => {
  return useMutation({ mutationFn: () => retryWebhooksApi() });
};