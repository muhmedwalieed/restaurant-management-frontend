import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import QRCode from 'react-qr-code';
import { useTableQuery, useUpdateTableMutation, useRegenerateQrMutation } from '../hooks/useTables.js';
import { useTableActiveOrdersQuery, ORDER_STATUS_LABELS, orderStatusPill } from '../hooks/useTableOrders.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { tableFormSchema, TABLE_STATUS_OPTIONS } from '../schemas/table.schema.js';
import { Button } from '../../../shared/components/Button.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import {
  Grid3x3,
  ChevronRight,
  Users,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Building2,
  Receipt,
  Clock,
  Copy,
  Check,
} from 'lucide-react';

const QR_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" rx="14" fill="#f59e0b"/><text x="24" y="31" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#0f172a" text-anchor="middle">QR</text></svg>`;
const QR_LOGO_DATA_URL = `data:image/svg+xml,${encodeURIComponent(QR_LOGO_SVG)}`;

export const TableDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeBranchId, activeBranch } = useBranch();
  const [activeTab, setActiveTab] = useState('general');
  const [generalSuccess, setGeneralSuccess] = useAutoDismiss();
  const [generalError, setGeneralError] = useState(null);
  const [qrMessage, setQrMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  const branchId = activeBranchId;

  const { data: table, isLoading, isError, error, refetch } = useTableQuery(branchId, id);
  const updateTableMutation = useUpdateTableMutation();
  const regenerateMutation = useRegenerateQrMutation();
  const {
    data: activeOrders,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    refetch: refetchOrders,
  } = useTableActiveOrdersQuery(branchId, id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tableFormSchema),
    values: {
      label: table?.label || '',
      capacity: table?.capacity ?? 2,
      status: table?.status || 'AVAILABLE',
    },
  });

  const handleGeneralSubmit = async (formData) => {
    setGeneralSuccess(null);
    setGeneralError(null);
    try {
      await updateTableMutation.mutateAsync({ branchId, id, payload: formData });
      setGeneralSuccess('تم تحديث بيانات الترابيزة بنجاح.');
    } catch (err) {
      setGeneralError(err?.message || 'حدث خطأ أثناء تحديث بيانات الترابيزة.');
    }
  };

  const handleRegenerateQr = async () => {
    setQrMessage(null);
    if (!window.confirm('سيتم توليد رمز QR جديد وإلغاء الرمز القديم. هل أنت متأكد؟')) return;
    try {
      await regenerateMutation.mutateAsync({ branchId, id });
      setQrMessage('تم توليد رمز QR جديد بنجاح.');
    } catch (err) {
      setQrMessage(err?.message || 'حدث خطأ أثناء توليد رمز QR.');
    }
  };

  const handleCopyLink = async () => {
    if (!table?.qrUrl) return;
    try {
      await navigator.clipboard.writeText(table.qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setQrMessage('تعذر نسخ الرابط.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton height={48} className="w-1/3" />
        <LoadingSkeleton height={300} className="w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-status-danger-bg border border-status-danger/30 rounded-lg p-6 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-status-danger mx-auto" />
        <h3 className="text-base font-bold text-txt-primary">فشل في تحميل تفاصيل الترابيزة</h3>
        <p className="text-xs text-txt-muted">{error?.message || 'تعذر التواصل مع الخادم.'}</p>
        <Button size="sm" variant="outline" onClick={refetch}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section with back button */}
      <div className="flex items-center gap-3 pb-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => navigate('/tables')} icon={ChevronRight}>
          العودة للترابيزات
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-brand-primary" />
            <span>{table?.label || 'تفاصيل الترابيزة'}</span>
          </h1>
          {activeBranch && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-bg-surface-elevated text-txt-muted border border-border-subtle">
              <Building2 className="w-3 h-3" />
              {activeBranch.name}
            </span>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border-default bg-bg-surface px-4 pt-2 rounded-t-lg">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-txt-muted hover:text-txt-primary'
          }`}
        >
          <Grid3x3 className="w-4 h-4" />
          <span>البيانات العامة</span>
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'qr'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-txt-muted hover:text-txt-primary'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>رمز QR</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-txt-muted hover:text-txt-primary'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>الطلبات النشطة ({activeOrders?.length || 0})</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="bg-bg-surface border border-border-default border-t-0 rounded-b-lg p-6">
        {/* Tab 1: General Info */}
        {activeTab === 'general' && (
          <form onSubmit={handleSubmit(handleGeneralSubmit)} className="space-y-6 text-right" noValidate>
            {generalSuccess && (
              <div className="p-3 rounded-md text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{generalSuccess}</span>
              </div>
            )}

            {generalError && (
              <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="اسم / رقم الترابيزة"
                icon={Grid3x3}
                required
                error={errors.label?.message}
                {...register('label')}
              />

              <Input
                label="السعة (عدد الأفراد)"
                type="number"
                min="1"
                icon={Users}
                error={errors.capacity?.message}
                {...register('capacity')}
              />
            </div>

            <Select
              label="حالة الترابيزة"
              options={TABLE_STATUS_OPTIONS}
              error={errors.status?.message}
              {...register('status')}
            />

            <div className="flex items-center justify-end pt-4 border-t border-border-subtle">
              <PermissionGate permission="tables.manage">
                <Button type="submit" variant="primary" size="sm" isLoading={updateTableMutation.isPending}>
                  حفظ البيانات العامة
                </Button>
              </PermissionGate>
            </div>
          </form>
        )}

        {/* Tab 2: QR Code */}
        {activeTab === 'qr' && (
          <div className="space-y-5">
            {qrMessage && (
              <div
                className={`p-3 rounded-md text-xs font-medium flex items-center gap-2 ${
                  qrMessage.includes('خطأ')
                    ? 'bg-status-danger-bg text-status-danger border border-status-danger/30'
                    : 'bg-status-success-bg text-status-success border border-status-success/30'
                }`}
              >
                {qrMessage.includes('خطأ') ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                <span>{qrMessage}</span>
              </div>
            )}

            {/* Modern QR Card */}
            <div className="flex flex-col items-center gap-5 py-2">
              {/* QR Card */}
              <div className="relative p-6 bg-white rounded-2xl shadow-lg ring-1 ring-border-default">
                {/* Decorative corner accents */}
                <span className="absolute top-2 left-2 w-6 h-6 border-t-2 border-r-2 border-brand-primary rounded-tr-md opacity-40" />
                <span className="absolute top-2 right-2 w-6 h-6 border-t-2 border-l-2 border-brand-primary rounded-tl-md opacity-40" />
                <span className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-r-2 border-brand-primary rounded-br-md opacity-40" />
                <span className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-l-2 border-brand-primary rounded-bl-md opacity-40" />

                {table?.qrUrl ? (
                  <QRCode
                    value={table.qrUrl}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    level="H"
                    imageSettings={{ src: QR_LOGO_DATA_URL, height: 44, width: 44, excavate: true }}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="w-[220px] h-[220px] flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-txt-muted" />
                  </div>
                )}
              </div>

              {/* Table label under QR */}
              <div className="text-center">
                <h3 className="text-base font-bold text-txt-primary">{table?.label}</h3>
                <p className="text-xs text-txt-muted">
                  {activeBranch?.name} · امسح الرمز لفتح المنيو الإلكتروني
                </p>
              </div>

              {/* URL + actions */}
              {table?.qrUrl && (
                <div className="w-full max-w-lg bg-bg-base border border-border-subtle rounded-lg p-3 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-txt-muted dir-ltr truncate">{table.qrUrl}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="outline" icon={copied ? Check : Copy} onClick={handleCopyLink}>
                      {copied ? 'تم النسخ' : 'نسخ'}
                    </Button>
                    <a href={table.qrUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="primary" icon={ExternalLink}>
                        فتح المنيو
                      </Button>
                    </a>
                  </div>
                </div>
              )}

              <p className="text-xs text-txt-muted text-center max-w-md">
                اطبع رمز QR ده أو شاركه مع العملاء — عند مسحه هيفتح المنيو الإلكتروني الخاص بالترابيزة مباشرة.
              </p>

              <PermissionGate permission="tables.manage">
                <Button
                  size="sm"
                  variant="outline"
                  icon={RefreshCw}
                  isLoading={regenerateMutation.isPending}
                  onClick={handleRegenerateQr}
                >
                  توليد رمز QR جديد
                </Button>
              </PermissionGate>
            </div>
          </div>
        )}

        {/* Tab 3: Active Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {table?.status === 'OCCUPIED' && (
              <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
                <Receipt className="w-4 h-4 shrink-0" />
                <span>الترابيزة مشغولة حالياً — عليها {activeOrders?.length || 0} طلب نشط.</span>
              </div>
            )}

            {isOrdersLoading ? (
              <LoadingSkeleton height={120} className="w-full" />
            ) : isOrdersError ? (
              <div className="p-4 bg-status-danger/10 border border-status-danger/30 rounded-md text-xs text-status-danger text-center">
                تعذر جلب طلبات الترابيزة.
                <Button size="sm" variant="outline" className="mr-2" onClick={() => refetchOrders()}>
                  إعادة المحاولة
                </Button>
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="p-6 text-center space-y-1">
                <Receipt className="w-8 h-8 text-txt-muted mx-auto" />
                <p className="text-sm font-bold text-txt-primary">لا توجد طلبات نشطة على الترابيزة</p>
                <p className="text-xs text-txt-muted">
                  الترابيزة متاحة حاليًا — عند إنشاء طلب على هذه الترابيزة هيظهر هنا تلقائيًا.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-bg-surface-elevated border-b border-border-default text-txt-muted font-bold">
                    <tr>
                      <th className="p-3">رقم الطلب</th>
                      <th className="p-3">الحالة</th>
                      <th className="p-3">الأصناف</th>
                      <th className="p-3">الإجمالي</th>
                      <th className="p-3">وقت الإنشاء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default">
                    {activeOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-bg-surface-elevated/40 transition-colors">
                        <td className="p-3">
                          <span className="font-mono font-bold text-txt-primary">#{order.orderNumber}</span>
                        </td>
                        <td className="p-3">
                          <StatusPill status={orderStatusPill(order.status)}>
                            {ORDER_STATUS_LABELS[order.status] || order.status}
                          </StatusPill>
                        </td>
                        <td className="p-3 text-txt-muted">
                          {order.items?.length || 0} صنف
                        </td>
                        <td className="p-3 font-bold text-txt-primary">
                          {Number(order.total || 0).toFixed(2)} EGP
                        </td>
                        <td className="p-3 text-txt-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(order.createdAt).toLocaleString('ar-EG')}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};