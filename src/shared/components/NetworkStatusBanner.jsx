import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export const NetworkStatusBanner = () => {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [showRestored, setShowRestored] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const queryClient = useQueryClient();

  const checkRealConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch('/api/v1/health', {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok || res.status < 500;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const handleOnline = async () => {
      const isActuallyOnline = await checkRealConnection();
      if (isActuallyOnline) {
        setIsOnline(true);
        setShowRestored(true);
        queryClient.invalidateQueries();
        const timer = setTimeout(() => {
          setShowRestored(false);
        }, 2500);
        return () => clearTimeout(timer);
      } else {
        setIsOnline(false);
        setShowRestored(false);
      }
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
      const isReachable = await checkRealConnection();
      if (isReachable) {
        setIsOnline(true);
        setShowRestored(true);
        queryClient.invalidateQueries();
        setTimeout(() => setShowRestored(false), 2500);
      } else {
        setIsOnline(false);
        setShowRestored(false);
      }
    } catch {
      setIsOnline(false);
      setShowRestored(false);
    } finally {
      setIsRetrying(false);
    }
  };

  if (isOnline && !showRestored) return null;

  return (
    <div className="fixed top-2 inset-x-0 z-[9999] pointer-events-none flex justify-center px-4 transition-all duration-300">
      {!isOnline ? (
        <div
          className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-2 text-xs font-bold rounded-2xl shadow-2xl border animate-in slide-in-from-top duration-200 max-w-md w-full"
          style={{
            background: '#141418',
            borderColor: 'rgba(239, 68, 68, 0.35)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 20px -5px rgba(239, 68, 68, 0.2)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <WifiOff size={13} className="animate-pulse" />
            </span>
            <span className="truncate text-[12px] text-zinc-200">
              تعذر الاتصال بالشبكة، جاري إعادة المحاولة...
            </span>
          </div>
          <button
            type="button"
            onClick={handleManualRetry}
            disabled={isRetrying}
            className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 active:scale-95 transition-all rounded-xl font-black text-[11px] cursor-pointer"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
            }}
          >
            <RefreshCw size={11} className={isRetrying ? 'animate-spin' : ''} />
            <span>{isRetrying ? 'جاري الفحص...' : 'إعادة المحاولة'}</span>
          </button>
        </div>
      ) : showRestored ? (
        <div
          className="pointer-events-auto flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-2xl shadow-2xl border animate-in slide-in-from-top fade-in duration-200"
          style={{
            background: '#141418',
            borderColor: 'rgba(16, 185, 129, 0.35)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 20px -5px rgba(16, 185, 129, 0.2)',
          }}
        >
          <span className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Wifi size={13} />
          </span>
          <span className="text-emerald-300 text-[12px]">تم استعادة الاتصال بالإنترنت بنجاح.</span>
        </div>
      ) : null}
    </div>
  );
};

export default NetworkStatusBanner;
