import { useState } from 'react';
import { Users, Grid3x3, X, ArrowUpRight, KeyRound, QrCode, Copy, Check, Printer } from 'lucide-react';
import { Button } from '../../../shared/components/Button.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { TableQrPanel } from './TableQrPanel.jsx';
import { TableSessionPanel } from './TableSessionPanel.jsx';
import { TABLE_STATUS_LABELS } from '../schemas/table.schema.js';
import { useActiveTableSessionQuery } from '../hooks/useTableSessions.js';
import { printHtml } from '../../../lib/print.js';

const statusPill = (status) => {
  const map = {
    AVAILABLE: 'success',
    OCCUPIED: 'danger',
    RESERVED: 'warning',
    MAINTENANCE: 'neutral',
  };
  return map[status] || 'neutral';
};

export const TableDetailDrawer = ({ isOpen, onClose, table, branchName }) => {
  const { data: session } = useActiveTableSessionQuery(table?.id);
  const [activeTab, setActiveTab] = useState('session');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !table) return null;

  const hasSession = Boolean(session);
  const effectiveStatus = hasSession
    ? {
        label: session.status === 'AWAITING_CONFIRMATION' ? 'بانتظار التأكيد' : 'جلسة نشطة',
        tone: 'warning',
      }
    : { label: TABLE_STATUS_LABELS[table.status] || table.status, tone: statusPill(table.status) };

  const handleCopyPin = async () => {
    if (!session?.pin) return;
    try {
      await navigator.clipboard.writeText(session.pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const handlePrintPin = () => {
    if (!session?.pin) return;
    printHtml(
      `
      <div style="text-align:center; padding:24px; font-family:Arial, sans-serif;">
        <div style="font-size:14px; color:#333;">رقم الطاولة</div>
        <div style="font-size:34px; font-weight:800; margin:6px 0 22px; color:#000;">طاولة ${table.label}</div>
        <div style="border-top:2px dashed #ccc; margin-bottom:20px;"></div>
        <div style="font-size:13px; color:#333;">رمز الدخول للطلب الذاتي</div>
        <div style="font-size:72px; font-weight:900; letter-spacing:20px; color:#000; direction:ltr; margin:14px 0 10px;">${session.pin}</div>
        <div style="font-size:12px; color:#94a3b8;">أدخل هذا الرمز مع اسمك في صفحة الـ QR لبدء الطلب</div>
      </div>
    `,
      'printing-pin'
    );
  };

  const tabBtn = (active) =>
    `py-2 rounded-md text-xs font-bold transition-all ${
      active ? 'bg-brand-primary text-slate-950 shadow-sm' : 'text-txt-muted hover:text-txt-primary hover:bg-white/[0.04]'
    }`;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-bg-surface border-l border-white/[0.07] shadow-2xl flex flex-col animate-slide-in-right">
        <div className="p-4 border-b border-border-default shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-2 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary shrink-0">
                <Grid3x3 className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-txt-primary">طاولة {table.label}</h2>
                <p className="text-[11px] text-txt-muted truncate">
                  سعة {table.capacity} مقاعد • {branchName || 'الفرع الحالي'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusPill status={effectiveStatus.tone}>{effectiveStatus.label}</StatusPill>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-md text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 pt-3 shrink-0">
          <div className="grid grid-cols-2 gap-1 p-1 bg-bg-base/60 border border-border-default rounded-lg">
            <button type="button" onClick={() => setActiveTab('session')} className={`flex items-center justify-center gap-1.5 ${tabBtn(activeTab === 'session')}`}>
              <KeyRound className="w-3.5 h-3.5" />
              الجلسة والطلبات
            </button>
            <button type="button" onClick={() => setActiveTab('qr')} className={`flex items-center justify-center gap-1.5 ${tabBtn(activeTab === 'qr')}`}>
              <QrCode className="w-3.5 h-3.5" />
              رمز QR والطاولة
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {activeTab === 'session' ? (
            <>
              {hasSession && (
                <div className="rounded-xl border border-brand-primary/30 bg-brand-primary/[0.06] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-txt-muted flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-brand-primary" />
                      رمز الدخول (PIN)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCopyPin}
                        className="px-2 py-1 rounded-md text-[10px] font-bold bg-bg-surface border border-border-subtle text-txt-muted hover:text-txt-primary flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'تم' : 'نسخ'}
                      </button>
                      <button
                        type="button"
                        onClick={handlePrintPin}
                        className="px-2 py-1 rounded-md text-[10px] font-bold bg-bg-surface border border-border-subtle text-txt-muted hover:text-txt-primary flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        طباعة
                      </button>
                    </div>
                  </div>
                  <div className="text-3xl font-bold tracking-[0.3em] text-brand-primary font-mono" dir="ltr">
                    {session.pin}
                  </div>
                  <p className="text-[10px] text-txt-muted flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {session.members?.length || 0} عميل جالس على الطاولة
                  </p>
                </div>
              )}

              {table.id && <TableSessionPanel tableId={table.id} />}
            </>
          ) : (
            <>
              {table.qrUrl && (
                <a href={table.qrUrl} target="_blank" rel="noreferrer" className="block">
                  <Button size="sm" variant="outline" icon={ArrowUpRight} className="w-full border-white/10 text-xs">
                    معاينة القائمة الرقمية
                  </Button>
                </a>
              )}
              <TableQrPanel table={table} branchName={branchName} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableDetailDrawer;