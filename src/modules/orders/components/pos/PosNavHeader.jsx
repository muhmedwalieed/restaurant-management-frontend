import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ShoppingCart,
  ClipboardList,
  LayoutGrid,
  LogOut,
  Maximize2,
  Minimize2,
  Store,
  Clock,
  Sun,
  Moon,
  Bike,
  ChevronDown,
  FileText,
  BarChart3,
  ArrowDownUp,
  History,
  Coins,
  Layers,
  Lock,
  User,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../../../shared/context/ThemeContext.jsx';
import { useSocket } from '../../../../shared/realtime/SocketProvider.jsx';
import { useAuth } from '../../../auth/context/AuthContext.jsx';

const NAV_ITEMS = [
  { id: 'sales', label: 'شاشة البيع', Icon: ShoppingCart },
  { id: 'orders', label: 'الطلبات', Icon: ClipboardList },
  { id: 'tables', label: 'الطاولات', Icon: LayoutGrid },
];

export const PosNavHeader = ({
  activeTab,
  onSelectTab,
  activeBranch,
  user,
  activeShift,
  onOpenStartShift,
  onOpenDriverSettlement,
  onOpenHandoverModal,
  pendingHandoversCount = 0,
  onOpenXReport,
  onOpenCashMovement,
  onOpenCloseShift,
  onNavigateShifts,
  onLogout,
  currency = 'ج.م',
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { isConnected } = useSocket();
  const { hasPermission } = useAuth();
  const canViewShiftsHistory = hasPermission(['shifts.view', 'dashboard.view']);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Dropdown States
  const [isShiftDropdownOpen, setIsShiftDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const shiftDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  const [timeStr, setTimeStr] = useState(() =>
    new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  );

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shiftDropdownRef.current && !shiftDropdownRef.current.contains(event.target)) {
        setIsShiftDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsShiftDropdownOpen(false);
        setIsUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live digital clock
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
    <header className="h-14 sm:h-16 w-full bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-3 shrink-0 z-30 transition-colors">
      {/* ── Zone 1 (Right - RTL): Branch & Connection Status ── */}
      <div className="flex items-center gap-2 min-w-0 max-w-[160px] sm:max-w-[220px] md:max-w-[260px] lg:max-w-[320px]">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 shadow-2xs">
          <Store size={15} />
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

      {/* ── Zone 2 (Center): Primary POS Navigation Tabs ── */}
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
                className={`h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
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

      {/* ── Zone 3 (Left - RTL): Streamlined Shift Capsule & Unified Profile Menu ── */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* 0. Pending Delivery Handover Alert Pill (if any driver requested handover) */}
        {pendingHandoversCount > 0 && (
          <button
            type="button"
            onClick={onOpenHandoverModal || onOpenDriverSettlement}
            className="h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 animate-pulse"
            title="هناك طلب استلام أوردر من الطيار بانتظار الموافقة"
          >
            <Bike size={14} className="shrink-0" />
            <span className="hidden md:inline">طلب دليفري</span>
            <span className="font-mono text-xs px-1.5 py-0.2 rounded-md bg-amber-500/20 border border-amber-500/30">
              {pendingHandoversCount}
            </span>
          </button>
        )}

        {/* 1. Shift Capsule & Dropdown */}
        <div className="relative" ref={shiftDropdownRef}>
          {activeShift ? (
            <button
              type="button"
              onClick={() => {
                setIsShiftDropdownOpen((prev) => !prev);
                setIsUserDropdownOpen(false);
              }}
              className="h-8 sm:h-9 px-2 sm:px-3 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              title="إدارة الوردية الحالية"
            >
              {/* Active Green Dot */}
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </span>

              {/* Shift Title */}
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                الوردية
              </span>

              {/* Chevron */}
              <ChevronDown
                size={13}
                className={`text-zinc-500 dark:text-zinc-400 transition-transform duration-200 ${
                  isShiftDropdownOpen ? 'rotate-180 text-zinc-900 dark:text-zinc-100' : ''
                }`}
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenStartShift}
              className="h-8 sm:h-9 px-2 sm:px-3 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
              title="فتح وردية عمل جديدة"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span>افتح وردية</span>
            </button>
          )}

          {/* Shift Dropdown Menu */}
          {isShiftDropdownOpen && activeShift && (
            <div
              className="absolute top-full left-0 z-50 w-64 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 rounded-2xl shadow-2xl p-1.5 space-y-1 mt-2 text-right text-xs animate-scaleUp"
              dir="rtl"
            >
              {/* Header Card with Shift #, Cashier, Start Time, and Drawer Balance */}
              <div className="p-3 bg-zinc-900/70 rounded-xl border border-zinc-850/80 mb-1.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-100">وردية #{activeShift.shiftNumber}</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>نشطة الآن</span>
                  </span>
                </div>

                {/* Cash Balance in Drawer */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[11px] text-zinc-400">النقدية بالدرج:</span>
                  <span className="text-xs font-mono font-bold text-zinc-100 flex items-center gap-1" dir="rtl">
                    <span>{Number(activeShift.expectedCash || 0).toFixed(0)}</span>
                    <span className="text-[10px] font-sans font-normal text-zinc-400">{currency}</span>
                  </span>
                </div>

                {activeShift.startTime && (
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
                    <span>وقت البدء:</span>
                    <span className="font-mono text-zinc-300 text-[10px]" dir="ltr">
                      {new Date(activeShift.startTime).toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <button
                type="button"
                onClick={() => {
                  setIsShiftDropdownOpen(false);
                  onOpenXReport?.();
                }}
                className="w-full px-2.5 py-2.5 rounded-xl text-right flex items-center gap-2.5 text-xs text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <BarChart3 size={15} className="text-zinc-400 shrink-0" />
                <span className="font-medium">تقرير مبيعات الوردية</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsShiftDropdownOpen(false);
                  onOpenCashMovement?.();
                }}
                className="w-full px-2.5 py-2.5 rounded-xl text-right flex items-center gap-2.5 text-xs text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <ArrowDownUp size={15} className="text-amber-400 shrink-0" />
                <span className="font-medium">سحب / إيداع نقدية بالدرج</span>
              </button>

              {onOpenDriverSettlement && (
                <button
                  type="button"
                  onClick={() => {
                    setIsShiftDropdownOpen(false);
                    onOpenDriverSettlement();
                  }}
                  className="w-full px-2.5 py-2.5 rounded-xl text-right flex items-center justify-between gap-2.5 text-xs text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Bike size={15} className="text-sky-400 shrink-0" />
                    <span className="font-medium">عهدة وتصفية الطيارين</span>
                  </div>
                  {pendingHandoversCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {pendingHandoversCount} طلب
                    </span>
                  )}
                </button>
              )}

              {canViewShiftsHistory && (
                <button
                  type="button"
                  onClick={() => {
                    setIsShiftDropdownOpen(false);
                    onNavigateShifts?.();
                  }}
                  className="w-full px-2.5 py-2.5 rounded-xl text-right flex items-center gap-2.5 text-xs text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <History size={15} className="text-zinc-400 shrink-0" />
                  <span className="font-medium">سجل الورديات السابقة</span>
                </button>
              )}

              {/* Divider */}
              <div className="border-t border-zinc-850 my-1" />

              {/* Close Shift */}
              <button
                type="button"
                onClick={() => {
                  setIsShiftDropdownOpen(false);
                  onOpenCloseShift?.();
                }}
                className="w-full px-2.5 py-2.5 rounded-xl text-right flex items-center gap-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
              >
                <Lock size={15} className="text-rose-400 shrink-0" />
                <span>إغلاق الوردية</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Unified User Profile & Quick Actions Menu */}
        <div className="relative" ref={userDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsUserDropdownOpen((prev) => !prev);
              setIsShiftDropdownOpen(false);
            }}
            className="h-8 sm:h-9 px-2 sm:px-2.5 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            title="الحساب والإعدادات"
          >
            {/* Avatar Initial */}
            <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
              {(user?.name || 'ك')[0]}
            </div>

            {/* Cashier Name */}
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 hidden md:inline max-w-[85px] truncate">
              {user?.name || 'الكاشير'}
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
                  {(user?.name || 'ك')[0]}
                </div>
                <div className="truncate">
                  <p className="font-bold text-zinc-100 truncate text-xs">{user?.name || 'المستخدم'}</p>
                  <p className="text-[10px] text-zinc-400 font-medium">
                    {user?.role === 'owner'
                      ? 'المالك'
                      : user?.role === 'admin'
                      ? 'مدير النظام'
                      : user?.role === 'manager'
                      ? 'المدير'
                      : user?.role === 'waiter'
                      ? 'موظف الصالة'
                      : user?.role === 'call_center' || user?.role === 'CALL_CENTER'
                      ? 'خدمة العملاء'
                      : user?.roleName || 'كاشير النظام'}
                  </p>
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

export default PosNavHeader;
