import { NavLink } from 'react-router-dom';
import { useEffect, useRef } from 'react';
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
  Settings,
} from 'lucide-react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { label: 'لوحة التحكم', path: '/', icon: LayoutDashboard },
  { label: 'الطلبات', path: '/orders', icon: ShoppingBag, badge: 'POS' },
  { label: 'شاشة المطبخ (KDS)', path: '/kds', icon: ChefHat },
  { label: 'الترابيزات', path: '/tables', icon: Grid },
  { label: 'المنيو', path: '/menu', icon: UtensilsCrossed },
  { label: 'العملاء', path: '/customers', icon: Users },
  { label: 'الواتساب والرسائل', path: '/whatsapp', icon: MessageSquare },
  { label: 'التقارير والتحليلات', path: '/reports', icon: BarChart3 },
  { label: 'الإعدادات', path: '/settings', icon: Settings },
];

export const MobileNav = ({ isOpen, onClose }) => {
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    // Scroll lock + Escape to close + focus management (Section 6.24 / 20.13)
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
    <div className="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="القائمة الرئيسية">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div className="relative flex flex-col w-4/5 max-w-xs bg-bg-surface border-l border-border-default h-full z-10 shadow-2xl">
        <div className="h-16 px-4 flex items-center justify-between border-b border-border-default">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-txt-primary">القائمة الرئيسية</span>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 text-txt-muted hover:text-txt-primary focus-visible:outline-none"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors min-h-[44px]',
                    isActive
                      ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                      : 'text-txt-muted hover:bg-bg-surface-elevated hover:text-txt-primary'
                  )
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
