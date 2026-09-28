import { Building2, ChevronDown, Store } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const MobileNavBranchSelector = ({
  activeBranch,
  branches = [],
  onSelectBranch,
  isOpen,
  onToggle,
  onCloseDropdown,
  onCloseMenu,
  canManageBranches,
}) => {
  return (
    <div className="relative mt-2">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between h-9 px-3 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs text-txt-primary transition-colors focus-visible:outline-none text-right group"
        title="تغيير الفرع الحالي"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 text-txt-muted shrink-0" />
          <span className="text-xs font-medium text-txt-primary truncate">
            {activeBranch?.name || 'الفرع الرئيسي'}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-txt-muted group-hover:text-txt-primary shrink-0 transition-transform duration-150" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={onCloseDropdown} aria-hidden="true" />
          <div className="absolute right-0 left-0 mt-1 bg-bg-surface border border-white/[0.08] rounded-md shadow-2xl py-1 z-40">
            <div className="px-3 py-1.5 text-[10px] font-medium text-txt-muted border-b border-white/[0.07] uppercase tracking-wider flex items-center justify-between">
              <span>الفروع المتاحة</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-txt-muted">{branches.length}</span>
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    onSelectBranch(b);
                    onCloseDropdown();
                  }}
                  className={`w-full text-right px-3 py-2 text-xs flex items-center justify-between hover:bg-white/[0.04] transition-colors ${
                    activeBranch?.id === b.id ? 'text-brand-primary font-semibold bg-white/[0.02]' : 'text-txt-primary'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="w-3.5 h-3.5 text-txt-muted shrink-0" />
                    <span className="truncate">{b.name}</span>
                  </div>
                  {activeBranch?.id === b.id && <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />}
                </button>
              ))}
            </div>
            {canManageBranches && (
              <div className="border-t border-white/[0.07] pt-1">
                <NavLink
                  to="/settings/branches"
                  onClick={() => {
                    onCloseDropdown();
                    onCloseMenu();
                  }}
                  className="w-full text-right px-3 py-1.5 text-[11px] text-txt-muted hover:text-txt-primary hover:bg-white/[0.04] flex items-center gap-2 transition-colors"
                >
                  <Store className="w-3.5 h-3.5 shrink-0" />
                  <span>إدارة الفروع</span>
                </NavLink>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
