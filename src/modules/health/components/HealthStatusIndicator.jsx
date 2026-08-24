import { useQuery } from '@tanstack/react-query';
import { getHealthStatus } from '../../../lib/api/health.api.js';

export const HealthStatusIndicator = ({ showLabel = false }) => {
  const { isError, isLoading } = useQuery({
    queryKey: ['health-status'],
    queryFn: getHealthStatus,
    refetchInterval: 30000, // 30 seconds periodic check (Technical Note 4)
    retry: 1,
  });

  if (isLoading) {
    return (
      <span
        className="inline-flex items-center gap-2 text-xs text-txt-muted"
        title="جاري فحص الخادم..."
        aria-label="جاري فحص الخادم"
      >
        <span className="w-2 h-2 rounded-full bg-txt-muted animate-pulse" aria-hidden="true" />
        {showLabel && <span>جاري فحص الخادم...</span>}
      </span>
    );
  }

  if (isError) {
    return (
      <span
        className="inline-flex items-center gap-2 text-xs text-txt-muted"
        title="تعذر الاتصال بالخادم الرئيسي"
        aria-label="غير متصل بالخادم"
      >
        <span className="w-2 h-2 rounded-full bg-status-danger" aria-hidden="true" />
        {showLabel && <span>غير متصل</span>}
      </span>
    );
  }

  // GET /api/health returns { uptime, timestamp }; any successful response means the server is alive
  return (
    <span
      className="inline-flex items-center gap-2 text-xs text-txt-muted"
      title="متصل بالخادم"
      aria-label="متصل بالخادم"
    >
      <span className="w-2 h-2 rounded-full bg-status-success" aria-hidden="true" />
      {showLabel && <span>متصل بالخادم</span>}
    </span>
  );
};