import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Store, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../modules/auth/context/AuthContext.jsx';
import { NAV_SECTIONS, DEFAULT_PERMISSION } from './navigationConfig.js';

export const Sidebar = ({ isCollapsed = false }) => {
  const { hasPermission } = useAuth();
  const location = useLocation();

  const [openSections, setOpenSections] = useState({
    ops: true,
    manage: false,
    settings: false,
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

  return (
    <aside
      className={clsx(
        'hidden md:flex flex-col h-[100dvh] max-h-[100dvh] bg-bg-surface border-l border-border-default transition-all duration-200 shrink-0 select-none shadow-none z-20 overflow-hidden',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header / Brand */}
      <div
        className={clsx(
          'shrink-0 h-14 border-b border-border-default flex items-center',
          isCollapsed ? 'justify-center px-2' : 'px-4'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-md bg-brand-primary text-txt-inverted flex items-center justify-center shrink-0 shadow-xs">
            <Store className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-bold text-txt-primary truncate leading-tight">
                إدارة المطاعم
              </span>
              <span className="text-[10px] text-txt-muted truncate leading-tight mt-0.5">
                نظام العمليات السحابي
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={clsx(
          'flex-1 min-h-0 overflow-y-auto pb-16 custom-scrollbar',
          isCollapsed ? 'py-3 px-2 space-y-1' : 'py-3 px-3 space-y-1'
        )}
      >
        {visibleSections.map((section, index) => {
          const isOpen = !!openSections[section.key];

          return (
            <div key={section.key}>
              {/* Section divider in collapsed mode */}
              {isCollapsed && index > 0 && (
                <div className="w-6 h-px bg-border-default mx-auto my-2.5" aria-hidden="true" />
              )}

              {/* Section Header Button */}
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 mt-3 first:mt-0 mb-1 text-[11px] font-bold text-txt-muted hover:text-txt-primary transition-colors focus-visible:outline-none select-none text-right rounded-md group"
                  aria-expanded={isOpen}
                >
                  <span className="truncate tracking-wide">{section.title}</span>
                  <ChevronDown
                    className={clsx(
                      'w-3.5 h-3.5 text-txt-muted group-hover:text-txt-primary transition-transform duration-200 shrink-0',
                      isOpen ? 'rotate-0' : '-rotate-90'
                    )}
                  />
                </button>
              )}

              {/* Section Items */}
              {(isCollapsed || isOpen) && (
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          clsx(
                            'group flex items-center rounded-md text-xs transition-all duration-150',
                            isCollapsed
                              ? 'w-9 h-9 mx-auto justify-center'
                              : 'w-full gap-2.5 px-3 h-9',
                            isActive
                              ? 'bg-brand-primary text-txt-inverted font-semibold shadow-xs'
                              : 'text-txt-muted font-medium hover:text-txt-primary hover:bg-bg-surface-elevated'
                          )
                        }
                        title={isCollapsed ? item.label : undefined}
                      >
                        {({ isActive }) => (
                          <>
                            <Icon
                              className={clsx(
                                'w-4 h-4 shrink-0 transition-colors',
                                isActive
                                  ? 'text-txt-inverted'
                                  : 'text-txt-muted group-hover:text-txt-primary'
                              )}
                            />
                            {!isCollapsed && (
                              <span className="truncate min-w-0 leading-none">{item.label}</span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
