import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../modules/auth/context/AuthContext.jsx';
import { SplashState } from '../../shared/components/SplashState.jsx';
import { Button } from '../../shared/components/Button.jsx';
import { DashboardPage } from '../../modules/dashboard/pages/DashboardPage.jsx';
import { hasRestaurantHost } from '../../shared/tenant/tenant.js';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isBootstrapping, hasPermission, user } = useAuth();
  const location = useLocation();

  // Staff areas only exist on a restaurant host (prime-restaurant.example.com).
  if (!hasRestaurantHost) {
    return <NotFoundPage />;
  }

  if (isBootstrapping) {
    return <SplashState />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isWaiter =
    user?.role?.name === 'waiter' ||
    user?.role?.name === 'ويتر' ||
    (hasPermission('tables.view') &&
      hasPermission('orders.create') &&
      !hasPermission([
        'dashboard.view',
        'orders.source_cashier',
        'orders.source_phone',
        'orders.source_whatsapp',
        'orders.source_website',
        'menu.manage',
        'restaurants.manage',
        'employees.view',
        'branches.manage',
        'customers.view',
      ]));

  const isWaiterRoute = location.pathname.startsWith('/waiter');

  if (isWaiter) {
    if (isWaiterRoute) return children;
    return <Navigate to="/waiter" replace />;
  }

  const isKitchen =
    user?.role?.name === 'kitchen' ||
    user?.role?.name === 'مطبخ' ||
    user?.role?.name === 'شيف المطبخ' ||
    (hasPermission('kds.view') &&
      !hasPermission([
        'dashboard.view',
        'orders.source_cashier',
        'orders.source_phone',
        'orders.source_whatsapp',
        'orders.source_website',
        'menu.manage',
        'restaurants.manage',
        'employees.view',
      ]));

  const isKdsRoute = location.pathname.startsWith('/kds');
  if (isKitchen) {
    if (isKdsRoute) return children;
    return <Navigate to="/kds" replace />;
  }

  if (isWaiterRoute || isKdsRoute) {
    return children;
  }

  const isPosRoute = location.pathname.startsWith('/pos');
  if (isPosRoute) {
    return children;
  }

  const isFloorServerOnly =
    hasPermission('tables.view') &&
    !hasPermission([
      'dashboard.view',
      'orders.view',
      'orders.source_cashier',
      'menu.manage',
      'restaurants.manage',
      'employees.view',
    ]);

  if (isFloorServerOnly) {
    return <Navigate to="/waiter" replace />;
  }

  return children;
};

export const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
    <h1 className="text-4xl font-bold text-status-danger">404</h1>
    <p className="text-sm text-txt-muted">الصفحة التي تبحث عنها غير موجودة.</p>
    <Button onClick={() => (window.location.href = '/')}>العودة للرئيسية</Button>
  </div>
);

export const RequirePermission = ({ permission, children }) => {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) {
    return <NotFoundPage />;
  }
  return children;
};

export const HomeRedirect = () => {
  const { hasPermission, user } = useAuth();

  // 0. Waiter-only staff → directly to waiter single-page view
  const isWaiterOnly =
    user?.role?.name === 'waiter' ||
    user?.role?.name === 'ويتر' ||
    (hasPermission('tables.view') &&
      hasPermission('orders.create') &&
      !hasPermission([
        'dashboard.view',
        'orders.source_cashier',
        'orders.source_phone',
        'orders.source_whatsapp',
        'orders.source_website',
        'menu.manage',
        'restaurants.manage',
        'employees.view',
        'branches.manage',
        'customers.view',
      ]));
  if (isWaiterOnly) {
    return <Navigate to="/waiter" replace />;
  }

  // 0.5. Kitchen staff → directly to kitchen display screen (KDS)
  const isKitchenOnly =
    user?.role?.name === 'kitchen' ||
    user?.role?.name === 'مطبخ' ||
    user?.role?.name === 'شيف المطبخ' ||
    (hasPermission('kds.view') &&
      !hasPermission([
        'dashboard.view',
        'orders.source_cashier',
        'orders.source_phone',
        'orders.source_whatsapp',
        'orders.source_website',
        'menu.manage',
        'restaurants.manage',
        'employees.view',
      ]));
  if (isKitchenOnly) {
    return <Navigate to="/kds" replace />;
  }

  // 1. Dashboard / Executive Overview
  if (hasPermission('dashboard.view')) {
    return <DashboardPage />;
  }

  // 2. POS Cashier channels
  if (
    hasPermission([
      'orders.source_cashier',
      'orders.source_phone',
      'orders.source_whatsapp',
      'orders.source_website',
    ])
  ) {
    return <Navigate to="/pos" replace />;
  }

  // 3. Orders history & monitoring
  if (hasPermission('orders.view')) {
    return <Navigate to="/orders" replace />;
  }

  // 4. Kitchen Display System (KDS)
  if (hasPermission('kds.view')) {
    return <Navigate to="/kds" replace />;
  }

  // 5. Floor & Dining Tables (Waiter)
  if (hasPermission('tables.view')) {
    return <Navigate to="/waiter" replace />;
  }

  // 6. Customers Management
  if (hasPermission('customers.view')) {
    return <Navigate to="/customers" replace />;
  }

  // 7. Menu Management
  if (hasPermission('menu.manage') || hasPermission('menu.view')) {
    return <Navigate to="/menu" replace />;
  }

  // 8. Inbox / WhatsApp
  if (hasPermission('chats.view') || hasPermission('whatsapp.view')) {
    return <Navigate to="/whatsapp" replace />;
  }

  // 9. Graceful fallback for staff with pending role setup
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
      <h2 className="text-xl font-bold text-txt-primary">مرحباً بك في النظام</h2>
      <p className="text-sm text-txt-muted max-w-md">
        تم تسجيل دخولك بنجاح، ولكن حسابك لم يتم تعيين صلاحيات تشغيلية له بعد. يرجى مراجعة إدارة المطعم لتفعيل الصلاحيات المناسبة.
      </p>
    </div>
  );
};

export const GuestRoute = ({ children }) => {
  const { isAuthenticated, isBootstrapping } = useAuth();

  // A login page is a restaurant's page. Without a restaurant host there is no
  // login to show — the URL simply does not exist.
  if (!hasRestaurantHost) {
    return <NotFoundPage />;
  }

  if (isBootstrapping) {
    return <SplashState />;
  }
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};
