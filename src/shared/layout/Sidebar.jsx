import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  Grid,
  UtensilsCrossed,
  Users,
  MessageSquare,
  BarChart3,
  Calculator,
  Store,
  TicketPercent,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../modules/auth/context/AuthContext.jsx';

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

export const Sidebar = ({ isCollapsed = false }) => {
  const { hasPermission } = useAuth();
  const location = useLocation();

  // Accordion state: operations open by default, manage & settings collapsed
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

  // Auto-expand section containing active route
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
        'hidden md:flex flex-col h-[100dvh] max-h-[100dvh] bg-bg-surface border-l border-white/[0.07] transition-all duration-200 shrink-0 select-none shadow-none z-20 overflow-hidden',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* 1. Header: Logo & Brand Name Only (Fixed shrink-0 56px) */}
      <div className={clsx('shrink-0 h-14 border-b border-white/[0.07] flex items-center', isCollapsed ? 'justify-center px-2' : 'px-4')}>
        <div className="flex items-center gap-2.5 min-w-0">
          <Store className="w-5 h-5 text-brand-primary shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-bold text-txt-primary truncate">
              نظام إدارة المطاعم
            </span>
          )}
        </div>
      </div>

      {/* 2. Middle Zone: Pure Body Navigation with Strict min-h-0 and Safe pb-16 */}
      <nav className={clsx('flex-1 min-h-0 overflow-y-auto pb-16 custom-scrollbar', isCollapsed ? 'py-3 px-2 space-y-1' : 'py-3 px-3 space-y-1')}>
        {visibleSections.map((section, index) => {
          const isOpen = !!openSections[section.key];

          return (
            <div key={section.key}>
              {/* Separator between groups in collapsed mode */}
              {isCollapsed && index > 0 && (
                <div className="w-6 h-px bg-white/[0.07] mx-auto my-2.5" aria-hidden="true" />
              )}

              {/* Section Header: flex items-center justify-between text-slate-400 */}
              {!isCollapsed && (
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
              )}

              {/* Navigation Items: consistent height h-9 (36px) and space-y-1 */}
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
                            'group flex items-center rounded-md text-xs transition-colors duration-150',
                            isCollapsed
                              ? 'w-9 h-9 mx-auto justify-center'
                              : 'w-full gap-3 px-3 h-9',
                            isActive
                              ? 'bg-white/[0.08] text-white font-medium'
                              : 'text-slate-400 font-normal hover:text-slate-100 hover:bg-white/[0.03]'
                          )
                        }
                        title={isCollapsed ? item.label : undefined}
                      >
                        {({ isActive }) => (
                          <>
                            <Icon
                              className={clsx(
                                'w-4 h-4 shrink-0 transition-colors',
                                isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                              )}
                            />
                            {!isCollapsed && <span className="truncate min-w-0 leading-none">{item.label}</span>}
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