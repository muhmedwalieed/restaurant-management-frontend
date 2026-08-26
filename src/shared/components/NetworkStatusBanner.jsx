import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export const NetworkStatusBanner = () => {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [showRestored, setShowRestored] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      queryClient.invalidateQueries();
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);

  const handleManualRetry = async () => {
    setIsRetrying(true);
    try {
      await queryClient.refetchQueries({ type: 'active' });
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        setIsOnline(true);
        setShowRestored(true);
        setTimeout(() => setShowRestored(false), 3000);
      }
    } catch {
      // ignore
    } finally {
      setIsRetrying(false);
    }
  };

  if (isOnline && !showRestored) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[9999] pointer-events-none flex justify-center p-2.5 transition-all duration-300">
      {!isOnline ? (
        <div className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-2 bg-status-danger/95 backdrop-blur-md text-white text-xs font-semibold rounded-xl shadow-xl border border-red-400/30 animate-in slide-in-from-top duration-300 max-w-md w-full">
          <div className="flex items-center gap-2 min-w-0">
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-red-200" />
            <span className="truncate">انقطع الاتصال بالإنترنت، بنحاول نعيد الاتصال...</span>
          </div>
          <button
            type="button"
            onClick={handleManualRetry}
            disabled={isRetrying}
            className="flex items-center gap-1 shrink-0 px-2.5 py-1 bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-lg font-bold text-[11px]"
          >
            <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'جارٍ الفحص...' : 'إعادة المحاولة'}</span>
          </button>
        </div>
      ) : showRestored ? (
        <div className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-status-success/95 backdrop-blur-md text-slate-950 text-xs font-bold rounded-xl shadow-xl border border-emerald-400/30 animate-in slide-in-from-top fade-in duration-300">
          <Wifi className="w-4 h-4 text-emerald-950" />
          <span>تم استعادة الاتصال بالإنترنت وتحديث البيانات.</span>
        </div>
      ) : null}
    </div>
  );
};

export default NetworkStatusBanner;
