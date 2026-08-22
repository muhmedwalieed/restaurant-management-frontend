import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConversationsApi,
  getConversationApi,
  handoffConversationApi,
  closeConversationApi,
} from '../../../lib/api/whatsapp.api.js';

export const useConversationsQuery = (params = {}) => {
  return useQuery({
    queryKey: ['whatsapp-conversations', params],
    queryFn: () => getConversationsApi(params),
  });
};

export const useConversationQuery = (id) => {
  return useQuery({
    queryKey: ['whatsapp-conversation', id],
    queryFn: () => getConversationApi(id),
    enabled: Boolean(id),
  });
};

export const useHandoffConversationMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => handoffConversationApi(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      qc.invalidateQueries({ queryKey: ['whatsapp-conversation', id] });
    },
  });
};

export const useCloseConversationMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => closeConversationApi(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      qc.invalidateQueries({ queryKey: ['whatsapp-conversation', id] });
    },
  });
};