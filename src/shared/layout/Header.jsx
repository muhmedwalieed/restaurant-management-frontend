import {
  Menu,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../modules/auth/context/AuthContext.jsx';
import { useUnreadCountQuery } from '../../modules/notifications/hooks/useNotifications.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useSocket } from '../realtime/SocketProvider.jsx';
import { BranchSelectorDropdown } from './BranchSelectorDropdown.jsx';
import { UserProfileMenu } from './UserProfileMenu.jsx';

import { ThemePaletteStudio } from '../components/ThemePaletteStudio.jsx';

export const Header = ({
  isSidebarCollapsed = false,
  onToggleDesktopSidebar,
  onToggleMobileNav,
}) => {
  const { hasPermission } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isConnected } = useSocket();
  const unreadQuery = useUnreadCountQuery();
  const unreadCount = unreadQuery.data?.count ?? 0;
  const canSeeNotifications = hasPermission('notifications.view');

  return (
    <header className="h-14 shrink-0 bg-bg-surface border-b border-border-default px-4 flex items-center justify-between select-none z-20 relative transition-colors">
      {/* Sidebar toggle & Active branch */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Toggle desktop sidebar */}
        <button
          type="button"
          onClick={onToggleDesktopSidebar}
          className="hidden md:flex w-9 h-9 rounded-md text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated active:bg-border-default focus-visible:outline-none items-center justify-center transition-colors shrink-0 border border-transparent hover:border-border-default"
          aria-label={isSidebarCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
          title={isSidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Toggle mobile nav */}
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="md:hidden w-9 h-9 rounded-md text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated active:bg-border-default focus-visible:outline-none flex items-center justify-center transition-colors shrink-0 border border-transparent"
          aria-label="فتح القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Branch selector dropdown */}
        <BranchSelectorDropdown />
      </div>

      <div className="flex-1" aria-hidden="true" />

      {/* Actions / Live Status / Theme Palette Studio / Theme Toggle / Notifications / Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Visual Palette Customizer */}
        <ThemePaletteStudio />

        {/* Real-time Socket status indicator */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-bg-surface-elevated border border-border-default text-txt-muted"
          title={isConnected ? 'متصل بالخادم اللحظي (Socket.IO)' : 'جارٍ الاتصال بالخادم...'}
        >
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              isConnected ? 'bg-status-success' : 'bg-status-warning animate-pulse'
            }`}
          />
          <span>{isConnected ? 'متصل لحظياً' : 'جارٍ الاتصال'}</span>
        </div>

        {/* Theme switcher toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-9 h-9 rounded-md text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated active:bg-border-default transition-colors focus-visible:outline-none flex items-center justify-center border border-transparent hover:border-border-default"
          aria-label={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
          title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-txt-primary transition-transform duration-200 rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-txt-primary transition-transform duration-200 rotate-0 hover:-rotate-12" />
          )}
        </button>

        {/* Notifications */}
        {canSeeNotifications && (
          <Link
            to="/notifications"
            className="relative w-9 h-9 rounded-md text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated active:bg-border-default transition-colors focus-visible:outline-none flex items-center justify-center border border-transparent hover:border-border-default"
            aria-label={`الإشعارات، ${unreadCount} غير مقروء`}
            title="الإشعارات"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[15px] h-3.5 px-1 rounded-full bg-status-danger text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        )}

        <div className="w-px h-5 bg-border-default mx-1" aria-hidden="true" />

        {/* User profile menu */}
        <UserProfileMenu />
      </div>
    </header>
  );
};
