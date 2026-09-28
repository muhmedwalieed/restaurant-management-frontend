import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ChevronDown,
  LogOut,
  User,
  Settings,
  Shield,
  ScrollText,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../modules/auth/context/AuthContext.jsx';
import { ROLE_LABELS } from './navigationConfig.js';

export const UserProfileMenu = () => {
  const { user, logout, hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const rawRole = user?.role?.name || user?.role;
  const roleLabel = ROLE_LABELS[rawRole] || rawRole || 'مستخدم';
  const userName = user?.name || 'المستخدم الحالي';
  const userEmail = user?.email || null;

  const initials = userName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 h-9 px-2 sm:px-2.5 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors focus-visible:outline-none text-right group"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        title={userName}
      >
        <span className="w-7 h-7 rounded-full bg-ac text-white flex items-center justify-center text-xs font-semibold shrink-0">
          {initials}
        </span>
        <div className="hidden sm:flex flex-col min-w-0 leading-tight text-right">
          <span className="text-xs font-semibold text-txt-primary truncate max-w-[120px]">
            {userName}
          </span>
          <span className="text-[10px] text-txt-muted truncate">
            {roleLabel}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-txt-muted group-hover:text-txt-primary shrink-0 transition-transform duration-150" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className="absolute left-0 top-full mt-2 w-64 bg-bg-surface border border-border-default rounded-xl shadow-xl py-1.5 z-50">
            <div className="px-3.5 py-2.5 border-b border-border-default">
              <p className="text-xs font-bold text-txt-primary truncate">{userName}</p>
              <p className="text-[11px] text-txt-muted truncate mt-0.5">
                {userEmail || 'لا يوجد بريد إلكتروني مسجل'}
              </p>
            </div>

            <div className="py-1">
              {hasPermission('notifications.view') && (
                <NavLink
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-right flex items-center gap-2.5 px-3 py-2 text-[13px] text-txt-muted hover:text-txt-primary hover:bg-slate-100 transition-colors rounded-md"
                >
                  <User className="w-4 h-4 text-txt-muted shrink-0" />
                  <span>الملف الشخصي والإشعارات</span>
                </NavLink>
              )}

              {hasPermission('restaurants.manage') && (
                <NavLink
                  to="/settings/restaurant"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-right flex items-center gap-2.5 px-3 py-2 text-[13px] text-txt-muted hover:text-txt-primary hover:bg-slate-100 transition-colors rounded-md"
                >
                  <Settings className="w-4 h-4 text-txt-muted shrink-0" />
                  <span>إعدادات المطعم والفروع</span>
                </NavLink>
              )}

              {hasPermission('employees.manage_roles') && (
                <NavLink
                  to="/settings/roles"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-right flex items-center gap-2.5 px-3 py-2 text-[13px] text-txt-muted hover:text-txt-primary hover:bg-slate-100 transition-colors rounded-md"
                >
                  <Shield className="w-4 h-4 text-txt-muted shrink-0" />
                  <span>الأدوار والصلاحيات</span>
                </NavLink>
              )}

              {hasPermission('audit.view') && (
                <NavLink
                  to="/settings/audit-logs"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-right flex items-center gap-2.5 px-3 py-2 text-[13px] text-txt-muted hover:text-txt-primary hover:bg-slate-100 transition-colors rounded-md"
                >
                  <ScrollText className="w-4 h-4 text-txt-muted shrink-0" />
                  <span>سجل التدقيق</span>
                </NavLink>
              )}

              {hasPermission('restaurants.manage') && (
                <NavLink
                  to="/settings/restaurant"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-right flex items-center gap-2.5 px-3 py-2 text-[13px] text-txt-muted hover:text-txt-primary hover:bg-slate-100 transition-colors rounded-md"
                >
                  <CreditCard className="w-4 h-4 text-txt-muted shrink-0" />
                  <span>الاشتراك والفوترة</span>
                </NavLink>
              )}
            </div>

            <div className="border-t border-border-default pt-1 mt-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full text-right flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors rounded-md cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0 text-red-600" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
