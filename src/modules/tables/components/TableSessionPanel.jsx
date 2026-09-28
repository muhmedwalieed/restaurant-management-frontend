import { useState } from 'react';
import { Button } from '../../../shared/components/Button.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog.jsx';
import {
  useStartTableSession,
  useActiveTableSessionQuery,
  useConfirmTableSession,
  useCloseTableSession,
  useRejectPendingOrder,
  useRegeneratePin,
  useUpdateSessionItemStaff,
  useRemoveSessionItemStaff,
  useAcceptWaiterCall,
  useDismissWaiterCall,
} from '../hooks/useTableSessions.js';
import { TableSessionPinModal } from './session/TableSessionPinModal.jsx';
import { TableSessionPendingOrderCard } from './session/TableSessionPendingOrderCard.jsx';
import { TableSessionOrdersHistory } from './session/TableSessionOrdersHistory.jsx';
import { ReadonlyItemRow } from './session/TableSessionItemsList.jsx';
import { TableSessionWaiterCallBanner } from './session/TableSessionWaiterCallBanner.jsx';
import {
  KeyRound,
  Users,
  XCircle,
  Receipt,
  Eye,
} from 'lucide-react';

const SESSION_STATUS = {
  ACTIVE: { pill: 'warning', label: 'جلسة نشطة' },
  AWAITING_CONFIRMATION: { pill: 'info', label: 'بانتظار تأكيد الويتر' },
  CONFIRMED: { pill: 'success', label: 'تم تأكيد الطلب' },
  CLOSED: { pill: 'neutral', label: 'مغلقة' },
};

export const TableSessionPanel = ({ tableId }) => {
  const [showPin, setShowPin] = useState(null);
  const [startError, setStartError] = useState(null);
  const [startLoading, setStartLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [confirmClose, setConfirmClose] = useState(false);

  const startMutation = useStartTableSession();
  const { data: session, isLoading, refetch } = useActiveTableSessionQuery(tableId, true);
  const confirmMutation = useConfirmTableSession(session?.id);
  const closeMutation = useCloseTableSession(session?.id);
  const rejectMutation = useRejectPendingOrder(session?.id);
  const regenerateMutation = useRegeneratePin(session?.id);
  const updateMutation = useUpdateSessionItemStaff(session?.id);
  const removeMutation = useRemoveSessionItemStaff(session?.id);
  const acceptWaiterCallMutation = useAcceptWaiterCall(session?.id);
  const dismissWaiterCallMutation = useDismissWaiterCall(session?.id);

  const status = SESSION_STATUS[session?.status] || SESSION_STATUS.ACTIVE;
  const pendingOrder = (session?.orders || []).find((o) => o.status === 'AWAITING_CONFIRMATION');
  const confirmedOrders = (session?.orders || []).filter((o) => o.status === 'CONFIRMED');
  const confirmedTotal = confirmedOrders.reduce((s, o) => s + Number(o.total || 0), 0);
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

          <TableSessionWaiterCallBanner
            waiterCall={session.waiterCall}
            acceptMutation={acceptWaiterCallMutation}
            dismissMutation={dismissWaiterCallMutation}
          />

          <TableSessionPendingOrderCard
            pendingOrder={pendingOrder}
            confirmMutation={confirmMutation}
            rejectMutation={rejectMutation}
            updateMutation={updateMutation}
            removeMutation={removeMutation}
            onConfirm={handleConfirm}
            onReject={handleReject}
          />

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
                العميل يقوم حالياً باختيار الأصناف. سيظهر الطلب هنا فور إرساله للمراجعة والتأكيد.
              </p>
            </div>
          )}

          <TableSessionOrdersHistory historyOrders={historyOrders} />

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
                onClick={() => setConfirmClose(true)}
              >
                إغلاق الجلسة
              </Button>
            </PermissionGate>
          </div>
        </div>
      )}

      <TableSessionPinModal
        showPin={showPin}
        onClose={() => setShowPin(null)}
        tableLabel={session?.tableLabel || '—'}
      />

      <ConfirmDialog
        isOpen={confirmClose}
        onClose={() => setConfirmClose(false)}
        title="إغلاق الجلسة"
        message={
          pendingOrder
            ? `فيه أوردر #${pendingOrder.orderNumber} بانتظار التأكيد — الإغلاق هيبطله. هل متأكد من إغلاق الجلسة؟`
            : confirmedTotal > 0
              ? `الجلسة فيها ${confirmedOrders.length} أوردر مؤكد بإجمالي ${confirmedTotal.toFixed(2)} — الأوردرات المؤكدة متسجلة في الفاتورة ولن تتأثر. هل متأكد من إغلاق الجلسة؟`
              : 'متأكد من إغلاق الجلسة؟'
        }
        confirmLabel="نعم، إغلاق الجلسة"
        variant="danger"
        isLoading={closeMutation.isPending}
        onConfirm={handleClose}
      />
    </div>
  );
};

export default TableSessionPanel;
