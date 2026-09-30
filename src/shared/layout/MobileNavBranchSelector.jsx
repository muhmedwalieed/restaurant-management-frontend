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
        className="w-full flex items-center justify-between h-9 px-3 rounded-md bg-bg-surface-elevated hover:bg-border-default border border-border-default text-xs text-txt-primary transition-colors focus-visible:outline-none text-right group"
        title="تغيير الفرع الحالي"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 text-txt-muted shrink-0" />
          <span className="text-xs font-semibold text-txt-primary truncate">
            {activeBranch?.name || 'الفرع الرئيسي'}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-txt-muted group-hover:text-txt-primary shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={onCloseDropdown} aria-hidden="true" />
          <div className="absolute right-0 left-0 mt-1 bg-bg-surface border border-border-default rounded-md shadow-overlay py-1 z-40 animate-fadeUp">
            <div className="px-3 py-1.5 text-[11px] font-bold text-txt-muted border-b border-border-default flex items-center justify-between">
              <span>الفروع المتاحة</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-bg-surface-elevated text-txt-muted font-mono">
                {branches.length}
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    onSelectBranch(b);
                    onCloseDropdown();
                  }}
                  className={`w-full text-right px-3 py-2 text-xs flex items-center justify-between hover:bg-bg-surface-elevated transition-colors ${
                    activeBranch?.id === b.id
                      ? 'text-brand-primary font-bold bg-bg-surface-elevated/70'
                      : 'text-txt-primary'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="w-3.5 h-3.5 text-txt-muted shrink-0" />
                    <span className="truncate">{b.name}</span>
                  </div>
                  {activeBranch?.id === b.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
            {canManageBranches && (
              <div className="border-t border-border-default pt-1 mt-1">
                <NavLink
                  to="/settings/branches"
                  onClick={() => {
                    onCloseDropdown();
                    onCloseMenu();
                  }}
                  className="w-full text-right px-3 py-1.5 text-[11px] text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated flex items-center gap-2 transition-colors"
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
