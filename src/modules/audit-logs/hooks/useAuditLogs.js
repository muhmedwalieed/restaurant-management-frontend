import { useQuery } from '@tanstack/react-query';
import { getAuditLogsApi } from '../../../lib/api/audit-logs.api.js';

export const useAuditLogsQuery = (params = {}) => {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => getAuditLogsApi(params),
  });
};