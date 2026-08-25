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
  useSubmitDraft,
  useUpdateSessionItem,
  useRemoveSessionItem,
} from '../hooks/useTableSessions.js';
import { KeyRound, Users, CheckCircle2, XCircle, Plus, Minus, Trash2, Receipt, Eye, Copy, Check } from 'lucide-react';

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

export const TableSessionPanel = ({ tableId }) => {
  const [showPin, setShowPin] = useState(null);
  const [startError, setStartError] = useState(null);
  const [startLoading, setStartLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const startMutation = useStartTableSession();
  const { data: session, isLoading } = useActiveTableSessionQuery(tableId, true);
  const confirmMutation = useConfirmTableSession(session?.id);
  const closeMutation = useCloseTableSession(session?.id);
  const submitMutation = useSubmitDraft(session?.id);
  const updateMutation = useUpdateSessionItem(session?.id);
  const removeMutation = useRemoveSessionItem(session?.id);

  const status = SESSION_STATUS[session?.status] || SESSION_STATUS.ACTIVE;
  const pendingOrder = (session?.orders || []).find((o) => o.status === 'AWAITING_CONFIRMATION');
  const currentItems = session?.items || [];
  const historyOrders = (session?.orders || []).filter((o) => o.status !== 'AWAITING_CONFIRMATION');

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
    } catch {
      /* ignore */
    }
  };

  const handleConfirm = async () => {
    if (!pendingOrder && currentItems.length > 0) {
      // No submitted round yet — submit the current cart as a round, then confirm it.
      await submitMutation.mutateAsync();
    }
    confirmMutation.mutate();
  };

  const confirmDisabled =
    session?.status === 'CLOSED' || (!pendingOrder && currentItems.length === 0);

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-brand-primary" />
          <h3 className="text-xs font-bold text-txt-primary">جلسة الطلب الذاتي</h3>
        </div>
        {session && <StatusPill status={status.pill}>{status.label}</StatusPill>}
      </div>

      {isLoading ? (
        <LoadingSkeleton height={80} className="w-full" />
      ) : !session ? (
        <div className="space-y-3">
          <p className="text-xs text-txt-muted">
            ابدأ جلسة للعملاء يجلسوا على الطاولة ويطلبوا بأنفسهم عن طريق الـ QR. هتاخد PIN من 4 أرقام تعطيه للعميل.
          </p>
          {startError && <p className="text-xs text-status-danger">{startError}</p>}
          <PermissionGate permission="orders.create">
            <Button size="sm" icon={KeyRound} isLoading={startLoading} onClick={handleStart}>
              بدء جلسة الطاولة
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
              {(session.orders || []).length} أوردرات • {Number(session.total || 0).toFixed(2)}
            </span>
          </div>

          {/* Pending order (awaiting review) */}
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
            </div>
          )}

          {/* Current cart (open round, not yet submitted) */}
          {currentItems.length > 0 && !pendingOrder && (
            <div className="rounded-lg border border-border-subtle bg-bg-base/40 p-3 space-y-2">
              <p className="text-xs font-bold text-txt-primary flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-brand-primary" />
                السلة الحالية
              </p>
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {currentItems.map((item) => (
                  <EditableItemRow
                    key={item.id}
                    item={item}
                    onUpdate={(id, qty) => updateMutation.mutate({ itemId: id, quantity: qty })}
                    onRemove={(id) => removeMutation.mutate(id)}
                  />
                ))}
              </div>
              <p className="text-[11px] text-txt-muted">
                العميل بيبعت الأوردر من صفحته أو تقدر تأكّد من هنا مباشرة.
              </p>
            </div>
          )}

          {/* Order history */}
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
            <PermissionGate permission="orders.create">
              <Button
                size="sm"
                variant="outline"
                icon={Eye}
                onClick={() => setShowPin(session.pin)}
                disabled={!session.pin}
                title="عرض رمز الـ PIN الخاص بالجلسة الحالية"
              >
                عرض الـ PIN
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={CheckCircle2}
                isLoading={confirmMutation.isPending || submitMutation.isPending}
                disabled={confirmDisabled}
                onClick={handleConfirm}
                title="مراجعة وتأكيد الطلب (بيتحول لأوردر حقيقي)"
              >
                {pendingOrder ? `تأكيد أوردر #${pendingOrder.orderNumber}` : 'تأكيد الطلب'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={XCircle}
                isLoading={closeMutation.isPending}
                disabled={session.status === 'CLOSED'}
                onClick={() => closeMutation.mutate()}
              >
                إغلاق الجلسة
              </Button>
            </PermissionGate>
          </div>
        </div>
      )}

      {/* PIN modal */}
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
            <Button size="sm" variant="primary" onClick={() => setShowPin(null)}>تمام</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TableSessionPanel;