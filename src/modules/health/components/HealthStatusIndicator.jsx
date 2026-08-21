import { useQuery } from '@tanstack/react-query';
import { getHealthStatus } from '../../../lib/api/health.api.js';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { Activity, WifiOff } from 'lucide-react';

export const HealthStatusIndicator = () => {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['health-status'],
    queryFn: getHealthStatus,
    refetchInterval: 30000, // 30 seconds periodic check (Technical Note 4)
    retry: 1,
  });

  if (isLoading) {
    return (
      <StatusPill status="neutral" icon={Activity} className="animate-pulse">
        جاري فحص الخادم...
      </StatusPill>
    );
  }

  if (isError) {
    return (
      <StatusPill status="danger" icon={WifiOff} title="تعذر الاتصال بالخادم الرئيسي">
        غير متصل
      </StatusPill>
    );
  }

  // GET /api/health returns { uptime, timestamp }; any successful response means the server is alive
  const statusText = data ? 'الخادم نشط' : 'متصل';

  return (
    <StatusPill status="success" icon={Activity}>
      {statusText}
    </StatusPill>
  );
};
