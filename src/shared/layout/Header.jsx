import React, { useState } from 'react';
import {
  Menu,
  Store,
  Bell,
  Building2,
  ChevronDown,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Settings,
  Shield,
  ScrollText,
  CreditCard,
} from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../modules/auth/context/AuthContext.jsx';
import { useBranch } from '../../modules/auth/context/BranchContext.jsx';
import { useUnreadCountQuery } from '../../modules/notifications/hooks/useNotifications.js';

const ROLE_LABELS = {
  owner: 'المالك',
  admin: 'مدير النظام',
  manager: 'مدير',
  cashier: 'كاشير',
  waiter: 'موظف',
};

export const Header = ({ isSidebarCollapsed = false, onToggleDesktopSidebar, onToggleMobileNav }) => {
  const { user, logout, hasPermission } = useAuth();
  const { activeBranch, branches, setActiveBranch } = useBranch();
  const unreadQuery = useUnreadCountQuery();
  const unreadCount = unreadQuery.data?.count ?? 0;
  const canSeeNotifications = hasPermission('notifications.view');

  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const rawRole = user?.role?.name || user?.role;
  const roleLabel = ROLE_LABELS[rawRole] || rawRole || 'موظف';
  const initials = (user?.name || 'م')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="h-14 shrink-0 bg-bg-surface border-b border-white/[0.07] px-4 flex items-center justify-between select-none z-20 relative">
      {/* 1. Far Right (RTL Start): Toggle Icon + Branch Selector Dropdown */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Desktop Sidebar Toggle */}
        <button
          type="button"
          onClick={onToggleDesktopSidebar}
          className="hidden md:flex w-9 h-9 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-white/[0.04] active:bg-white/[0.08] focus-visible:outline-none items-center justify-center transition-colors shrink-0"
          aria-label={isSidebarCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
          title={isSidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
        >
          {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Mobile Nav Toggle */}
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="md:hidden w-9 h-9 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-white/[0.06] active:bg-white/[0.1] focus-visible:outline-none flex items-center justify-center transition-colors shrink-0"
          aria-label="فتح القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Branch Selector Dropdown Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            className="flex items-center gap-2 h-9 px-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-xs text-txt-primary transition-colors focus-visible:outline-none group text-right"
            title="تغيير الفرع النشط"
            aria-haspopup="menu"
            aria-expanded={isBranchDropdownOpen}
          >
            <Building2 className="w-3.5 h-3.5 text-txt-muted group-hover:text-txt-primary shrink-0 transition-colors" />
            <span className="font-medium truncate max-w-[140px] sm:max-w-[200px]">
              {activeBranch?.name || 'الفرع الرئيسي'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-txt-muted group-hover:text-txt-primary shrink-0 transition-transform duration-150" />
          </button>

          {isBranchDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsBranchDropdownOpen(false)} aria-hidden="true" />
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-bg-surface border border-white/[0.08] rounded-lg shadow-2xl py-1 z-40 max-h-60 overflow-y-auto">
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
                {hasPermission('branches.manage') && (
                  <div className="border-t border-white/[0.07] pt-1">
                    <NavLink
                      to="/settings/branches"
                      onClick={() => setIsBranchDropdownOpen(false)}
                      className="w-full text-right px-3 py-1.5 text-[11px] text-txt-muted hover:text-txt-primary hover:bg-white/[0.04] flex items-center gap-2 transition-colors"
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
      </div>

      {/* 2. Center: Clean whitespace that gives visual breathing room */}
      <div className="flex-1" aria-hidden="true" />

      {/* 3. Far Left (RTL End): Notifications + Thin Divider + Full User Profile Capsule */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notifications Icon Button with Badge */}
        {canSeeNotifications && (
          <Link
            to="/notifications"
            className="relative w-9 h-9 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors focus-visible:outline-none flex items-center justify-center"
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

        {/* Thin Vertical Divider */}
        <div className="w-px h-5 bg-white/[0.08] mx-0.5" aria-hidden="true" />

        {/* Full User Profile Capsule with Structured Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 h-9 px-2 sm:px-2.5 rounded-lg hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors focus-visible:outline-none text-right group"
            aria-haspopup="menu"
            aria-expanded={isUserMenuOpen}
            title={user?.name || 'مدير النظام'}
          >
            <span className="w-7 h-7 rounded-full bg-slate-800 border border-white/[0.08] text-slate-200 flex items-center justify-center text-xs font-semibold shrink-0">
              {initials}
            </span>
            <div className="hidden sm:flex flex-col min-w-0 leading-tight text-right">
              <span className="text-xs font-medium text-txt-primary truncate max-w-[120px]">
                {user?.name || 'مدير النظام'}
              </span>
              <span className="text-[10px] text-txt-muted truncate">
                {roleLabel}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-txt-muted group-hover:text-txt-primary shrink-0 transition-transform duration-150" />
          </button>

          {isUserMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} aria-hidden="true" />
              <div className="absolute left-0 top-full mt-2 w-64 bg-bg-surface border border-white/[0.08] rounded-xl shadow-2xl py-1.5 z-50">
                {/* User Info Header with subtle bottom border */}
                <div className="px-3.5 py-2.5 border-b border-white/[0.08]">
                  <p className="text-xs font-semibold text-txt-primary truncate">{user?.name || 'مدير النظام'}</p>
                  <p className="text-[11px] text-txt-muted truncate mt-0.5">{user?.email || `${rawRole || 'user'}@restaurant.com`}</p>
                </div>

                {/* Navigation Items with uniform flex & padding: display: flex; align-items: center; gap: 10px; padding: 8px 12px; font-size: 13px; */}
                <div className="py-1">
                  {canSeeNotifications && (
                    <NavLink
                      to="/notifications"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-right flex items-center gap-2.5 px-3 py-2 text-[13px] text-txt-muted hover:text-txt-primary hover:bg-white/[0.04] transition-colors rounded-md"
                    >
                      <User className="w-4 h-4 text-txt-muted shrink-0" />
                      <span>الملف الشخصي والإشعارات</span>
                    </NavLink>
                  )}

                  {hasPermission('restaurants.manage') && (
                    <NavLink
                      to="/settings/restaurant"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-right flex items-center gap-2.5 px-3 py-2 text-[13px] text-txt-muted hover:text-txt-primary hover:bg-white/[0.04] transition-colors rounded-md"
                    >
                      <Settings className="w-4 h-4 text-txt-muted shrink-0" />
                      <span>إعدادات المطعم والفروع</span>
                    </NavLink>
                  )}

                  {hasPermission('employees.manage_roles') && (
                    <NavLink
                      to="/settings/roles"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-right flex items-center gap-2.5 px-3 py-2 text-[13px] text-txt-muted hover:text-txt-primary hover:bg-white/[0.04] transition-colors rounded-md"
                    >
                      <Shield className="w-4 h-4 text-txt-muted shrink-0" />
                      <span>الأدوار والصلاحيات</span>
                    </NavLink>
                  )}

                  {hasPermission('audit.view') && (
                    <NavLink
                      to="/settings/audit-logs"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-right flex items-center gap-2.5 px-3 py-2 text-[13px] text-txt-muted hover:text-txt-primary hover:bg-white/[0.04] transition-colors rounded-md"
                    >
                      <ScrollText className="w-4 h-4 text-txt-muted shrink-0" />
                      <span>سجل التدقيق</span>
                    </NavLink>
                  )}

                  {hasPermission('restaurants.manage') && (
                    <NavLink
                      to="/settings/restaurant"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-right flex items-center gap-2.5 px-3 py-2 text-[13px] text-txt-muted hover:text-txt-primary hover:bg-white/[0.04] transition-colors rounded-md"
                    >
                      <CreditCard className="w-4 h-4 text-txt-muted shrink-0" />
                      <span>الاشتراك والفوترة</span>
                    </NavLink>
                  )}
                </div>

                {/* Logout Button with subtle top border and soft red color (#EF4444) */}
                <div className="border-t border-white/[0.08] pt-1 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-right flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors rounded-md"
                  >
                    <LogOut className="w-4 h-4 shrink-0 text-red-400" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};