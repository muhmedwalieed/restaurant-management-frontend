import { apiClient } from '../api-client.js';

export const getConnectionApi = async () => {
  return apiClient.get('/whatsapp/connection');
};

export const connectConnectionApi = async (payload) => {
  return apiClient.post('/whatsapp/connection', payload);
};

export const updateConnectionApi = async (payload) => {
  return apiClient.patch('/whatsapp/connection', payload);
};

export const disconnectConnectionApi = async () => {
  return apiClient.delete('/whatsapp/connection');
};

export const sendMessageApi = async (payload) => {
  return apiClient.post('/whatsapp/messages', payload);
};

export const getMessagesApi = async (params = {}) => {
  return apiClient.get('/whatsapp/messages', { params });
};

export const retryWebhooksApi = async () => {
  return apiClient.post('/whatsapp/webhooks/retry');
};

export const getConversationsApi = async (params = {}) => {
  return apiClient.get('/whatsapp/conversations', { params });
};

export const getConversationApi = async (id) => {
  return apiClient.get(`/whatsapp/conversations/${id}`);
};

export const handoffConversationApi = async (id) => {
  return apiClient.post(`/whatsapp/conversations/${id}/handoff`);
};

export const closeConversationApi = async (id) => {
  return apiClient.post(`/whatsapp/conversations/${id}/close`);
};
