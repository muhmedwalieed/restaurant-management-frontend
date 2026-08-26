import { apiClient } from '../api-client.js';

const authHeaders = (memberToken) => ({
  headers: memberToken ? { Authorization: `Bearer ${memberToken}` } : {},
});

export const startTableSessionApi = async (tableId) => {
  return apiClient.post('/tables/start', { tableId });
};

export const joinTableSessionApi = async (qrToken, payload) => {
  return apiClient.post(`/sessions/${qrToken}/join`, payload);
};

export const getTableSessionApi = async (sessionId) => {
  return apiClient.get(`/sessions/${sessionId}`);
};

export const addSessionItemApi = async (sessionId, payload, memberToken) => {
  return apiClient.post(`/sessions/${sessionId}/items`, payload, authHeaders(memberToken));
};

export const updateSessionItemApi = async (sessionId, itemId, quantity, memberToken) => {
  return apiClient.patch(`/sessions/${sessionId}/items/${itemId}`, { quantity }, authHeaders(memberToken));
};

export const removeSessionItemApi = async (sessionId, itemId, memberToken) => {
  return apiClient.delete(`/sessions/${sessionId}/items/${itemId}`, authHeaders(memberToken));
};

export const callWaiterApi = async (sessionId, payload = {}, memberToken) => {
  return apiClient.post(`/sessions/${sessionId}/call-waiter`, payload, authHeaders(memberToken));
};

export const submitDraftApi = async (sessionId, memberToken) => {
  return apiClient.post(`/sessions/${sessionId}/submit`, undefined, authHeaders(memberToken));
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

export const rejectPendingOrderApi = async (sessionId) => {
  return apiClient.post(`/tables/${sessionId}/reject-order`);
};

export const updateSessionItemStaffApi = async (sessionId, itemId, quantity) => {
  return apiClient.patch(`/tables/${sessionId}/items/${itemId}`, { quantity });
};

export const removeSessionItemStaffApi = async (sessionId, itemId) => {
  return apiClient.delete(`/tables/${sessionId}/items/${itemId}`);
};

export const getActiveTableSessionApi = async (tableId) => {
  return apiClient.get(`/tables/table/${tableId}/session`);
};

export const listBranchSessionsApi = async () => {
  return apiClient.get('/tables/sessions');
};