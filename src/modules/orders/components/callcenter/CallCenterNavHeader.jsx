import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PhoneCall,
  ShoppingCart,
  ClipboardList,
  Store,
  Clock,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  LogOut,
  ChevronDown,
  User,
  Headphones,
} from 'lucide-react';
import { useTheme } from '../../../../shared/context/ThemeContext.jsx';
import { useSocket } from '../../../../shared/realtime/SocketProvider.jsx';

const NAV_ITEMS = [
  { id: 'sales', label: 'تسجيل الطلبات', Icon: ShoppingCart },
  { id: 'orders', label: 'الطلبات', Icon: ClipboardList },
];

export const CallCenterNavHeader = ({
  activeTab,
  onSelectTab,
  activeBranch,
  user,
  onLogout,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { isConnected } = useSocket();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  const [timeStr, setTimeStr] = useState(() =>
    new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      setTimeStr(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
    };
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Track fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
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
    <header className="h-14 sm:h-16 w-full bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-3 shrink-0 z-30 transition-colors" dir="rtl">
      {/* ── Zone 1 (Right - RTL): Branch & Live Connection Status ── */}
      <div className="flex items-center gap-2 min-w-0 max-w-[180px] sm:max-w-[240px] md:max-w-[300px] lg:max-w-[340px]">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 shadow-2xs">
          <PhoneCall size={15} />
        </div>
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span
            className="text-xs sm:text-sm font-bold truncate text-zinc-900 dark:text-zinc-100"
            title={activeBranch?.name || 'الفرع الرئيسي'}
          >
            {activeBranch?.name || 'الفرع الرئيسي'}
          </span>
          <span
            className={`w-2 h-2 rounded-full shrink-0 transition-all ${
              isConnected
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)] animate-pulse'
            }`}
            title={isConnected ? 'متصل بالسيرفر' : 'غير متصل بالسيرفر'}
          />
        </div>

        {/* Digital Clock Badge */}
        <div className="hidden 2xl:flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono shrink-0 mr-1">
          <Clock size={13} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
          <span>{timeStr}</span>
        </div>
      </div>

      {/* ── Zone 2 (Center): Primary Call Center Navigation Tabs ── */}
      <div className="flex items-center justify-center shrink-0">
        <nav className="bg-zinc-100/90 dark:bg-zinc-900/90 p-1 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-0.5 sm:gap-1 shadow-2xs">
          {NAV_ITEMS.map((item) => {
            const Icon = item.Icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                aria-label={item.label}
                title={item.label}
                className={`h-8 sm:h-9 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white shadow-xs border border-zinc-900 dark:border-zinc-700/80'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/40 border border-transparent'
                }`}
              >
                <Icon size={14} strokeWidth={isActive ? 2.2 : 1.8} className="shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Zone 3 (Left - RTL): User Profile & Quick Controls ── */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Unified User Profile & Quick Actions Menu */}
        <div className="relative" ref={userDropdownRef}>
          <button
            type="button"
            onClick={() => setIsUserDropdownOpen((prev) => !prev)}
            className="h-8 sm:h-9 px-2 sm:px-2.5 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            title="الحساب والإعدادات"
          >
            {/* Avatar Initial */}
            <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
              {(user?.name || 'س')[0]}
            </div>

            {/* Agent Name */}
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 hidden md:inline max-w-[100px] truncate">
              {user?.name || 'كول سنتر'}
            </span>

            {/* Chevron */}
            <ChevronDown
              size={13}
              className={`text-zinc-500 dark:text-zinc-400 transition-transform duration-200 ${
                isUserDropdownOpen ? 'rotate-180 text-zinc-900 dark:text-zinc-100' : ''
              }`}
            />
          </button>

          {/* User Profile & Actions Dropdown */}
          {isUserDropdownOpen && (
            <div
              className="absolute top-full left-0 z-50 w-56 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 rounded-2xl shadow-2xl p-1.5 space-y-1 mt-2 text-right text-xs animate-scaleUp"
              dir="rtl"
            >
              {/* User Info Card */}
              <div className="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-850/60 flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs bg-zinc-800 text-zinc-200 border border-zinc-700 shrink-0">
                  {(user?.name || 'س')[0]}
                </div>
                <div className="truncate">
                  <p className="font-bold text-zinc-100 truncate text-xs">{user?.name || 'خدمة العملاء'}</p>
                  <p className="text-[10px] text-zinc-400 font-medium">خدمة العملاء / كول سنتر</p>
                </div>
              </div>

              {/* Utility Toggles */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full px-2.5 py-2 rounded-lg text-right flex items-center justify-between text-xs text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {isDark ? <Sun size={15} className="text-amber-400 shrink-0" /> : <Moon size={15} className="text-indigo-400 shrink-0" />}
                  <span>{isDark ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">{isDark ? 'Light' : 'Dark'}</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="w-full px-2.5 py-2 rounded-lg text-right flex items-center justify-between text-xs text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {isFullscreen ? <Minimize2 size={15} className="text-zinc-400 shrink-0" /> : <Maximize2 size={15} className="text-zinc-400 shrink-0" />}
                  <span>{isFullscreen ? 'إلغاء ملء الشاشة' : 'ملء الشاشة'}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">F11</span>
              </button>

              {/* Divider */}
              <div className="border-t border-zinc-850 my-1" />

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => {
                  setIsUserDropdownOpen(false);
                  onLogout?.();
                }}
                className="w-full px-2.5 py-2 rounded-lg text-right flex items-center gap-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
              >
                <LogOut size={15} className="text-rose-400 shrink-0" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CallCenterNavHeader;
