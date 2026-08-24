import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  X,
  Store,
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  Grid,
  UtensilsCrossed,
  Users,
  MessageSquare,
  BarChart3,
  Calculator,
  Building2,
  TicketPercent,
  ChevronDown,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../modules/auth/context/AuthContext.jsx';
import { useBranch } from '../../modules/auth/context/BranchContext.jsx';

const ROLE_LABELS = {
  owner: 'المالك',
  admin: 'مدير النظام',
  manager: 'مدير',
  cashier: 'كاشير',
  waiter: 'موظف',
};

const NAV_SECTIONS = [
  {
    key: 'ops',
    title: 'العمليات التشغيلية',
    items: [
      { label: 'لوحة التحكم', path: '/', icon: LayoutDashboard, permission: 'dashboard.view' },
      { label: 'الطلبات', path: '/orders', icon: ShoppingBag },
      { label: 'نقطة البيع (POS)', path: '/pos', icon: Calculator, permission: 'orders.create' },
      { label: 'شاشة المطبخ (KDS)', path: '/kds', icon: ChefHat },
      { label: 'الطاولات', path: '/tables', icon: Grid, permission: 'tables.manage' },
    ],
  },
  {
    key: 'manage',
    title: 'إدارة المطعم',
    items: [
      { label: 'قائمة الطعام', path: '/menu', icon: UtensilsCrossed, permission: 'menu.manage' },
      { label: 'العملاء', path: '/customers', icon: Users, permission: 'customers.view' },
      { label: 'الموظفون', path: '/settings/employees', icon: UserCheck, permission: 'employees.view' },
      { label: 'الرسائل', path: '/whatsapp', icon: MessageSquare, permission: 'whatsapp.view' },
      { label: 'الكوبونات', path: '/coupons', icon: TicketPercent, permission: 'coupons.manage' },
      { label: 'التقارير والتحليلات', path: '/reports', icon: BarChart3, permission: 'dashboard.view' },
    ],
  },
];

const DEFAULT_PERMISSION = 'orders.view';

export const DrawerNav = ({ isOpen, onClose }) => {
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

  const rawRole = user?.role?.name || user?.role;
  const roleLabel = ROLE_LABELS[rawRole] || rawRole || 'موظف';
  const initials = (user?.name || 'م')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

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
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="القائمة الرئيسية">
      {/* Backdrop (Dark overlay with blur, closes on click) */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel (Width: 320px-340px on Desktop, 80%-85% on Mobile) */}
      <div className="relative flex flex-col w-5/6 sm:w-[340px] max-w-sm bg-bg-surface border-l border-white/[0.07] h-full z-10 shadow-2xl">
        {/* 1. Header with 2 Distinct Levels */}
        <div className="p-3.5 border-b border-white/[0.07] shrink-0">
          {/* Level 1: Brand & Close Button ✕ */}
          <div className="flex items-center justify-between h-11">
            <div className="flex items-center gap-2.5 min-w-0">
              <Store className="w-5 h-5 text-brand-primary shrink-0" />
              <span className="text-sm font-bold text-txt-primary truncate">
                نظام إدارة المطاعم
              </span>
            </div>

            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="w-10 h-10 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-white/[0.06] flex items-center justify-center focus-visible:outline-none transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Level 2: Full-width Branch Switcher */}
          <div className="relative mt-2.5">
            <button
              type="button"
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="w-full flex items-center justify-between h-9 px-3 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs text-txt-primary transition-colors focus-visible:outline-none text-right group"
              title="تغيير الفرع الحالي"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Building2 className="w-4 h-4 text-txt-muted shrink-0" />
                <span className="text-xs font-medium text-txt-primary truncate">
                  {activeBranch?.name || 'الفرع الرئيسي'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-txt-muted group-hover:text-txt-primary shrink-0 transition-transform duration-150" />
            </button>

            {isBranchDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsBranchDropdownOpen(false)} aria-hidden="true" />
                <div className="absolute right-0 left-0 mt-1 bg-bg-surface border border-white/[0.08] rounded-md shadow-2xl py-1 z-40 max-h-52 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] font-medium text-txt-muted border-b border-white/[0.07] uppercase tracking-wider flex items-center justify-between">
                    <span>الفروع المتاحة</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-txt-muted">{branches.length}</span>
                  </div>
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setActiveBranch(b);
                        setIsBranchDropdownOpen(false);
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
              </>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-1 pb-12">
          {visibleSections.map((section) => {
            const isOpen = !!openSections[section.key];

            return (
              <div key={section.key}>
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  className="w-full flex items-center justify-between px-3 py-1.5 mt-3 first:mt-0 mb-1 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-none select-none text-right rounded-md group"
                  aria-expanded={isOpen}
                >
                  <span className="truncate">{section.title}</span>
                  <ChevronDown
                    className={clsx(
                      'w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform duration-200 shrink-0',
                      isOpen ? 'rotate-0' : '-rotate-90'
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={onClose}
                          className={({ isActive }) =>
                            clsx(
                              'group flex items-center gap-3 px-3 h-9 rounded-md text-xs transition-colors duration-150',
                              isActive
                                ? 'bg-white/[0.08] text-white font-medium'
                                : 'text-slate-400 font-normal hover:text-slate-100 hover:bg-white/[0.03]'
                            )
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <Icon
                                className={clsx(
                                  'w-4 h-4 shrink-0 transition-colors',
                                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                                )}
                              />
                              <span className="truncate min-w-0 leading-none">{item.label}</span>
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
        </div>

        {/* 3. Footer with User Profile and Logout */}
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
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-9 h-9 rounded-md text-status-danger hover:bg-status-danger-bg flex items-center justify-center transition-colors shrink-0"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
