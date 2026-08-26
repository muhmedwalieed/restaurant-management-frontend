
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../shared/layout/AppShell.jsx';
import { LoginPage } from '../modules/auth/pages/LoginPage.jsx';
import { EmployeesListPage } from '../modules/employees/pages/EmployeesListPage.jsx';
import { EmployeeDetailPage } from '../modules/employees/pages/EmployeeDetailPage.jsx';
import { RolesListPage } from '../modules/roles/pages/RolesListPage.jsx';
import { RoleEditPage } from '../modules/roles/pages/RoleEditPage.jsx';
import { RestaurantSettingsPage } from '../modules/restaurant/pages/RestaurantSettingsPage.jsx';
import { BranchesListPage } from '../modules/branches/pages/BranchesListPage.jsx';
import { BranchDetailPage } from '../modules/branches/pages/BranchDetailPage.jsx';
import { MenuManagementPage } from '../modules/menu/pages/MenuManagementPage.jsx';
import { ProductDetailPage } from '../modules/menu/pages/ProductDetailPage.jsx';
import { TablesListPage } from '../modules/tables/pages/TablesListPage.jsx';
import { TableDetailPage } from '../modules/tables/pages/TableDetailPage.jsx';
import { PublicTableMenuPage } from '../modules/tables/pages/PublicTableMenuPage.jsx';
import { WebsiteOrderingPage } from '../modules/website/pages/WebsiteOrderingPage.jsx';
import { OrdersListPage } from '../modules/orders/pages/OrdersListPage.jsx';
import { OrderDetailPage } from '../modules/orders/pages/OrderDetailPage.jsx';
import { PosPage } from '../modules/orders/pages/PosPage.jsx';
import { KdsPage } from '../modules/orders/pages/KdsPage.jsx';
import { CustomersListPage } from '../modules/customers/pages/CustomersListPage.jsx';
import { CustomerDetailPage } from '../modules/customers/pages/CustomerDetailPage.jsx';
import { WhatsAppPage } from '../modules/whatsapp/pages/WhatsAppPage.jsx';
import { ConversationsListPage } from '../modules/whatsapp/pages/ConversationsListPage.jsx';
import { ConversationDetailPage } from '../modules/whatsapp/pages/ConversationDetailPage.jsx';
import { useAuth } from '../modules/auth/context/AuthContext.jsx';
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage.jsx';
import { NotificationsPage } from '../modules/notifications/pages/NotificationsPage.jsx';
import { CouponsListPage } from '../modules/coupons/pages/CouponsListPage.jsx';
import { AuditLogsPage } from '../modules/audit-logs/pages/AuditLogsPage.jsx';
import { Button } from '../shared/components/Button.jsx';
import { SplashState } from '../shared/components/SplashState.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isBootstrapping } = useAuth();
  if (isBootstrapping) {
    return <SplashState />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RequirePermission = ({ permission, children }) => {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) {
    return <NotFoundPage />;
  }
  return children;
};

const HomeRedirect = () => {
  const { hasPermission } = useAuth();
  if (hasPermission('dashboard.view')) return <DashboardPage />;
  if (hasPermission(['orders.source_cashier', 'orders.source_phone', 'orders.source_whatsapp', 'orders.source_website'])) {
    return <Navigate to="/pos" replace />;
  }
  if (hasPermission('orders.view')) return <Navigate to="/orders" replace />;
  if (hasPermission('customers.view')) return <Navigate to="/customers" replace />;
  return <DashboardPage />;
};

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
    <h1 className="text-4xl font-bold text-status-danger">404</h1>
    <p className="text-sm text-txt-muted">الصفحة التي تبحث عنها غير موجودة.</p>
    <Button onClick={() => (window.location.href = '/')}>العودة للرئيسية</Button>
  </div>
);

const GuestRoute = ({ children }) => {
  const { isAuthenticated, isBootstrapping } = useAuth();
  if (isBootstrapping) {
    return <SplashState />;
  }
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export const router = createBrowserRouter(
  [
    {
      path: '/menu/table/:qrToken',
      element: <PublicTableMenuPage />,
    },
    {
      path: '/order/:slug',
      element: <WebsiteOrderingPage />,
    },
    {
      path: '/login',
      element: (
        <GuestRoute>
          <LoginPage />
        </GuestRoute>
      ),
    },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomeRedirect />,
      },
      {
        path: 'reports',
        element: (
          <RequirePermission permission="dashboard.view">
            <DashboardPage />
          </RequirePermission>
        ),
      },
      {
        path: 'orders',
        element: (
          <RequirePermission permission="orders.view">
            <OrdersListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <RequirePermission permission="orders.view">
            <OrderDetailPage />
          </RequirePermission>
        ),
      },
      {
        path: 'pos',
        element: (
          <RequirePermission
            permission={['orders.source_cashier', 'orders.source_phone', 'orders.source_whatsapp', 'orders.source_website']}
          >
            <PosPage />
          </RequirePermission>
        ),
      },
      {
        path: 'phone-order',
        element: (
          <RequirePermission permission="orders.create">
            <Navigate to="/pos" replace />
          </RequirePermission>
        ),
      },
      {
        path: 'kds',
        element: (
          <RequirePermission permission="kds.view">
            <KdsPage />
          </RequirePermission>
        ),
      },
      {
        path: 'tables',
        element: (
          <RequirePermission permission={['tables.view', 'tables.manage']}>
            <TablesListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'tables/:id',
        element: (
          <RequirePermission permission={['tables.view', 'tables.manage']}>
            <TableDetailPage />
          </RequirePermission>
        ),
      },
      {
        path: 'menu',
        element: (
          <RequirePermission permission="menu.manage">
            <MenuManagementPage />
          </RequirePermission>
        ),
      },
      {
        path: 'menu/products/:id',
        element: (
          <RequirePermission permission="menu.manage">
            <ProductDetailPage />
          </RequirePermission>
        ),
      },
      {
        path: 'customers',
        element: (
          <RequirePermission permission="customers.view">
            <CustomersListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'customers/:id',
        element: (
          <RequirePermission permission="customers.view">
            <CustomerDetailPage />
          </RequirePermission>
        ),
      },
      {
        path: 'coupons',
        element: (
          <RequirePermission permission="coupons.manage">
            <CouponsListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'notifications',
        element: (
          <RequirePermission permission="notifications.view">
            <NotificationsPage />
          </RequirePermission>
        ),
      },
      {
        path: 'whatsapp',
        element: (
          <RequirePermission permission="whatsapp.view">
            <WhatsAppPage />
          </RequirePermission>
        ),
      },
      {
        path: 'whatsapp/conversations',
        element: (
          <RequirePermission permission="whatsapp.view">
            <ConversationsListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'whatsapp/conversations/:id',
        element: (
          <RequirePermission permission="whatsapp.view">
            <ConversationDetailPage />
          </RequirePermission>
        ),
      },
      {
        path: 'settings/restaurant',
        element: (
          <RequirePermission permission="restaurants.manage">
            <RestaurantSettingsPage />
          </RequirePermission>
        ),
      },
      {
        path: 'settings/branches',
        element: (
          <RequirePermission permission="branches.manage">
            <BranchesListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'settings/branches/:id',
        element: (
          <RequirePermission permission="branches.manage">
            <BranchDetailPage />
          </RequirePermission>
        ),
      },
      {
        path: 'settings/audit-logs',
        element: (
          <RequirePermission permission="audit.view">
            <AuditLogsPage />
          </RequirePermission>
        ),
      },
      {
        path: 'settings/employees',
        element: (
          <RequirePermission permission="employees.view">
            <EmployeesListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'settings/employees/:id',
        element: (
          <RequirePermission permission="employees.view">
            <EmployeeDetailPage />
          </RequirePermission>
        ),
      },
      {
        path: 'settings/roles',
        element: (
          <RequirePermission permission="employees.manage_roles">
            <RolesListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'settings/roles/new',
        element: (
          <RequirePermission permission="employees.manage_roles">
            <RoleEditPage />
          </RequirePermission>
        ),
      },
      {
        path: 'settings/roles/:id/edit',
        element: (
          <RequirePermission permission="employees.manage_roles">
            <RoleEditPage />
          </RequirePermission>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  ],
  { future: { v7_startTransition: true } }
);
