import { apiClient } from '../api-client.js';

/**
 * Get WhatsApp connection for the tenant
 * GET /v1/whatsapp/connection
 */
export const getConnectionApi = async () => {
  return apiClient.get('/whatsapp/connection');
};

/**
 * Connect a WhatsApp account
 * POST /v1/whatsapp/connection
 * Payload: { provider, providerAccountId, providerPhoneNumberId, displayName?, webhookSecret? }
 */
export const connectConnectionApi = async (payload) => {
  return apiClient.post('/whatsapp/connection', payload);
};

/**
 * Update WhatsApp connection (status / displayName / secret rotation)
 * PATCH /v1/whatsapp/connection
 */
export const updateConnectionApi = async (payload) => {
  return apiClient.patch('/whatsapp/connection', payload);
};

/**
 * Disconnect WhatsApp (soft — status DISCONNECTED)
 * DELETE /v1/whatsapp/connection
 */
export const disconnectConnectionApi = async () => {
  return apiClient.delete('/whatsapp/connection');
};

/**
 * Send an outgoing WhatsApp message
 * POST /v1/whatsapp/messages
 * Payload: { to, text, type? }
 */
export const sendMessageApi = async (payload) => {
  return apiClient.post('/whatsapp/messages', payload);
};

/**
 * List WhatsApp messages with filters & pagination
 * GET /v1/whatsapp/messages?page=&limit=&direction=&status=&q=
 */
export const getMessagesApi = async (params = {}) => {
  return apiClient.get('/whatsapp/messages', { params });
};

/**
 * Retry failed webhook events
 * POST /v1/whatsapp/webhooks/retry
 */
export const retryWebhooksApi = async () => {
  return apiClient.post('/whatsapp/webhooks/retry');
};

/**
 * List WhatsApp automation conversations
 * GET /v1/whatsapp/conversations?page=&limit=&status=
 */
export const getConversationsApi = async (params = {}) => {
  return apiClient.get('/whatsapp/conversations', { params });
};

/**
 * Get a single conversation
 * GET /v1/whatsapp/conversations/:id
 */
export const getConversationApi = async (id) => {
  return apiClient.get(`/whatsapp/conversations/${id}`);
};

/**
 * Force human handoff (status -> WAITING_AGENT)
 * POST /v1/whatsapp/conversations/:id/handoff
 */
export const handoffConversationApi = async (id) => {
  return apiClient.post(`/whatsapp/conversations/${id}/handoff`);
};

/**
 * Close a conversation (status -> CLOSED)
 * POST /v1/whatsapp/conversations/:id/close
 */
export const closeConversationApi = async (id) => {
  return apiClient.post(`/whatsapp/conversations/${id}/close`);
};