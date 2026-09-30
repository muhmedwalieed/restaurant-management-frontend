import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, RefreshCw, Bell, Users } from 'lucide-react';
import { useAuth } from '../../../auth/context/AuthContext.jsx';

export const WaiterHeader = ({
  user,
  activeBranch,
  totalTables = 0,
  occupiedCount = 0,
  alertsCount = 0,
  onRefresh,
  onLogout,
}) => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  return (
    <header
      className="h-14 px-4 flex items-center justify-between shrink-0 border-b select-none z-10"
      style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}
    >
      {/* Brand / Staff & Branch info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
            style={{ background: 'var(--ac-bg)', color: 'var(--ac)' }}
          >
            {user?.name?.[0] || 'W'}
          </div>
          <div>
            <h1 className="text-xs font-bold leading-tight" style={{ color: 'var(--t1)' }}>
              {user?.name || 'الويتر'}
            </h1>
            <p className="text-[10px]" style={{ color: 'var(--t3)' }}>
              {activeBranch?.name || 'الفرع الرئيسي'}
            </p>
          </div>
        </div>

        {/* Live status indicators */}
        <div className="hidden sm:flex items-center gap-2 mr-4 border-r pr-4" style={{ borderColor: 'var(--bd)' }}>
          <span className="text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1.5" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>
            <Users size={12} />
            <span>{occupiedCount} / {totalTables} مشغولة</span>
          </span>

          {alertsCount > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1.5 font-bold animate-pulse" style={{ background: 'var(--warn-bg)', color: 'var(--warn)' }}>
              <Bell size={12} />
              <span>{alertsCount} نداءات نشطة</span>
            </span>
          )}
        </div>
      </div>

      {/* Navigation shortcuts & Refresh */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onRefresh}
          className="p-2 rounded-lg text-xs font-medium transition-colors hover:bg-white/5 cursor-pointer"
          style={{ color: 'var(--t2)' }}
          title="تحديث البيانات"
        >
          <RefreshCw size={15} />
        </button>

        {hasPermission('dashboard.view') && (
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg text-xs font-medium transition-colors hover:bg-white/5 cursor-pointer"
            style={{ color: 'var(--t2)' }}
            title="لوحة التحكم"
          >
            <LayoutDashboard size={15} />
          </button>
        )}

        <button
          type="button"
          onClick={onLogout}
          className="p-2 rounded-lg text-xs font-medium transition-colors hover:bg-red-500/10 text-red-400 cursor-pointer"
          title="تسجيل الخروج"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
};
