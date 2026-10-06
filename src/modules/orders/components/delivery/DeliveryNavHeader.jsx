import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  ChevronDown,
  User,
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const [timeStr, setTimeStr] = useState(() =>
    new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  );

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close profile dropdown on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const rawDriverName = user?.name || 'الطيار';
  const cleanDriverName = rawDriverName.replace(/\s*\(.*?\)\s*/g, ' ').trim() || rawDriverName;
  const remainingCash = Number(walletData?.remainingToSettle || 0);
  const inTransitCash = Number(walletData?.inTransitAmount || 0);
  const totalCustody = walletData?.totalCustody !== undefined ? Number(walletData.totalCustody) : (remainingCash + inTransitCash);
  const displayCash = totalCustody;

  return (
    <header className="h-14 sm:h-16 px-3 sm:px-5 flex items-center justify-between gap-2 shrink-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors">
      {/* ── Right Section (RTL): Branch & Live Delivery Info ── */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 max-w-[150px] sm:max-w-[240px] md:max-w-[320px]">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 shadow-2xs">
          <Bike size={16} />
        </div>
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs sm:text-sm font-bold truncate leading-tight text-zinc-900 dark:text-zinc-100"
              title={activeBranch?.name || 'الفرع الرئيسي'}
            >
              {activeBranch?.name || 'الفرع الرئيسي'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-sm" title="متصل" />
          </div>
          <div className="text-[11px] flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-normal">
            <Clock size={11} className="shrink-0 text-zinc-400 dark:text-zinc-500" />
            <span className="font-mono">{timeStr}</span>
            <span className="hidden md:inline-flex items-center gap-1.5 mr-1 pr-1 border-r border-zinc-200 dark:border-zinc-800">
              <span>تطبيق التوصيل</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Center: COD Wallet Quick Pill ── */}
      <button
        type="button"
        onClick={onOpenWallet}
        className="h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/90 dark:bg-zinc-900/90 hover:bg-zinc-200 dark:hover:bg-zinc-850 text-zinc-900 dark:text-zinc-100 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 sm:gap-2 shrink-0"
        title={
          inTransitCash > 0
            ? `العهدة المحصلة: ${remainingCash.toFixed(2)} | قيد التوصيل: ${inTransitCash.toFixed(2)}`
            : 'اضغط لعرض وتصفية العهدة النقدية'
        }
      >
        <Wallet size={14} className="text-amber-500 shrink-0" />
        <div className="flex items-center gap-1 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400 font-medium hidden xs:inline">العهدة:</span>
          <span className="font-mono font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400">
            {displayCash.toFixed(2)}
          </span>
          <span className="text-[10px] text-zinc-500 font-normal">{currency}</span>
        </div>
      </button>

      {/* ── Left Section (RTL): Refresh & Unified Driver Dropdown ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-700 dark:text-zinc-300 active:scale-95 cursor-pointer border border-zinc-200 dark:border-zinc-800 disabled:opacity-50 shadow-2xs shrink-0"
            title="تحديث الطلبات"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </button>
        )}

        {/* Unified Profile & Settings Dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-98"
            title="الحساب والإعدادات"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center font-bold text-[10px] sm:text-[11px] shrink-0 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200">
              {(cleanDriverName || 'ط')[0]}
            </div>
            <span className="text-xs font-bold truncate max-w-[70px] sm:max-w-[100px] hidden xs:inline">
              {cleanDriverName}
            </span>
            <ChevronDown
              size={13}
              className={`text-zinc-400 transition-transform duration-200 ${
                isProfileOpen ? 'rotate-180 text-zinc-900 dark:text-zinc-100' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div
              className="absolute top-full left-0 z-50 w-56 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-1.5 space-y-1 mt-2 text-right text-xs animate-scaleUp"
              dir="rtl"
            >
              {/* Driver Info Header */}
              <div className="p-2.5 bg-zinc-900/70 rounded-xl border border-zinc-800/80 flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs bg-zinc-800 text-zinc-200 border border-zinc-700 shrink-0">
                  {(cleanDriverName || 'ط')[0]}
                </div>
                <div className="truncate">
                  <p className="font-bold text-zinc-100 truncate text-xs">{cleanDriverName}</p>
                  <p className="text-[10px] text-zinc-400 font-medium">مندوب التوصيل</p>
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full px-2.5 py-2 rounded-lg text-right flex items-center justify-between text-xs text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {isDark ? <Sun size={14} className="text-amber-400 shrink-0" /> : <Moon size={14} className="text-indigo-400 shrink-0" />}
                  <span>{isDark ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">{isDark ? 'Light' : 'Dark'}</span>
              </button>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="w-full px-2.5 py-2 rounded-lg text-right flex items-center justify-between text-xs text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {isFullscreen ? <Minimize2 size={14} className="text-zinc-400 shrink-0" /> : <Maximize2 size={14} className="text-zinc-400 shrink-0" />}
                  <span>{isFullscreen ? 'إلغاء ملء الشاشة' : 'ملء الشاشة'}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">F11</span>
              </button>

              {/* Divider */}
              <div className="border-t border-zinc-850 my-1" />

              {/* Logout Button */}
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full px-2.5 py-2 rounded-lg text-right flex items-center gap-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <LogOut size={14} className="text-rose-400 shrink-0" />
                  <span>تسجيل الخروج</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DeliveryNavHeader;
