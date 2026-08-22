import { useQuery } from '@tanstack/react-query';
import { getAuditLogsApi, getAuditLogApi } from '../../../lib/api/audit-logs.api.js';

export const useAuditLogsQuery = (params = {}) => {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => getAuditLogsApi(params),
  });
};

export const useAuditLogQuery = (id) => {
  return useQuery({
    queryKey: ['audit-log', id],
    queryFn: () => getAuditLogApi(id),
    enabled: Boolean(id),
  });
};