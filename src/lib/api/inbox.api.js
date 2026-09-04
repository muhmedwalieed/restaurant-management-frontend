import { apiClient } from '../api-client.js';

export const getTicketsApi = async (params = {}) => {
  return apiClient.get('/inbox/conversations', { params });
};

export const getTicketApi = async (id) => {
  return apiClient.get(`/inbox/conversations/${id}`);
};

export const createTicketApi = async (payload) => {
  return apiClient.post('/inbox/conversations', payload);
};

export const replyTicketApi = async (id, payload) => {
  return apiClient.post(`/inbox/conversations/${id}/reply`, payload);
};

export const addTicketNoteApi = async (id, payload) => {
  return apiClient.post(`/inbox/conversations/${id}/note`, payload);
};

export const assignTicketApi = async (id, payload = {}) => {
  return apiClient.post(`/inbox/conversations/${id}/assign`, payload);
};

export const resolveTicketApi = async (id) => {
  return apiClient.post(`/inbox/conversations/${id}/resolve`);
};

export const closeTicketApi = async (id, payload = {}) => {
  return apiClient.post(`/inbox/conversations/${id}/close`, payload);
};

export const submitFeedbackApi = async (id, payload) => {
  return apiClient.post(`/inbox/conversations/${id}/feedback`, payload);
};

export const takeoverTicketApi = async (id) => {
  return apiClient.post(`/inbox/conversations/${id}/takeover`);
};

export const returnTicketToAgentApi = async (id) => {
  return apiClient.post(`/inbox/conversations/${id}/return`);
};

export const reassignTicketApi = async (id, payload) => {
  return apiClient.post(`/inbox/conversations/${id}/reassign`, payload);
};
