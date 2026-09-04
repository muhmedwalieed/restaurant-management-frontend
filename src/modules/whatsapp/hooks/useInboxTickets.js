import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTicketsApi,
  getTicketApi,
  createTicketApi,
  replyTicketApi,
  addTicketNoteApi,
  assignTicketApi,
  resolveTicketApi,
  closeTicketApi,
  submitFeedbackApi,
  takeoverTicketApi,
  returnTicketToAgentApi,
  reassignTicketApi,
} from '../../../lib/api/inbox.api.js';

export const useTicketsQuery = (params = {}) => {
  return useQuery({
    queryKey: ['inbox-tickets', params],
    queryFn: async () => {
      const res = await getTicketsApi(params);
      return res?.data !== undefined ? res.data : res;
    },
  });
};

export const useTicketDetailQuery = (id) => {
  return useQuery({
    queryKey: ['inbox-ticket', id],
    queryFn: async () => {
      const res = await getTicketApi(id);
      return res?.data !== undefined ? res.data : res;
    },
    enabled: Boolean(id),
  });
};

export const useCreateTicketMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createTicketApi(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inbox-tickets'] });
    },
  });
};

export const useReplyTicketMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }) => replyTicketApi(id, { content }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['inbox-ticket', variables.id] });
      qc.invalidateQueries({ queryKey: ['inbox-tickets'] });
    },
  });
};

export const useAddTicketNoteMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }) => addTicketNoteApi(id, { content }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['inbox-ticket', variables.id] });
      qc.invalidateQueries({ queryKey: ['inbox-tickets'] });
    },
  });
};

export const useAssignTicketMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, agentId }) => assignTicketApi(id, { agentId }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['inbox-ticket', variables.id] });
      qc.invalidateQueries({ queryKey: ['inbox-tickets'] });
    },
  });
};

export const useResolveTicketMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => resolveTicketApi(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['inbox-ticket', id] });
      qc.invalidateQueries({ queryKey: ['inbox-tickets'] });
    },
  });
};

export const useCloseTicketMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => closeTicketApi(id, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['inbox-ticket', variables.id] });
      qc.invalidateQueries({ queryKey: ['inbox-tickets'] });
    },
  });
};

export const useSubmitFeedbackMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => submitFeedbackApi(id, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['inbox-ticket', variables.id] });
      qc.invalidateQueries({ queryKey: ['inbox-tickets'] });
    },
  });
};

export const useTakeoverTicketMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => takeoverTicketApi(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['inbox-ticket', id] });
      qc.invalidateQueries({ queryKey: ['inbox-tickets'] });
    },
  });
};

export const useReturnTicketToAgentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => returnTicketToAgentApi(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['inbox-ticket', id] });
      qc.invalidateQueries({ queryKey: ['inbox-tickets'] });
    },
  });
};

export const useReassignTicketMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, agentId }) => reassignTicketApi(id, { agentId }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['inbox-ticket', variables.id] });
      qc.invalidateQueries({ queryKey: ['inbox-tickets'] });
    },
  });
};
