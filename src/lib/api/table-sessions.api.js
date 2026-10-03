import { apiClient } from '../api-client.js';

export const resolveMemberToken = (explicitToken) => {
  if (explicitToken) return explicitToken;
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ts_member_')) {
          const val = localStorage.getItem(key);
          if (val) return val;
        }
      }
    } catch (_) { /* localStorage not available (SSR / private mode) */ }
  }
  return null;
};

const authHeaders = (memberToken) => {
  const token = resolveMemberToken(memberToken);
  return {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
};

export const startTableSessionApi = async (tableId) => {
  const actualId = typeof tableId === 'object' && tableId !== null ? (tableId.tableId || tableId.id) : tableId;
  return apiClient.post('/tables/start', { tableId: actualId });
};

export const joinTableSessionApi = async (qrToken, payload) => {
  return apiClient.post(`/sessions/${qrToken}/join`, payload);
};

export const getTableSessionApi = async (sessionId, memberToken) => {
  return apiClient.get(`/sessions/${sessionId}`, authHeaders(memberToken));
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
  const sid = typeof sessionId === 'object' && sessionId !== null
    ? (sessionId.sessionId || sessionId.id)
    : sessionId;
  return apiClient.post(`/tables/${sid}/confirm`);
};

export const closeTableSessionApi = async (sessionId, payload = {}) => {
  const sid = typeof sessionId === 'object' && sessionId !== null
    ? (sessionId.sessionId || sessionId.id)
    : sessionId;
  const actualPayload = typeof sessionId === 'object' && sessionId !== null && sessionId.payload
    ? sessionId.payload
    : (typeof payload === 'object' && payload !== null ? payload : {});
  return apiClient.post(`/tables/${sid}/close`, actualPayload);
};

export const regeneratePinApi = async (sessionId) => {
  const sid = typeof sessionId === 'object' && sessionId !== null
    ? (sessionId.sessionId || sessionId.id)
    : sessionId;
  return apiClient.post(`/tables/${sid}/regenerate-pin`);
};

export const rejectPendingOrderApi = async (sessionId) => {
  const sid = typeof sessionId === 'object' && sessionId !== null
    ? (sessionId.sessionId || sessionId.id)
    : sessionId;
  return apiClient.post(`/tables/${sid}/reject-order`);
};

export const addSessionItemStaffApi = async (sessionId, payload) => {
  const sid = typeof sessionId === 'object' && sessionId !== null
    ? (sessionId.sessionId || sessionId.id)
    : sessionId;
  return apiClient.post(`/tables/${sid}/items`, payload);
};

export const updateSessionItemStaffApi = async (sessionId, itemId, quantity) => {
  const sid = typeof sessionId === 'object' && sessionId !== null
    ? (sessionId.sessionId || sessionId.id)
    : sessionId;
  return apiClient.patch(`/tables/${sid}/items/${itemId}`, { quantity });
};

export const removeSessionItemStaffApi = async (sessionId, itemId) => {
  const sid = typeof sessionId === 'object' && sessionId !== null
    ? (sessionId.sessionId || sessionId.id)
    : sessionId;
  return apiClient.delete(`/tables/${sid}/items/${itemId}`);
};

export const acceptWaiterCallApi = async (sessionId) => {
  const sid = typeof sessionId === 'object' && sessionId !== null
    ? (sessionId.sessionId || sessionId.id)
    : sessionId;
  return apiClient.post(`/tables/${sid}/waiter-call/accept`);
};

export const dismissWaiterCallApi = async (sessionId) => {
  const sid = typeof sessionId === 'object' && sessionId !== null
    ? (sessionId.sessionId || sessionId.id)
    : sessionId;
  return apiClient.post(`/tables/${sid}/waiter-call/dismiss`);
};

export const getActiveTableSessionApi = async (tableId) => {
  return apiClient.get(`/tables/table/${tableId}/session`);
};

export const getTableSessionPinApi = async (tableId) => {
  return apiClient.get(`/tables/table/${tableId}/session-pin`);
};

export const resetTablePinLockoutApi = async (tableId) => {
  return apiClient.post(`/tables/table/${tableId}/reset-pin-lockout`);
};

export const listBranchSessionsApi = async (branchId) => {
  const params = branchId ? { branchId } : {};
  return apiClient.get('/tables/sessions', { params });
};

export const releaseTableApi = async (tableId, payload = {}) => {
  return apiClient.post(`/tables/table/${tableId}/release`, payload);
};