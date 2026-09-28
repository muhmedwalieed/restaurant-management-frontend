import { LogOut } from 'lucide-react';
import { ROLE_LABELS } from './navigationConfig.js';

export const MobileNavUserSection = ({ user, onLogout }) => {
  const rawRole = user?.role?.name || user?.role;
  const roleLabel = ROLE_LABELS[rawRole] || rawRole || 'موظف';
  const initials = (user?.name || 'م')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className="border-t border-white/[0.07] p-3 shrink-0 bg-bg-surface"
      style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 24px))' }}
    >
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08]">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="w-8 h-8 rounded-full bg-slate-800 border border-white/[0.08] text-slate-200 flex items-center justify-center text-xs font-semibold shrink-0">
            {initials}
          </span>
          <div className="flex flex-col min-w-0 leading-tight text-right flex-1">
            <span className="text-xs font-medium text-txt-primary truncate">{user?.name || 'مدير النظام'}</span>
            <span className="text-[10px] text-txt-muted truncate mt-0.5">{roleLabel}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-9 h-9 rounded-md text-status-danger hover:bg-status-danger-bg flex items-center justify-center transition-colors shrink-0"
          title="تسجيل الخروج"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
