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
  updateSessionItemStaffApi,
  removeSessionItemStaffApi,
  acceptWaiterCallApi,
  dismissWaiterCallApi,
  regeneratePinApi,
  rejectPendingOrderApi,
  getActiveTableSessionApi,
  listBranchSessionsApi,
} from '../../../lib/api/table-sessions.api.js';

export const useTableSessionQuery = (sessionId, options = {}) => {
  const { enabled = true, poll = false } = options;
  return useQuery({
    queryKey: ['table-session', sessionId],
    queryFn: () => getTableSessionApi(sessionId),
    enabled: Boolean(sessionId) && enabled,
    refetchInterval: poll ? 2500 : false,
  });
};

export const useActiveTableSessionQuery = (tableId, poll = false) => {
  return useQuery({
    queryKey: ['table-session-active', tableId],
    queryFn: () => getActiveTableSessionApi(tableId),
    enabled: Boolean(tableId),
    refetchInterval: poll ? 3000 : false,
  });
};

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

export const useAddSessionItem = (sessionId, memberToken) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => addSessionItemApi(sessionId, payload, memberToken),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['table-session', sessionId] }),
  });
};

export const useUpdateSessionItem = (sessionId, memberToken) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }) => updateSessionItemApi(sessionId, itemId, quantity, memberToken),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['table-session', sessionId] }),
  });
};

export const useRemoveSessionItem = (sessionId, memberToken) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => removeSessionItemApi(sessionId, itemId, memberToken),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['table-session', sessionId] }),
  });
};

export const useUpdateSessionItemStaff = (sessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }) => updateSessionItemStaffApi(sessionId, itemId, quantity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session-active'] });
      qc.invalidateQueries({ queryKey: ['table-session', sessionId] });
    },
  });
};

export const useRemoveSessionItemStaff = (sessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => removeSessionItemStaffApi(sessionId, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session-active'] });
      qc.invalidateQueries({ queryKey: ['table-session', sessionId] });
    },
  });
};

export const useCallWaiter = (sessionId, memberToken) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload = {}) => callWaiterApi(sessionId, payload, memberToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session', sessionId] });
    },
  });
};

export const useSubmitDraft = (sessionId, memberToken) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => submitDraftApi(sessionId, memberToken),
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

export const useRejectPendingOrder = (sessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => rejectPendingOrderApi(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session', sessionId] });
      qc.invalidateQueries({ queryKey: ['table-session-active'] });
    },
  });
};

export const useAcceptWaiterCall = (sessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => acceptWaiterCallApi(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session-active'] });
      qc.invalidateQueries({ queryKey: ['table-sessions-branch'] });
    },
  });
};

export const useDismissWaiterCall = (sessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => dismissWaiterCallApi(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session-active'] });
      qc.invalidateQueries({ queryKey: ['table-sessions-branch'] });
    },
  });
};
