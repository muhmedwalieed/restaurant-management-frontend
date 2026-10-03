import React, { useState, useEffect, useCallback } from 'react';
import { Store, Clock, Sun, Moon, Maximize2, Minimize2, LogOut } from 'lucide-react';
import { useTheme } from '../../../../shared/context/ThemeContext.jsx';

export const WaiterHeader = ({
  user,
  activeBranch,
  totalTables = 0,
  occupiedCount = 0,
  alertsCount = 0,
  onLogout,
}) => {
  const { isDark, toggleTheme } = useTheme();
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

  return (
    <header
      className="h-14 px-3 sm:px-6 flex items-center justify-between gap-2 shrink-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors"
    >
      {/* ── Right Section (RTL): Branch / Meta Info ── */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
        >
          <Store size={16} />
        </div>
        <div className="flex flex-col justify-center min-w-0 pb-1">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-semibold truncate max-w-[90px] sm:max-w-[200px] md:max-w-[320px] leading-tight text-zinc-900 dark:text-zinc-100"
            >
              {activeBranch?.name || 'الفرع الرئيسي'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-sm" title="متصل" />
          </div>
          <div
            className="text-xs flex items-center gap-1.5 mt-0.5 leading-tight text-zinc-500 dark:text-zinc-400 font-normal"
          >
            <Clock size={12} className="shrink-0 text-zinc-400 dark:text-zinc-500" />
            <span>{timeStr}</span>
            <span className="hidden md:inline-flex items-center gap-1 mr-2 pr-2 border-r border-zinc-200 dark:border-zinc-800">
              <span className="w-1 h-1 rounded-full bg-zinc-400" />
              {occupiedCount} / {totalTables} طاولة مشغولة
              {alertsCount > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-amber-600 dark:text-amber-400 font-bold">{alertsCount} تنبيه</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ── Center: empty — keeps header balanced like POS (no labels) ── */}
      <div className="hidden md:block flex-1" />

      {/* ── Left Section (RTL): Touch Targets & Waiter Info ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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

        <div
          className="hidden md:flex items-center gap-2.5 h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80"
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center font-medium text-xs shrink-0 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
          >
            {(user?.name || 'و')[0]}
          </div>
          <div className="flex flex-col justify-center leading-none">
            <span className="text-xs font-semibold max-w-[90px] truncate text-zinc-900 dark:text-zinc-100">
              {user?.name || 'الويتر'}
            </span>
            <span className="text-[10px] font-normal mt-0.5 text-zinc-500 dark:text-zinc-400">
              خدمة الصالة
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-800 active:scale-95 cursor-pointer"
          title="تسجيل الخروج"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
};

export default WaiterHeader;
