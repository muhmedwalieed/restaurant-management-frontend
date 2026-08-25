import { useState } from 'react';
import { Button } from '../../../shared/components/Button.jsx';
import { Modal } from '../../../shared/components/Modal.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import {
  useStartTableSession,
  useActiveTableSessionQuery,
  useConfirmTableSession,
  useCloseTableSession,
  useRejectPendingOrder,
  useRegeneratePin,
  useUpdateSessionItem,
  useRemoveSessionItem,
} from '../hooks/useTableSessions.js';
import {
  KeyRound,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Eye,
  Copy,
  Check,
  Printer,
  Undo2,
} from 'lucide-react';

const SESSION_STATUS = {
  ACTIVE: { pill: 'warning', label: 'جلسة نشطة' },
  AWAITING_CONFIRMATION: { pill: 'info', label: 'بانتظار تأكيد الويتر' },
  CONFIRMED: { pill: 'success', label: 'تم تأكيد الطلب' },
  CLOSED: { pill: 'neutral', label: 'مغلقة' },
};

const ORDER_STATUS_LABEL = {
  AWAITING_CONFIRMATION: { pill: 'warning', label: 'قيد المراجعة' },
  CONFIRMED: { pill: 'success', label: 'مؤكد' },
  CANCELLED: { pill: 'neutral', label: 'ملغي' },
};

const EditableItemRow = ({ item, onUpdate, onRemove }) => (
  <div className="flex items-center justify-between gap-2 bg-bg-base/60 border border-border-subtle rounded-lg p-2 text-xs">
    <div className="min-w-0 flex-1">
      <p className="font-semibold text-txt-primary truncate">{item.productName}</p>
      <p className="text-[11px] text-txt-muted">
        {item.quantity} × {Number(item.unitPrice).toFixed(2)} = {Number(item.total).toFixed(2)}
      </p>
      {item.addedByName && <p className="text-[11px] text-brand-primary">{item.addedByName} أضافها</p>}
    </div>
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={() => onUpdate(item.id, Math.max(1, item.quantity - 1))}
        className="w-5 h-5 rounded border border-white/10 flex items-center justify-center"
      >
        <Minus className="w-3 h-3" />
      </button>
      <button
        onClick={() => onUpdate(item.id, item.quantity + 1)}
        className="w-5 h-5 rounded border border-white/10 flex items-center justify-center"
      >
        <Plus className="w-3 h-3" />
      </button>
      <button onClick={() => onRemove(item.id)} className="w-5 h-5 rounded hover:text-red-400 flex items-center justify-center">
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  </div>
);

const ReadonlyItemRow = ({ item }) => (
  <div className="flex items-center justify-between gap-2 bg-bg-base/60 border border-border-subtle rounded-lg p-2 text-xs">
    <div className="min-w-0 flex-1">
      <p className="font-semibold text-txt-primary truncate">{item.productName}</p>
      <p className="text-[11px] text-txt-muted">
        {item.quantity} × {Number(item.unitPrice).toFixed(2)} = {Number(item.total).toFixed(2)}
      </p>
      {item.addedByName && <p className="text-[11px] text-brand-primary">{item.addedByName} أضافها</p>}
    </div>
    <span className="font-mono font-bold text-txt-primary shrink-0">{Number(item.total).toFixed(2)}</span>
  </div>
);

export const TableSessionPanel = ({ tableId }) => {
  const [showPin, setShowPin] = useState(null);
  const [startError, setStartError] = useState(null);
  const [startLoading, setStartLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const startMutation = useStartTableSession();
  const { data: session, isLoading, refetch } = useActiveTableSessionQuery(tableId, true);
  const confirmMutation = useConfirmTableSession(session?.id);
  const closeMutation = useCloseTableSession(session?.id);
  const rejectMutation = useRejectPendingOrder(session?.id);
  const regenerateMutation = useRegeneratePin(session?.id);
  const updateMutation = useUpdateSessionItem(session?.id);
  const removeMutation = useRemoveSessionItem(session?.id);

  const status = SESSION_STATUS[session?.status] || SESSION_STATUS.ACTIVE;
  const pendingOrder = (session?.orders || []).find((o) => o.status === 'AWAITING_CONFIRMATION');
  const currentItems = session?.items || [];
  const historyOrders = (session?.orders || []).filter((o) => o.status !== 'AWAITING_CONFIRMATION');
  const grandTotal = Number(session?.grandTotal || 0).toFixed(2);

  const handleStart = async () => {
    setStartError(null);
    setStartLoading(true);
    try {
      const res = await startMutation.mutateAsync(tableId);
      setShowPin(res.pin);
    } catch (err) {
      setStartError(err?.message || 'تعذر بدء الجلسة.');
    } finally {
      setStartLoading(false);
    }
  };

  const handleCopyPin = async () => {
    if (!showPin) return;
    try {
      await navigator.clipboard.writeText(showPin);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      void err;
    }
  };

  const handlePrintPin = () => {
    if (!showPin) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const label = session?.tableLabel || '—';
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>طاولة ${label} - PIN</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 28px; background: #f1f5f9; text-align: center; color: #0f172a; }
            .card { display: inline-block; margin-top: 20px; padding: 44px 56px; background: #ffffff; border-radius: 22px; border: 2px solid #cbd5e1; box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
            .table-label { font-size: 14px; color: #64748b; font-weight: 600; }
            .table-name { font-size: 34px; font-weight: 800; margin: 6px 0 22px; }
            .divider { border-top: 2px dashed #cbd5e1; margin-bottom: 20px; }
            .pin-label { font-size: 13px; color: #64748b; font-weight: 600; }
            .pin { font-size: 72px; font-weight: 900; letter-spacing: 20px; direction: ltr; font-family: 'Courier New', ui-monospace, monospace; margin: 14px 0 10px; color: #0f172a; }
            .tip { font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="table-label">رقم الطاولة</div>
            <div class="table-name">طاولة ${label}</div>
            <div class="divider"></div>
            <div class="pin-label">رمز الدخول للطلب الذاتي</div>
            <div class="pin">${showPin}</div>
            <div class="tip">أدخل هذا الرمز مع اسمك في صفحة الـ QR لبدء الطلب</div>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleConfirm = async () => {
    setActionError(null);
    setActionSuccess(null);
    if (!session?.id) return;
    try {
      await confirmMutation.mutateAsync();
      setActionSuccess(`تم تأكيد أوردر #${pendingOrder?.orderNumber || ''} وإضافته للفاتورة.`);
      await refetch();
    } catch (err) {
      setActionError(err?.message || 'تعذر تأكيد الطلب.');
    }
  };

  const handleReject = async () => {
    setActionError(null);
    setActionSuccess(null);
    if (!session?.id) return;
    try {
      await rejectMutation.mutateAsync();
      setActionSuccess(`تم إرجاع أوردر #${pendingOrder?.orderNumber || ''} للعميل ليقدر يعدّل عليه.`);
      await refetch();
    } catch (err) {
      setActionError(err?.message || 'تعذر إرجاع الطلب للعميل.');
    }
  };

  const handleClose = async () => {
    setActionError(null);
    setActionSuccess(null);
    if (!session?.id) return;
    try {
      await closeMutation.mutateAsync();
      setActionSuccess('تم إغلاق الجلسة.');
      await refetch();
    } catch (err) {
      setActionError(err?.message || 'تعذر إغلاق الجلسة.');
    }
  };

  const handleShowPin = async () => {
    setActionError(null);
    if (!session?.id) return;
    if (session?.pin) {
      setShowPin(session.pin);
      return;
    }
    try {
      const res = await regenerateMutation.mutateAsync();
      setShowPin(res.pin);
    } catch (err) {
      setActionError(err?.message || 'تعذر توليد الـ PIN.');
    }
  };

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-brand-primary" />
          <h3 className="text-xs font-bold text-txt-primary">جلسة الطلب الذاتي</h3>
        </div>
        {session?.id && <StatusPill status={status.pill}>{status.label}</StatusPill>}
      </div>

      {isLoading ? (
        <LoadingSkeleton height={80} className="w-full" />
      ) : !session?.id ? (
        <div className="space-y-3">
          <p className="text-xs text-txt-muted">
            ابدأ جلسة للعملاء يجلسوا على الطاولة ويطلبوا بأنفسهم عن طريق الـ QR. هتاخد PIN من 4 أرقام تعطيه للعميل.
          </p>
          {startError && <p className="text-xs text-status-danger">{startError}</p>}
          <PermissionGate permission="orders.create">
            <Button size="sm" icon={KeyRound} isLoading={startLoading} onClick={handleStart}>
              إنشاء جلسة
            </Button>
          </PermissionGate>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-txt-muted">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              الأعضاء: {(session.members || []).map((m) => m.name).join('، ') || '—'}
            </span>
            <span className="font-mono font-bold text-txt-primary">
              {(session.orders || []).length} أوردرات • إجمالي {grandTotal}
            </span>
          </div>

          {}
          {pendingOrder && (
            <div className="rounded-lg border border-status-warning/30 bg-status-warning/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-status-warning flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  أوردر #{pendingOrder.orderNumber} بانتظار المراجعة
                </p>
                <span className="text-xs font-mono font-bold text-txt-primary">
                  {Number(pendingOrder.total || 0).toFixed(2)}
                </span>
              </div>
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {pendingOrder.items.map((item) => (
                  <EditableItemRow
                    key={item.id}
                    item={item}
                    onUpdate={(id, qty) => updateMutation.mutate({ itemId: id, quantity: qty })}
                    onRemove={(id) => removeMutation.mutate(id)}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  variant="primary"
                  icon={CheckCircle2}
                  isLoading={confirmMutation.isPending}
                  onClick={handleConfirm}
                >
                  تأكيد أوردر #{pendingOrder.orderNumber}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={Undo2}
                  isLoading={rejectMutation.isPending}
                  onClick={handleReject}
                  title="إرجاع الأوردر للعميل ليقدر يعدّل عليه ويبعت تاني"
                >
                  إرجاع للعميل
                </Button>
              </div>
            </div>
          )}

          {}
          {currentItems.length > 0 && !pendingOrder && (
            <div className="rounded-lg border border-border-subtle bg-bg-base/40 p-3 space-y-2">
              <p className="text-xs font-bold text-txt-primary flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-brand-primary" />
                السلة الحالية
              </p>
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {currentItems.map((item) => (
                  <ReadonlyItemRow key={item.id} item={item} />
                ))}
              </div>
              <p className="text-[11px] text-txt-muted">
                العميل لسه بيعدّل في السلة. لما يبعت الأوردر هيظهر هنا للتعديل والتأكيد.
              </p>
            </div>
          )}

          {}
          {historyOrders.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-txt-muted">أوردرات الجلسة السابقة</p>
              {historyOrders.map((order) => {
                const st = ORDER_STATUS_LABEL[order.status] || ORDER_STATUS_LABEL.CANCELLED;
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-2 bg-bg-base/40 border border-border-subtle rounded-lg px-3 py-2 text-xs"
                  >
                    <span className="font-semibold text-txt-primary">أوردر #{order.orderNumber}</span>
                    <div className="flex items-center gap-2">
                      <StatusPill status={st.pill}>{st.label}</StatusPill>
                      <span className="font-mono font-bold text-txt-primary" dir="ltr">
                        {Number(order.total || 0).toFixed(2)}
                      </span>
                      {order.orderId && <span className="text-[10px] text-txt-muted">#{order.orderId.slice(-4)}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
            {actionSuccess && <p className="w-full text-[11px] font-medium text-status-success">{actionSuccess}</p>}
            {actionError && <p className="w-full text-[11px] font-medium text-status-danger">{actionError}</p>}
            <PermissionGate permission="orders.create">
              <Button
                size="sm"
                variant="outline"
                icon={Eye}
                isLoading={regenerateMutation.isPending}
                onClick={handleShowPin}
                title={session.pin ? 'عرض رمز الـ PIN الخاص بالجلسة الحالية' : 'توليد رمز PIN جديد'}
              >
                {session.pin ? 'عرض الـ PIN' : 'توليد الـ PIN'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={XCircle}
                isLoading={closeMutation.isPending}
                disabled={session.status === 'CLOSED'}
                onClick={handleClose}
              >
                إغلاق الجلسة
              </Button>
            </PermissionGate>
          </div>
        </div>
      )}

      {}
      <Modal isOpen={Boolean(showPin)} onClose={() => setShowPin(null)} title="PIN جلسة الطاولة" size="sm">
        <div className="text-center space-y-4 py-2">
          <p className="text-xs text-txt-muted">أعطِ هذا الرمز للعميل عشان يدخل الجلسة من الـ QR:</p>
          <div className="text-4xl font-bold tracking-[0.4em] text-brand-primary font-mono" dir="ltr">
            {showPin}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" variant="outline" icon={copied ? Check : Copy} onClick={handleCopyPin}>
              {copied ? 'تم النسخ' : 'نسخ الرمز'}
            </Button>
            <Button size="sm" variant="outline" icon={Printer} onClick={handlePrintPin}>
              طباعة الـ PIN
            </Button>
            <Button size="sm" variant="primary" onClick={() => setShowPin(null)}>تمام</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TableSessionPanel;
