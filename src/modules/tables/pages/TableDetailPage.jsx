import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { useTableQuery } from '../hooks/useTables.js';
import { useTableActiveOrdersQuery, ORDER_STATUS_LABELS, orderStatusPill } from '../hooks/useTableOrders.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { TABLE_STATUS_LABELS } from '../schemas/table.schema.js';
import { Button } from '../../../shared/components/Button.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { TableSessionPanel } from '../components/TableSessionPanel.jsx';
import {
  Grid3x3,
  ChevronRight,
  Users,
  QrCode,
  Receipt,
  AlertCircle,
  Copy,
  Check,
  Download,
  Printer,
  ArrowUpRight,
} from 'lucide-react';

const QR_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" rx="14" fill="#f59e0b"/><text x="24" y="31" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#0f172a" text-anchor="middle">QR</text></svg>`;
const QR_LOGO_DATA_URL = `data:image/svg+xml,${encodeURIComponent(QR_LOGO_SVG)}`;

const statusPill = (status) => {
  const map = {
    AVAILABLE: 'success',
    OCCUPIED: 'danger',
    RESERVED: 'warning',
    MAINTENANCE: 'neutral',
  };
  return map[status] || 'neutral';
};

const formatSmartRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  const diffMin = Math.floor(diffSec / 60);

  if (diffSec < 60) return 'الآن';
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  if (diffMin < 120) return 'منذ ساعة';

  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (isToday) return `اليوم، ${timeStr}`;
  return `${date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}، ${timeStr}`;
};

export const TableDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeBranchId, activeBranch } = useBranch();
  const [copied, setCopied] = useState(false);

  const branchId = activeBranchId;

  const { data: table, isLoading, isError, error, refetch } = useTableQuery(branchId, id);
  const {
    data: activeOrders,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    refetch: refetchOrders,
  } = useTableActiveOrdersQuery(branchId, id);

  const handleCopyLink = async () => {
    if (!table?.qrUrl) return;
    try {
      await navigator.clipboard.writeText(table.qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      void err;
    }
  };

  const handleDownloadQr = () => {
    const svg = document.getElementById('table-qr-code');
    if (!svg) return;
    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width + 40;
        canvas.height = img.height + 40;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `table-${table?.label || id}-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      void err;
    }
  };

  const handlePrintQr = () => {
    const qrElem = document.getElementById('table-qr-print-area');
    if (!qrElem) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>طاولة ${table?.label || ''} - رمز QR</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 40px; color: #0f172a; }
            .card { display: inline-block; padding: 32px; border: 2px solid #cbd5e1; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            h2 { margin: 0 0 6px; font-size: 26px; font-weight: 800; }
            p { margin: 0 0 20px; color: #64748b; font-size: 14px; }
            .qr-wrapper { background: #fff; padding: 12px; display: inline-block; border-radius: 12px; }
            .footer-tip { margin-top: 18px; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>طاولة ${table?.label || ''}</h2>
            <p>${activeBranch?.name || ''} • امسح الرمز لطلب الطعام مباشرة</p>
            <div class="qr-wrapper">${qrElem.innerHTML}</div>
            <div class="footer-tip">امسح بكاميرا الهاتف لفتح المنيو الذكي</div>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton height={48} className="w-1/3" />
        <LoadingSkeleton height={120} className="w-full" />
        <LoadingSkeleton height={220} className="w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-status-danger-bg border border-status-danger/30 rounded-lg p-6 text-center space-y-3">
        <AlertCircle className="w-6 h-6 text-status-danger mx-auto" />
        <h3 className="text-base font-bold text-txt-primary">فشل في تحميل تفاصيل الطاولة</h3>
        <p className="text-xs text-txt-muted">{error?.message || 'تعذر التواصل مع الخادم.'}</p>
        <Button size="sm" variant="outline" onClick={refetch}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  const hasActiveOrders = Array.isArray(activeOrders) && activeOrders.length > 0;

  return (
    <div className="space-y-5">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/tables')}
            icon={ChevronRight}
            className="border-white/10 text-xs"
          >
            العودة للطاولات
          </Button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
              <Grid3x3 className="w-5 h-5 text-brand-primary" />
              <span>طاولة {table?.label}</span>
            </h1>
            <StatusPill status={statusPill(table?.status)}>
              {TABLE_STATUS_LABELS[table?.status] || table?.status}
            </StatusPill>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {}
        <div className="lg:col-span-7 space-y-5">
          {}
          <div className="bg-bg-surface border border-border-default rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Grid3x3 className="w-4 h-4 text-brand-primary" />
                <h3 className="text-xs font-bold text-txt-primary">بيانات الطاولة</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-bg-base/40 border border-border-subtle rounded-lg p-3 space-y-1">
                <p className="text-[11px] font-semibold text-txt-muted">رقم الطاولة</p>
                <p className="text-sm font-bold text-txt-primary font-mono">{table?.label || '—'}</p>
              </div>
              <div className="bg-bg-base/40 border border-border-subtle rounded-lg p-3 space-y-1">
                <p className="text-[11px] font-semibold text-txt-muted flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  السعة
                </p>
                <p className="text-sm font-bold text-txt-primary">{table?.capacity ?? '—'} أفراد</p>
              </div>
              <div className="bg-bg-base/40 border border-border-subtle rounded-lg p-3 space-y-1">
                <p className="text-[11px] font-semibold text-txt-muted">حالة الطاولة</p>
                <StatusPill status={statusPill(table?.status)}>
                  {TABLE_STATUS_LABELS[table?.status] || table?.status}
                </StatusPill>
              </div>
            </div>
          </div>

          {}
          {hasActiveOrders && (
            <div className="bg-bg-surface border border-border-default rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-brand-primary" />
                  <h3 className="text-xs font-bold text-txt-primary">الطلبات النشطة الحالية</h3>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                  مشغولة • {activeOrders.length} طلب نشط
                </span>
              </div>

              {isOrdersLoading ? (
                <LoadingSkeleton height={100} className="w-full" />
              ) : isOrdersError ? (
                <div className="p-4 bg-status-danger/10 border border-status-danger/30 rounded-lg text-xs text-status-danger text-center">
                  تعذر جلب طلبات الطاولة.
                  <Button size="sm" variant="outline" className="mr-2" onClick={() => refetchOrders()}>
                    إعادة المحاولة
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border-subtle">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-bg-base/60 border-b border-border-subtle text-txt-muted font-bold">
                      <tr>
                        <th className="p-3">رقم الطلب</th>
                        <th className="p-3">الحالة</th>
                        <th className="p-3">الوقت</th>
                        <th className="p-3">الأصناف</th>
                        <th className="p-3">الإجمالي</th>
                        <th className="p-3 text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {activeOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 font-mono font-bold text-txt-primary">#{order.orderNumber}</td>
                          <td className="p-3">
                            <StatusPill status={orderStatusPill(order.status)} className="text-[10px] px-2 py-0.5">
                              {ORDER_STATUS_LABELS[order.status] || order.status}
                            </StatusPill>
                          </td>
                          <td className="p-3 text-txt-muted whitespace-nowrap">
                            {formatSmartRelativeTime(order.createdAt)}
                          </td>
                          <td className="p-3 text-txt-muted font-mono">{order.items?.length || 0} صنف</td>
                          <td className="p-3 font-bold text-white font-mono whitespace-nowrap">
                            {Number(order.total || 0).toFixed(2)} EGP
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/orders/${order.id}`)}
                              icon={ArrowUpRight}
                              className="border-white/10 hover:bg-white/[0.06] text-xs h-7 px-2"
                            >
                              عرض الفاتورة
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {}
          {table?.id && <TableSessionPanel tableId={table.id} />}
        </div>

        {}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-bg-surface border border-border-default rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-brand-primary" />
                <h3 className="text-xs font-bold text-txt-primary">رمز QR للطلب الذاتي</h3>
              </div>
            </div>

            <p className="text-xs text-txt-muted leading-relaxed">
              امسح الرمز لفتح قائمة الطعام الرقمية الخاصة بهذه الطاولة.
            </p>

            {}
            <div className="flex flex-col items-center justify-center p-5 bg-bg-base/60 border border-border-subtle rounded-xl">
              <div id="table-qr-print-area" className="p-4 bg-white rounded-xl ring-1 ring-border-default shadow-sm inline-block">
                {table?.qrUrl ? (
                  <div className="relative inline-block">
                    <QRCode
                      id="table-qr-code"
                      value={table.qrUrl}
                      size={180}
                      bgColor="#ffffff"
                      fgColor="#0f172a"
                      level="H"
                      className="rounded-md"
                    />
                    <img
                      src={QR_LOGO_DATA_URL}
                      alt=""
                      className="absolute inset-0 m-auto w-9 h-9 rounded-md pointer-events-none"
                    />
                  </div>
                ) : (
                  <div className="w-[180px] h-[180px] flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-txt-muted" />
                  </div>
                )}
              </div>
              <div className="text-center mt-3">
                <h4 className="text-sm font-bold text-txt-primary font-mono">طاولة #{table?.label}</h4>
                <p className="text-[11px] text-txt-muted">{activeBranch?.name || 'الفرع الحالي'}</p>
              </div>
            </div>

            {}
            {table?.qrUrl && (
              <div className="space-y-2">
                <div className="bg-bg-base border border-border-subtle rounded-lg p-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-txt-muted dir-ltr truncate font-mono select-all">
                    {table.qrUrl}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={copied ? Check : Copy}
                    onClick={handleCopyLink}
                    className="border-white/10 text-xs shrink-0 h-7 px-2.5"
                  >
                    {copied ? 'تم النسخ' : 'نسخ'}
                  </Button>
                </div>
              </div>
            )}

            {}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
              <Button
                size="sm"
                variant="outline"
                icon={Download}
                onClick={handleDownloadQr}
                className="border-white/10 hover:bg-white/[0.06] text-xs"
              >
                تحميل (PNG)
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={Printer}
                onClick={handlePrintQr}
                className="border-white/10 hover:bg-white/[0.06] text-xs"
              >
                طباعة الرمز
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDetailPage;
