import React from 'react';
import {
  Menu,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../modules/auth/context/AuthContext.jsx';
import { useUnreadCountQuery } from '../../modules/notifications/hooks/useNotifications.js';
import { BranchSelectorDropdown } from './BranchSelectorDropdown.jsx';
import { UserProfileMenu } from './UserProfileMenu.jsx';

export const Header = ({ isSidebarCollapsed = false, onToggleDesktopSidebar, onToggleMobileNav }) => {
  const { hasPermission } = useAuth();
  const unreadQuery = useUnreadCountQuery();
  const unreadCount = unreadQuery.data?.count ?? 0;
  const canSeeNotifications = hasPermission('notifications.view');

  return (
    <header className="h-14 shrink-0 bg-bg-surface border-b border-border-default px-4 flex items-center justify-between select-none z-20 relative">
      {/* Sidebar toggle & Active branch */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Toggle desktop sidebar */}
        <button
          type="button"
          onClick={onToggleDesktopSidebar}
          className="hidden md:flex w-9 h-9 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-none items-center justify-center transition-colors shrink-0"
          aria-label={isSidebarCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
          title={isSidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
        >
          {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Toggle mobile nav */}
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="md:hidden w-9 h-9 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-none flex items-center justify-center transition-colors shrink-0"
          aria-label="فتح القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Branch selector dropdown */}
        <BranchSelectorDropdown />
      </div>

      <div className="flex-1" aria-hidden="true" />

      {/* Actions / Notifications / Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {canSeeNotifications && (
          <Link
            to="/notifications"
            className="relative w-9 h-9 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-slate-100 active:bg-slate-200 transition-colors focus-visible:outline-none flex items-center justify-center"
            aria-label={`الإشعارات، ${unreadCount} غير مقروء`}
            title="الإشعارات"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[15px] h-3.5 px-0.5 rounded-full bg-status-danger text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        )}

        <div className="w-px h-5 bg-border-default mx-0.5" aria-hidden="true" />

        {/* User profile menu */}
        <UserProfileMenu />
      </div>
    </header>
  );
};
