import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTableSessionApi,
  joinTableSessionApi,
  addSessionItemApi,
  updateSessionItemApi,
  removeSessionItemApi,
  callWaiterApi,
  submitDraftApi,
  startTableSessionApi,
  confirmTableSessionApi,
  closeTableSessionApi,
  regeneratePinApi,
  getActiveTableSessionApi,
  listBranchSessionsApi,
} from '../../../lib/api/table-sessions.api.js';

/**
 * Session state for the shared table cart. Public customers aren't on the socket,
 * so we poll every ~2.5s for near-real-time updates. Staff use the same key and
 * get socket-driven invalidation from SocketProvider too.
 */
export const useTableSessionQuery = (sessionId, options = {}) => {
  const { enabled = true, poll = true } = options;
  return useQuery({
    queryKey: ['table-session', sessionId],
    queryFn: () => getTableSessionApi(sessionId),
    enabled: Boolean(sessionId) && enabled,
    refetchInterval: poll ? 2500 : false,
  });
};

/** Staff: the active session for a specific table (or null). */
export const useActiveTableSessionQuery = (tableId, poll = false) => {
  return useQuery({
    queryKey: ['table-session-active', tableId],
    queryFn: () => getActiveTableSessionApi(tableId),
    enabled: Boolean(tableId),
    refetchInterval: poll ? 3000 : false,
  });
};

/** Staff: live sessions in the current branch. */
export const useBranchSessionsQuery = (poll = false) => {
  return useQuery({
    queryKey: ['table-sessions-branch'],
    queryFn: () => listBranchSessionsApi(),
    refetchInterval: poll ? 4000 : false,
  });
};

export const useJoinTableSession = (qrToken) => {
  return useMutation({
    mutationFn: (payload) => joinTableSessionApi(qrToken, payload),
  });
};

export const useAddSessionItem = (sessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => addSessionItemApi(sessionId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['table-session', sessionId] }),
  });
};

export const useUpdateSessionItem = (sessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }) => updateSessionItemApi(sessionId, itemId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['table-session', sessionId] }),
  });
};

export const useRemoveSessionItem = (sessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => removeSessionItemApi(sessionId, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['table-session', sessionId] }),
  });
};

export const useCallWaiter = (sessionId) => {
  return useMutation({
    mutationFn: (payload = {}) => callWaiterApi(sessionId, payload),
  });
};

export const useSubmitDraft = (sessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => submitDraftApi(sessionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['table-session', sessionId] }),
  });
};

export const useStartTableSession = () => {
  return useMutation({ mutationFn: (tableId) => startTableSessionApi(tableId) });
};

export const useRegeneratePin = (sessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => regeneratePinApi(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session', sessionId] });
      qc.invalidateQueries({ queryKey: ['table-session-active'] });
    },
  });
};

export const useConfirmTableSession = (sessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => confirmTableSessionApi(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session', sessionId] });
      qc.invalidateQueries({ queryKey: ['table-session-active'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['all-orders'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};

export const useCloseTableSession = (sessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => closeTableSessionApi(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session', sessionId] });
      qc.invalidateQueries({ queryKey: ['table-session-active'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};