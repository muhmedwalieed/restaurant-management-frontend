import { apiClient } from '../api-client.js';

/**
 * Staff: start a table ordering session (returns a 4-digit PIN).
 * POST /tables/start  { tableId }  (tableId can be the table id or QR token)
 */
export const startTableSessionApi = async (tableId) => {
  return apiClient.post('/tables/start', { tableId });
};

/**
 * Customer: join a session with name + PIN.
 * POST /sessions/:qrToken/join  { name, pin }
 */
export const joinTableSessionApi = async (qrToken, payload) => {
  return apiClient.post(`/sessions/${qrToken}/join`, payload);
};

/**
 * Customer/staff: get the session state (members + items).
 * GET /sessions/:id
 */
export const getTableSessionApi = async (sessionId) => {
  return apiClient.get(`/sessions/${sessionId}`);
};

/**
 * Customer: add an item to the shared cart.
 * POST /sessions/:id/items  { productId, quantity, addedByName }
 */
export const addSessionItemApi = async (sessionId, payload) => {
  return apiClient.post(`/sessions/${sessionId}/items`, payload);
};

export const updateSessionItemApi = async (sessionId, itemId, quantity) => {
  return apiClient.patch(`/sessions/${sessionId}/items/${itemId}`, { quantity });
};

export const removeSessionItemApi = async (sessionId, itemId) => {
  return apiClient.delete(`/sessions/${sessionId}/items/${itemId}`);
};

export const callWaiterApi = async (sessionId, payload = {}) => {
  return apiClient.post(`/sessions/${sessionId}/call-waiter`, payload);
};

export const submitDraftApi = async (sessionId) => {
  return apiClient.post(`/sessions/${sessionId}/submit`);
};

export const confirmTableSessionApi = async (sessionId) => {
  return apiClient.post(`/tables/${sessionId}/confirm`);
};

export const closeTableSessionApi = async (sessionId) => {
  return apiClient.post(`/tables/${sessionId}/close`);
};

export const regeneratePinApi = async (sessionId) => {
  return apiClient.post(`/tables/${sessionId}/regenerate-pin`);
};

export const getActiveTableSessionApi = async (tableId) => {
  return apiClient.get(`/tables/table/${tableId}/session`);
};

export const listBranchSessionsApi = async () => {
  return apiClient.get('/tables/sessions');
};