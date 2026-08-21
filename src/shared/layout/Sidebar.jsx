import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  Grid,
  UtensilsCrossed,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Store,
  Building2,
} from 'lucide-react';
import { clsx } from 'clsx';

// Section 6.5 Operational Navigation Structure
const NAV_ITEMS = [
  { label: 'لوحة التحكم', path: '/', icon: LayoutDashboard },
  { label: 'الطلبات', path: '/orders', icon: ShoppingBag, badge: 'POS' },
  { label: 'شاشة المطبخ (KDS)', path: '/kds', icon: ChefHat },
  { label: 'الترابيزات', path: '/tables', icon: Grid },
  { label: 'المنيو', path: '/menu', icon: UtensilsCrossed },
  { label: 'العملاء', path: '/customers', icon: Users },
  { label: 'الواتساب والرسائل', path: '/whatsapp', icon: MessageSquare },
  { label: 'التقارير والتحليلات', path: '/reports', icon: BarChart3 },
  { label: 'إعدادات المطعم', path: '/settings/restaurant', icon: Store },
  { label: 'الفروع والمواقع', path: '/settings/branches', icon: Building2 },
  { label: 'الموظفين', path: '/settings/employees', icon: Users },
  { label: 'الأدوار والصلاحيات', path: '/settings/roles', icon: Settings },
];

export const Sidebar = ({ isCollapsed = false }) => {
  return (
    <aside
      className={clsx(
        'hidden md:flex flex-col bg-bg-surface border-l border-border-default transition-all duration-200 shrink-0 select-none',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-border-default overflow-hidden">
        <div className="w-9 h-9 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
          <Store className="w-5 h-5" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col truncate">
            <span className="text-sm font-bold text-txt-primary truncate">مطعم البرجر الشهي</span>
            <span className="text-[10px] text-txt-muted truncate">SaaS Enterprise</span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors relative group',
                  isActive
                    ? 'bg-brand-primary/10 text-brand-primary border-r-2 border-brand-primary'
                    : 'text-txt-muted hover:bg-bg-surface-elevated hover:text-txt-primary'
                )
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span className="mr-auto text-[10px] px-1.5 py-0.5 rounded bg-brand-primary/20 text-brand-primary font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
