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
  addSessionItemStaffApi,
  updateSessionItemStaffApi,
  removeSessionItemStaffApi,
  acceptWaiterCallApi,
  dismissWaiterCallApi,
  regeneratePinApi,
  rejectPendingOrderApi,
  getActiveTableSessionApi,
  listBranchSessionsApi,
  resolveMemberToken,
} from '../../../lib/api/table-sessions.api.js';

export const useTableSessionQuery = (sessionId, memberToken, options = {}) => {
  let token = typeof memberToken === 'string' ? memberToken : null;
  let opt = options;
  if (typeof memberToken === 'object' && memberToken !== null) {
    opt = memberToken;
  }
  const effectiveToken = token || (typeof window !== 'undefined' ? resolveMemberToken() : null);
  const { enabled = true, poll = false } = opt;

  return useQuery({
    queryKey: ['table-session', sessionId, effectiveToken],
    queryFn: () => getTableSessionApi(sessionId, effectiveToken),
    enabled: Boolean(sessionId) && Boolean(effectiveToken) && enabled,
    refetchInterval: poll ? 2500 : false,
    retry: false,
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

export const useBranchSessionsQuery = (branchIdOrPoll = false, pollOption = false) => {
  const branchId = typeof branchIdOrPoll === 'string' ? branchIdOrPoll : null;
  const poll = typeof branchIdOrPoll === 'boolean' ? branchIdOrPoll : Boolean(pollOption);

  return useQuery({
    queryKey: ['table-sessions-branch', branchId],
    queryFn: () => listBranchSessionsApi(branchId),
    refetchInterval: poll ? 4000 : false,
  });
};

export const useJoinTableSession = (qrToken) => {
  return useMutation({
    mutationFn: (payload) => joinTableSessionApi(qrToken, payload),
  });
};

export const useAddSessionItem = (defaultSessionId, defaultMemberToken) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (param) => {
      const sessionId = param?.sessionId || defaultSessionId;
      const memberToken = param?.memberToken || defaultMemberToken;
      const payload = param?.payload || param;
      return addSessionItemApi(sessionId, payload, memberToken);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session'] });
    },
  });
};

export const useUpdateSessionItem = (defaultSessionId, defaultMemberToken) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity, sessionId, memberToken }) =>
      updateSessionItemApi(sessionId || defaultSessionId, itemId, quantity, memberToken || defaultMemberToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session'] });
    },
  });
};

export const useRemoveSessionItem = (defaultSessionId, defaultMemberToken) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (param) => {
      const itemId = typeof param === 'object' && param !== null ? param.itemId : param;
      const sessionId = (typeof param === 'object' && param !== null ? param.sessionId : null) || defaultSessionId;
      const memberToken = (typeof param === 'object' && param !== null ? param.memberToken : null) || defaultMemberToken;
      return removeSessionItemApi(sessionId, itemId, memberToken);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session'] });
    },
  });
};

export const useUpdateSessionItemStaff = (defaultSessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, itemId, quantity }) =>
      updateSessionItemStaffApi(sessionId || defaultSessionId, itemId, quantity),
    onSuccess: (res, variables) => {
      const sid = variables?.sessionId || defaultSessionId;
      qc.invalidateQueries({ queryKey: ['table-session'] });
      qc.invalidateQueries({ queryKey: ['table-session-active'] });
      qc.invalidateQueries({ queryKey: ['table-sessions-branch'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      if (sid) qc.invalidateQueries({ queryKey: ['table-session', sid] });
    },
  });
};

export const useRemoveSessionItemStaff = (defaultSessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (param) => {
      const itemId = typeof param === 'object' && param !== null ? param.itemId : param;
      const sessionId = (typeof param === 'object' && param !== null ? param.sessionId : null) || defaultSessionId;
      return removeSessionItemStaffApi(sessionId, itemId);
    },
    onSuccess: (res, variables) => {
      const sid = typeof variables === 'object' ? variables?.sessionId : defaultSessionId;
      qc.invalidateQueries({ queryKey: ['table-session'] });
      qc.invalidateQueries({ queryKey: ['table-session-active'] });
      qc.invalidateQueries({ queryKey: ['table-sessions-branch'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      if (sid) qc.invalidateQueries({ queryKey: ['table-session', sid] });
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
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tableId) => startTableSessionApi(tableId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-sessions-branch'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};

export const useRegeneratePin = (defaultSessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId) => regeneratePinApi(sessionId || defaultSessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session'] });
      qc.invalidateQueries({ queryKey: ['table-session-active'] });
      qc.invalidateQueries({ queryKey: ['table-sessions-branch'] });
    },
  });
};

export const useConfirmTableSession = (defaultSessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (param) => {
      const sessionId = typeof param === 'object' && param !== null
        ? (param.sessionId || param.id)
        : (param || defaultSessionId);
      return confirmTableSessionApi(sessionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session'] });
      qc.invalidateQueries({ queryKey: ['table-session-active'] });
      qc.invalidateQueries({ queryKey: ['table-sessions-branch'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['all-orders'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};

export const useCloseTableSession = (defaultSessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (param) => {
      const sessionId = typeof param === 'object' && param !== null ? (param.sessionId || param.id) : (param || defaultSessionId);
      const payload = typeof param === 'object' && param !== null ? param.payload : undefined;
      return closeTableSessionApi(sessionId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session'] });
      qc.invalidateQueries({ queryKey: ['table-session-active'] });
      qc.invalidateQueries({ queryKey: ['table-sessions-branch'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useRejectPendingOrder = (defaultSessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (param) => {
      const sessionId = typeof param === 'object' && param !== null
        ? (param.sessionId || param.id)
        : (param || defaultSessionId);
      return rejectPendingOrderApi(sessionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session'] });
      qc.invalidateQueries({ queryKey: ['table-session-active'] });
      qc.invalidateQueries({ queryKey: ['table-sessions-branch'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useAddSessionItemsStaff = (defaultSessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, items, payload }) =>
      addSessionItemStaffApi(sessionId || defaultSessionId, payload || { items }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session'] });
      qc.invalidateQueries({ queryKey: ['table-session-active'] });
      qc.invalidateQueries({ queryKey: ['table-sessions-branch'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};

export const useAcceptWaiterCall = (defaultSessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (param) => {
      const sid = typeof param === 'object' && param !== null
        ? (param.sessionId || param.id)
        : (param || defaultSessionId);
      return acceptWaiterCallApi(sid);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session-active'] });
      qc.invalidateQueries({ queryKey: ['table-sessions-branch'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};

export const useDismissWaiterCall = (defaultSessionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (param) => {
      const sid = typeof param === 'object' && param !== null
        ? (param.sessionId || param.id)
        : (param || defaultSessionId);
      return dismissWaiterCallApi(sid);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-session-active'] });
      qc.invalidateQueries({ queryKey: ['table-sessions-branch'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};
