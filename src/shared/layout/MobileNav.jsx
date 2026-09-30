import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Store } from 'lucide-react';
import { useAuth } from '../../modules/auth/context/AuthContext.jsx';
import { useBranch } from '../../modules/auth/context/BranchContext.jsx';
import { NAV_SECTIONS, DEFAULT_PERMISSION } from './navigationConfig.js';
import { MobileNavBranchSelector } from './MobileNavBranchSelector.jsx';
import { MobileNavSection } from './MobileNavSection.jsx';
import { MobileNavUserSection } from './MobileNavUserSection.jsx';

export const MobileNav = ({ isOpen, onClose }) => {
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const { user, logout, hasPermission } = useAuth();
  const { activeBranch, branches, setActiveBranch } = useBranch();
  const location = useLocation();

  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    ops: true,
    manage: true,
    settings: true,
  });

  const visibleSections = NAV_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasPermission(item.permission || DEFAULT_PERMISSION)),
    }))
    .filter((section) => section.items.length > 0);

  useEffect(() => {
    const activeSection = visibleSections.find((sec) =>
      sec.items.some((item) =>
        item.path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(item.path)
      )
    );
    if (activeSection) {
      setOpenSections((prev) =>
        prev[activeSection.key] ? prev : { ...prev, [activeSection.key]: true }
      );
    }
  }, [location.pathname, visibleSections]);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    previousFocusRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="md:hidden fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="القائمة الرئيسية"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative flex flex-col w-5/6 max-w-xs bg-bg-surface border-l border-border-default h-[100dvh] max-h-[100dvh] z-10 shadow-overlay overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="p-3 border-b border-border-default shrink-0">
          <div className="flex items-center justify-between h-11">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-md bg-brand-primary text-txt-inverted flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-txt-primary truncate">
                إدارة المطاعم
              </span>
            </div>

            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="w-8 h-8 rounded-md text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated flex items-center justify-center focus-visible:outline-none transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <MobileNavBranchSelector
            activeBranch={activeBranch}
            branches={branches}
            onSelectBranch={setActiveBranch}
            isOpen={isBranchDropdownOpen}
            onToggle={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            onCloseDropdown={() => setIsBranchDropdownOpen(false)}
            onCloseMenu={onClose}
            canManageBranches={hasPermission('branches.manage')}
          />
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 min-h-0 py-3 px-3 overflow-y-auto space-y-1 pb-16 custom-scrollbar">
          {visibleSections.map((section) => (
            <MobileNavSection
              key={section.key}
              section={section}
              isOpen={!!openSections[section.key]}
              onToggle={() => toggleSection(section.key)}
              onClose={onClose}
            />
          ))}
        </nav>

        {/* User / Logout */}
        <MobileNavUserSection
          user={user}
          onLogout={() => {
            onClose();
            logout();
          }}
        />
      </div>
    </div>
  );
};
