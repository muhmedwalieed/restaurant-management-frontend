import { Menu, Building2, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../modules/auth/context/AuthContext.jsx';
import { useBranch } from '../../modules/auth/context/BranchContext.jsx';
import { HealthStatusIndicator } from '../../modules/health/components/HealthStatusIndicator.jsx';
import { useState } from 'react';

export const Header = ({ onToggleMobileNav, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { activeBranch, branches, setActiveBranch } = useBranch();
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-bg-surface border-b border-border-default px-4 flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      {/* Right Controls (Navigation Toggle & Branch Context) */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleMobileNav}
          className="md:hidden p-2 rounded-md text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated focus-visible:outline-none"
          aria-label="فتح القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex p-2 rounded-md text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated focus-visible:outline-none"
          aria-label="تبديل القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Branch Context Selector (Branch Context) */}
        <div className="relative">
          <button
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-base border border-border-default text-xs text-txt-primary hover:border-text-muted transition-colors focus-visible:outline-none"
          >
            <Building2 className="w-4 h-4 text-brand-primary shrink-0" />
            <span className="font-semibold truncate max-w-[120px] sm:max-w-[180px]">
              {activeBranch?.name || 'الفرع الرئيسي'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-txt-muted shrink-0" />
          </button>

          {isBranchDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-bg-surface border border-border-default rounded-md shadow-xl py-1 z-40">
              <div className="px-3 py-1.5 text-[10px] font-bold text-txt-muted border-b border-border-subtle uppercase">
                اختر الفرع الحالي
              </div>
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setActiveBranch(b);
                    setIsBranchDropdownOpen(false);
                  }}
                  className={`w-full text-right px-3 py-2 text-xs flex items-center justify-between hover:bg-bg-surface-elevated transition-colors ${
                    activeBranch?.id === b.id ? 'text-brand-primary font-bold' : 'text-txt-primary'
                  }`}
                >
                  <span>{b.name}</span>
                  {activeBranch?.id === b.id && <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Left Controls (Health Status & User Context) */}
      <div className="flex items-center gap-3">
        {/* Backend Health Status Indicator (Section 7 Module 1) */}
        <HealthStatusIndicator />

        {/* User Profile Context */}
        <div className="flex items-center gap-2 pr-2 border-r border-border-subtle">
          <div className="w-8 h-8 rounded-full bg-bg-surface-elevated border border-border-default text-txt-primary flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-txt-primary truncate">
              {user?.name || 'مدير النظام'}
            </span>
            <span className="text-[10px] text-txt-muted truncate">
              {user?.role || 'Admin'}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-txt-muted hover:text-status-danger hover:bg-status-danger-bg rounded-md transition-colors focus-visible:outline-none"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
