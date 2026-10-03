import React, { useState, useEffect, useCallback } from 'react';
import {
  Bike,
  Clock,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  LogOut,
  RefreshCw,
  Wallet,
  Coins,
} from 'lucide-react';
import { useTheme } from '../../../../shared/context/ThemeContext.jsx';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';

export const DeliveryNavHeader = ({
  user,
  activeBranch,
  walletData,
  onRefresh,
  isFetching = false,
  onOpenWallet,
  onLogout,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { currency } = useCurrency();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeStr, setTimeStr] = useState(() =>
    new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const remainingCash = Number(walletData?.remainingToSettle || 0);

  return (
    <header className="h-14 px-3 sm:px-6 flex items-center justify-between gap-2 shrink-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors">
      {/* ── Right Section (RTL): Branch & Live Delivery Stats ── */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Bike size={20} />
        </div>
        <div className="flex flex-col justify-center min-w-0 pb-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold truncate max-w-[120px] sm:max-w-[220px] md:max-w-[320px] leading-tight text-zinc-900 dark:text-zinc-100">
              {activeBranch?.name || 'الفرع الرئيسي'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-sm" title="متصل بالخادم" />
          </div>
          <div className="text-xs flex items-center gap-1.5 mt-0.5 leading-tight text-zinc-500 dark:text-zinc-400 font-normal">
            <Clock size={12} className="shrink-0 text-zinc-400 dark:text-zinc-500" />
            <span>{timeStr}</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 mr-2 pr-2 border-r border-zinc-200 dark:border-zinc-800">
              <span>تطبيق التوصيل</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Center: COD Wallet Quick Pill ── */}
      <button
        type="button"
        onClick={onOpenWallet}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-all cursor-pointer shadow-xs active:scale-95"
        title="عرض تفاصيل العهدة النقدية"
      >
        <Coins size={16} className="shrink-0 animate-bounce" />
        <div className="flex items-center gap-1 text-xs">
          <span className="font-semibold hidden xs:inline">عهدتي:</span>
          <span className="font-mono font-black text-sm">
            {remainingCash.toFixed(2)}
          </span>
          <span className="text-[11px] font-normal">{currency}</span>
        </div>
      </button>

      {/* ── Left Section (RTL): Actions & Profile ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-700 dark:text-zinc-300 active:scale-95 cursor-pointer border border-zinc-200 dark:border-zinc-800 disabled:opacity-50"
            title="تحديث الطلبات"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
          </button>
        )}

        <button
          type="button"
          onClick={toggleFullscreen}
          className="hidden sm:flex w-10 h-10 rounded-xl items-center justify-center transition-all bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-700 dark:text-zinc-300 active:scale-95 cursor-pointer border border-zinc-200 dark:border-zinc-800"
          title={isFullscreen ? 'إلغاء ملء الشاشة' : 'ملء الشاشة'}
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-700 dark:text-zinc-300 active:scale-95 cursor-pointer border border-zinc-200 dark:border-zinc-800"
          title={isDark ? 'التحويل إلى الوضع النهاري' : 'التحويل إلى الوضع الليلي'}
        >
          {isDark ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} />}
        </button>

        <div className="hidden md:flex items-center gap-2 h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold">
            {(user?.name || 'ط')[0]}
          </div>
          <div className="flex flex-col justify-center leading-none">
            <span className="text-xs font-semibold max-w-[90px] truncate text-zinc-900 dark:text-zinc-100">
              {user?.name || 'مندوب التوصيل'}
            </span>
            <span className="text-[10px] font-normal mt-0.5 text-zinc-500 dark:text-zinc-400">
              توصيل الطلبات
            </span>
          </div>
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-800 active:scale-95 cursor-pointer"
            title="تسجيل الخروج"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </header>
  );
};

export default DeliveryNavHeader;
