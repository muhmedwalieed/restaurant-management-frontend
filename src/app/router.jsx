/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../shared/layout/AppShell.jsx';
import { LoginPage } from '../modules/auth/pages/LoginPage.jsx';
import { EmployeesListPage } from '../modules/employees/pages/EmployeesListPage.jsx';
import { RolesListPage } from '../modules/roles/pages/RolesListPage.jsx';
import { RestaurantSettingsPage } from '../modules/restaurant/pages/RestaurantSettingsPage.jsx';
import { BranchesListPage } from '../modules/branches/pages/BranchesListPage.jsx';
import { BranchDetailPage } from '../modules/branches/pages/BranchDetailPage.jsx';
import { useAuth } from '../modules/auth/context/AuthContext.jsx';
import { StatusPill } from '../shared/components/StatusPill.jsx';
import { Button } from '../shared/components/Button.jsx';
import { EmptyState } from '../shared/components/EmptyState.jsx';
import { LoadingSkeleton } from '../shared/components/LoadingSkeleton.jsx';
import { SplashState } from '../shared/components/SplashState.jsx';
import { Store, CheckCircle2, ShieldCheck, Users, Shield } from 'lucide-react';
import { NavLink } from 'react-router-dom';

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

// Section 13 — permission-gated routes are enforced before render, not just hidden
const RequirePermission = ({ permission, children }) => {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Root Dashboard Placeholder View (Foundation Shell demonstration)
const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      {/* Welcome & Module Status Header */}
      <div className="bg-bg-surface border border-border-default rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-txt-primary">لوحة التحكم — SaaS Dashboard</h1>
            <StatusPill status="success" icon={CheckCircle2}>
              Module 1 & 2 Ready
            </StatusPill>
          </div>
          <p className="text-xs text-txt-muted">
            تكامل أنظمة المصادقة، إدارة الموظفين، والأدوار والصلاحيات مع الهيكل الأساسي للواجهة
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <NavLink to="/settings/employees">
            <Button variant="primary" size="sm" icon={Users}>
              إدارة الموظفين
            </Button>
          </NavLink>
          <NavLink to="/settings/roles">
            <Button variant="outline" size="sm" icon={Shield}>
              الصلاحيات والأدوار
            </Button>
          </NavLink>
        </div>
      </div>

      {/* Module 2 Active Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-2">
          <span className="text-xs text-txt-muted">المصادقة والأمان</span>
          <div className="text-lg font-bold text-brand-primary">Real REST API</div>
          <p className="text-[11px] text-status-success font-medium">Session & Force Logout UX</p>
        </div>

        <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-2">
          <span className="text-xs text-txt-muted">إدارة أطقم العمل</span>
          <div className="text-lg font-bold text-txt-primary">Employees CRUD</div>
          <p className="text-[11px] text-status-info font-medium">Roles & Passwords Modals</p>
        </div>

        <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-2">
          <span className="text-xs text-txt-muted">الأدوار والصلاحيات</span>
          <div className="text-lg font-bold text-txt-primary">Permissions Matrix</div>
          <p className="text-[11px] text-brand-primary font-medium">PermissionGate Active</p>
        </div>

        <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-2">
          <span className="text-xs text-txt-muted">استجابة الجداول (Section 20.4)</span>
          <div className="text-lg font-bold text-txt-primary">DataTable Component</div>
          <p className="text-[11px] text-status-success font-medium">Condensed Mobile Cards</p>
        </div>
      </div>

      {/* Demonstration of Shared Primitives & UI States */}
      <div className="bg-bg-surface border border-border-default rounded-lg p-6 space-y-4">
        <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-primary" />
          <span>اختبار المكونات الأساسية (Shared Primitives)</span>
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">زرار رئيسي (Primary)</Button>
          <Button variant="secondary">زرار ثانوية (Secondary)</Button>
          <Button variant="outline">زرار إطار (Outline)</Button>
          <Button variant="danger">زرار تحذير (Danger)</Button>
          <Button variant="primary" isLoading>
            جاري التحميل
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <StatusPill status="success">نشط / مكتمل</StatusPill>
          <StatusPill status="warning">قيد الانتظار</StatusPill>
          <StatusPill status="danger">ملغى / متوقف</StatusPill>
          <StatusPill status="info">معلومات</StatusPill>
          <StatusPill status="neutral">مسودة</StatusPill>
        </div>
      </div>

      {/* Demonstration of Content Skeleton & Empty State */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-surface border border-border-default rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-bold text-txt-primary">نموذج Skeleton التحميل</h3>
          <div className="space-y-3">
            <LoadingSkeleton height={40} className="w-full" />
            <LoadingSkeleton height={20} className="w-3/4" />
            <LoadingSkeleton height={20} className="w-1/2" />
          </div>
        </div>

        <div className="bg-bg-surface border border-border-default rounded-lg p-6">
          <h3 className="text-sm font-bold text-txt-primary mb-2">نموذج Empty State مع إشعار وظيفي</h3>
          <EmptyState
            title="لا توجد أوردرات نشطة الآن"
            description="عند استقبال أوردرات جديدة من الكاشير أو الواتساب ستظهر تلقائيًا هنا."
            actionLabel="إنشاء أوردر سريع"
            onAction={() => alert('سيتم تفعيله في Module 6/8')}
            icon={Store}
          />
        </div>
      </div>
    </div>
  );
};

// 404 Fallback View
const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
    <h1 className="text-4xl font-bold text-status-danger">404</h1>
    <p className="text-sm text-txt-muted">الصفحة التي تبحث عنها غير موجودة.</p>
    <Button onClick={() => (window.location.href = '/')}>العودة للرئيسية</Button>
  </div>
);

// Guest-only route: no login flash on refresh while the session is being restored,
// and authenticated users are sent back to the app.
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
        element: <DashboardOverview />,
      },
      {
        path: 'orders',
        element: <DashboardOverview />,
      },
      {
        path: 'kds',
        element: <DashboardOverview />,
      },
      {
        path: 'tables',
        element: <DashboardOverview />,
      },
      {
        path: 'menu',
        element: <DashboardOverview />,
      },
      {
        path: 'customers',
        element: <DashboardOverview />,
      },
      {
        path: 'whatsapp',
        element: <DashboardOverview />,
      },
      {
        path: 'reports',
        element: <DashboardOverview />,
      },
      {
        path: 'settings',
        element: <DashboardOverview />,
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
        path: 'settings/employees',
        element: (
          <RequirePermission permission="employees.view">
            <EmployeesListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'settings/roles',
        element: (
          <RequirePermission permission="employees.view">
            <RolesListPage />
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
