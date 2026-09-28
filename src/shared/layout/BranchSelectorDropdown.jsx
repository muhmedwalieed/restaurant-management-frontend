import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Building2, ChevronDown, Store } from 'lucide-react';
import { useBranch } from '../../modules/auth/context/BranchContext.jsx';
import { useAuth } from '../../modules/auth/context/AuthContext.jsx';

export const BranchSelectorDropdown = () => {
  const { activeBranch, branches, setActiveBranch } = useBranch();
  const { hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-9 px-3 rounded-lg bg-slate-100/70 hover:bg-slate-100 border border-border-default text-xs text-txt-primary transition-colors focus-visible:outline-none group text-right"
        title="تغيير الفرع النشط"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Building2 className="w-3.5 h-3.5 text-txt-muted group-hover:text-txt-primary shrink-0 transition-colors" />
        <span className="font-medium truncate max-w-[140px] sm:max-w-[200px]">
          {activeBranch?.name || 'الفرع الرئيسي'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-txt-muted group-hover:text-txt-primary shrink-0 transition-transform duration-150" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-full mt-1.5 w-60 bg-bg-surface border border-border-default rounded-xl shadow-xl py-1 z-40 max-h-60 overflow-y-auto">
            <div className="px-3 py-1.5 text-[10px] font-medium text-txt-muted border-b border-border-default uppercase tracking-wider flex items-center justify-between">
              <span>الفروع المتاحة</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-txt-muted">{branches.length}</span>
            </div>
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setActiveBranch(b);
                  setIsOpen(false);
                }}
                className={`w-full text-right px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-100 transition-colors ${
                  activeBranch?.id === b.id ? 'text-brand-primary font-bold bg-slate-50' : 'text-txt-primary'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-3.5 h-3.5 text-txt-muted shrink-0" />
                  <span className="truncate">{b.name}</span>
                </div>
                {activeBranch?.id === b.id && <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />}
              </button>
            ))}
            {hasPermission('branches.manage') && (
              <div className="border-t border-border-default pt-1">
                <NavLink
                  to="/settings/branches"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-right px-3 py-1.5 text-[11px] text-txt-muted hover:text-txt-primary hover:bg-slate-100 flex items-center gap-2 transition-colors"
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
