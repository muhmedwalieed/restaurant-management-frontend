/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../shared/layout/AppShell.jsx';
import { LoginPage } from '../modules/auth/pages/LoginPage.jsx';
import { useAuth } from '../modules/auth/context/AuthContext.jsx';
import { StatusPill } from '../shared/components/StatusPill.jsx';
import { Button } from '../shared/components/Button.jsx';
import { EmptyState } from '../shared/components/EmptyState.jsx';
import { LoadingSkeleton } from '../shared/components/LoadingSkeleton.jsx';
import { Store, Layers, CheckCircle2, ShieldCheck } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-txt-primary">الرئيسية — Foundation & App Shell</h1>
            <StatusPill status="success" icon={CheckCircle2}>
              Module 1 Ready
            </StatusPill>
          </div>
          <p className="text-xs text-txt-muted">
            تم تشغيل الهيكل الأساسي للفرونت إند (Vite + React + Design Tokens + API Client) طبقًا لـ Frontend_Project_Guide.md
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Layers}>
            فحص الموديولات
          </Button>
        </div>
      </div>

      {/* Module 1 Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-2">
          <span className="text-xs text-txt-muted">حالة النظام المعماري</span>
          <div className="text-lg font-bold text-brand-primary">React + ESM JS</div>
          <p className="text-[11px] text-status-success font-medium">ADR-F001 Compliant (No TS)</p>
        </div>

        <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-2">
          <span className="text-xs text-txt-muted">نظام الألوان والتصميم</span>
          <div className="text-lg font-bold text-txt-primary">CSS Design Tokens</div>
          <p className="text-[11px] text-txt-muted">Anti-Vibe-Coding Rules</p>
        </div>

        <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-2">
          <span className="text-xs text-txt-muted">طبقة الاتصال بالخادم</span>
          <div className="text-lg font-bold text-txt-primary">Unified API Client</div>
          <p className="text-[11px] text-status-info font-medium">401 & 409 Interceptors Active</p>
        </div>

        <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-2">
          <span className="text-xs text-txt-muted">الاستجابة للشاشات</span>
          <div className="text-lg font-bold text-txt-primary">Responsive 320-1920px</div>
          <p className="text-[11px] text-brand-primary font-medium">Max-width 1600px Bounds</p>
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

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
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
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
