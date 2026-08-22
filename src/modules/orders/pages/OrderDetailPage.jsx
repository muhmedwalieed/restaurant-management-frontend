import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useOrderQuery,
  useOrderHistoryQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  usePaymentMutation,
  useRefundMutation,
} from '../hooks/useOrders.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import {
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
  ORDER_SOURCE_LABELS,
  orderStatusPill,
  nextStatuses,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_LABELS,
  paymentStatusPill,
} from '../schemas/order.schema.js';
import { Button } from '../../../shared/components/Button.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import {
  ReceiptText,
  ChevronRight,
  History,
  ListChecks,
  AlertCircle,
  CheckCircle2,
  Ban,
  ChevronLeft,
  Phone,
  Users,
  Tag,
  Wallet,
  Banknote,
} from 'lucide-react';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-3">
    <span className="p-1.5 rounded-md bg-bg-base text-brand-primary shrink-0">
      <Icon className="w-4 h-4" />
    </span>
    <div className="min-w-0">
      <p className="text-[11px] text-txt-muted">{label}</p>
      <p className="text-sm font-semibold text-txt-primary truncate">{value || '—'}</p>
    </div>
  </div>
);

const historyTitle = (h) => {
  if (h.reason?.startsWith('Payment processed')) return 'تم الدفع';
  if (h.reason?.startsWith('Payment refunded')) return 'استرداد المبلغ';
  if (h.reason === 'Order created') return 'تم إنشاء الطلب';
  if (h.toStatus) return ORDER_STATUS_LABELS[h.toStatus] || h.toStatus;
  return '—';
};

const historySub = (h) => {
  if (h.reason?.startsWith('Payment processed')) {
    const method = h.reason.match(/\((\w+)\)/)?.[1];
    return method ? `الدفع (${PAYMENT_METHOD_LABELS[method] || method})` : 'الدفع';
  }
  if (h.reason?.startsWith('Payment refunded')) return h.reason.replace('Payment refunded:', 'سبب الاسترداد:');
  if (h.reason === 'Order created') return 'تم تسجيل الطلب في النظام';
  if (h.reason?.startsWith('Status updated from')) {
    const match = h.reason.match(/from (\w+) to (\w+)/);
    if (match) return `من ${ORDER_STATUS_LABELS[match[1]] || match[1]} إلى ${ORDER_STATUS_LABELS[match[2]] || match[2]}`;
  }
  return h.reason || '';
};

export const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeBranchId } = useBranch();
  const [activeTab, setActiveTab] = useState('details');
  const [actionSuccess, setActionSuccess] = useAutoDismiss();
  const [actionError, setActionError] = useState(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  const branchId = activeBranchId;
  const { data: order, isLoading, isError, error, refetch } = useOrderQuery(branchId, id);
  const { data: history, isLoading: isHistoryLoading } = useOrderHistoryQuery(branchId, id);
  const updateStatusMutation = useUpdateOrderStatusMutation();
  const cancelMutation = useCancelOrderMutation();
  const paymentMutation = usePaymentMutation();
  const refundMutation = useRefundMutation();

  const runAction = async (fn) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await fn();
      setActionSuccess('تم تنفيذ العملية بنجاح.');
      return true;
    } catch (err) {
      setActionError(err?.message || 'حدث خطأ أثناء تنفيذ العملية.');
      return false;
    }
  };

  const handleAdvance = (newStatus) => {
    runAction(() =>
      updateStatusMutation.mutateAsync({ branchId, id, payload: { newStatus, expectedVersion: order.version } })
    );
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setActionError('سبب الإلغاء مطلوب.');
      return;
    }
    const ok = await runAction(() =>
      cancelMutation.mutateAsync({ branchId, id, payload: { expectedVersion: order.version, reason: cancelReason } })
    );
    if (ok) {
      setIsCancelOpen(false);
      setCancelReason('');
    }
  };

  const handlePayment = async () => {
    const ok = await runAction(() =>
      paymentMutation.mutateAsync({
        branchId,
        orderId: id,
        payload: {
          paymentMethod,
          amount: paymentAmount ? Number(paymentAmount) : undefined,
          expectedVersion: order.version,
        },
      })
    );
    if (ok) {
      setIsPaymentOpen(false);
      setPaymentAmount('');
    }
  };

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      setActionError('سبب الاسترداد مطلوب.');
      return;
    }
    const ok = await runAction(() =>
      refundMutation.mutateAsync({
        branchId,
        orderId: id,
        payload: { expectedVersion: order.version, reason: refundReason },
      })
    );
    if (ok) {
      setIsRefundOpen(false);
      setRefundReason('');
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
        <h3 className="text-base font-bold text-txt-primary">فشل في تحميل تفاصيل الطلب</h3>
        <p className="text-xs text-txt-muted">{error?.message || 'تعذر التواصل مع الخادم.'}</p>
        <Button size="sm" variant="outline" onClick={refetch}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  const allowedNext = nextStatuses(order?.status, order?.type);
  const isCancelled = order?.status === 'CANCELLED';
  const isTerminal = order?.status === 'DELIVERED' || isCancelled;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => navigate('/orders')} icon={ChevronRight}>
          العودة للطلبات
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-brand-primary" />
            <span>طلب #{order?.orderNumber}</span>
          </h1>
          <StatusPill status={orderStatusPill(order?.status)}>{ORDER_STATUS_LABELS[order?.status] || order?.status}</StatusPill>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border-default bg-bg-surface px-4 pt-2 rounded-t-lg">
        {[
          { key: 'details', label: 'تفاصيل الطلب', icon: ListChecks },
          { key: 'history', label: 'السجل الزمني', icon: History },
          { key: 'payment', label: 'الدفع', icon: Wallet },
          { key: 'actions', label: 'الإجراءات', icon: ChevronLeft },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-txt-muted hover:text-txt-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-bg-surface border border-border-default border-t-0 rounded-b-lg p-6">
        {actionSuccess && (
          <div className="mb-4 p-3 rounded-md text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="mb-4 p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Tab 1: Details */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border-default flex items-center gap-2">
                  <ReceiptText className="w-4 h-4 text-brand-primary" />
                  <h3 className="text-sm font-bold text-txt-primary">معلومات الطلب</h3>
                </div>
                <div className="px-4 py-2 divide-y divide-border-subtle">
                  <InfoRow icon={Tag} label="النوع" value={ORDER_TYPE_LABELS[order?.type] || order?.type} />
                  <InfoRow icon={Phone} label="المصدر" value={ORDER_SOURCE_LABELS[order?.source] || order?.source} />
                  <InfoRow icon={Users} label="العميل / الترابيزة" value={order?.customer?.phone || order?.customer?.name || (order?.table ? `ترابيزة ${order.table.label}` : '—')} />
                  {order?.notes && <InfoRow icon={ReceiptText} label="ملاحظات" value={order.notes} />}
                  {order?.cancelReason && <InfoRow icon={Ban} label="سبب الإلغاء" value={order.cancelReason} />}
                </div>
              </div>

              {/* Items */}
              <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border-default">
                  <h3 className="text-sm font-bold text-txt-primary">الأصناف</h3>
                </div>
                <div className="divide-y divide-border-subtle">
                  {order?.items?.map((item) => (
                    <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-txt-primary">{item.quantity}x</span>
                        <span className="text-sm font-semibold text-txt-primary">{item.productName}</span>
                      </div>
                      <span className="text-sm font-bold text-txt-primary">{Number(item.subtotal || 0).toFixed(2)} EGP</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-border-default flex items-center justify-between">
                  <span className="text-sm font-semibold text-txt-primary">الإجمالي</span>
                  <span className="text-base font-bold text-brand-primary">{Number(order?.total || 0).toFixed(2)} EGP</span>
                </div>
              </div>
            </div>

            {/* Quick view */}
            <div className="space-y-6">
              <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border-default">
                  <h3 className="text-sm font-bold text-txt-primary">نظرة سريعة</h3>
                </div>
                <div className="px-4 py-2 divide-y divide-border-subtle">
                  <InfoRow icon={Tag} label="الحالة" value={ORDER_STATUS_LABELS[order?.status] || order?.status} />
                  <InfoRow icon={ReceiptText} label="رقم الطلب" value={`#${order?.orderNumber}`} />
                  <InfoRow icon={History} label="الإصدار (Version)" value={String(order?.version)} />
                  <InfoRow icon={History} label="وقت الإنشاء" value={order?.createdAt ? new Date(order.createdAt).toLocaleString('ar-EG') : '—'} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: History */}
        {activeTab === 'history' && (
          <div>
            {isHistoryLoading ? (
              <LoadingSkeleton height={200} className="w-full" />
            ) : !history || history.length === 0 ? (
              <p className="text-sm text-txt-muted text-center py-8">لا يوجد سجل زمني بعد.</p>
            ) : (
              <ol className="relative border-r border-border-default mr-3 space-y-5">
                {history.map((h, idx) => (
                  <li key={h.id || idx} className="mr-6 relative">
                    <span className="absolute -right-[27px] top-1 w-3 h-3 rounded-full bg-brand-primary" />
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-bold text-txt-primary">
                        {historyTitle(h)}
                      </span>
                      <span className="text-[11px] text-txt-muted">
                        {new Date(h.createdAt).toLocaleString('ar-EG')}
                      </span>
                    </div>
                    {historySub(h) && <p className="text-xs text-txt-muted mt-1">{historySub(h)}</p>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {/* Tab 3: Payment */}
        {activeTab === 'payment' && (
          <div className="space-y-5">
            <div className="bg-bg-base border border-border-default rounded-lg p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-md bg-bg-surface-elevated text-brand-primary">
                  <Wallet className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-xs text-txt-muted">حالة الدفع</p>
                  <StatusPill status={paymentStatusPill(order?.paymentStatus)}>
                    {PAYMENT_STATUS_LABELS[order?.paymentStatus] || order?.paymentStatus}
                  </StatusPill>
                </div>
              </div>
              <div className="text-left">
                <p className="text-xs text-txt-muted">الإجمالي</p>
                <p className="text-lg font-bold text-brand-primary">{Number(order?.total || 0).toFixed(2)} EGP</p>
              </div>
            </div>

            {order?.paymentStatus === 'PAID' && order?.paidAt && (
              <div className="bg-bg-base border border-border-default rounded-lg p-4 text-xs text-txt-muted">
                مدفوع بتاريخ {new Date(order.paidAt).toLocaleString('ar-EG')} —
                {order.paymentMethod ? ` طريقة الدفع: ${PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}` : ''}
              </div>
            )}
            {order?.paymentStatus === 'REFUNDED' && order?.refundReason && (
              <div className="bg-bg-base border border-border-default rounded-lg p-4 text-xs text-txt-muted">
                سبب الاسترداد: {order.refundReason}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2">
              {order?.paymentStatus !== 'PAID' && order?.paymentStatus !== 'REFUNDED' && order?.status !== 'CANCELLED' && (
                <PermissionGate permission="orders.payment">
                  <Button variant="primary" size="sm" icon={Banknote} onClick={() => setIsPaymentOpen(true)}>
                    تحصيل الدفع
                  </Button>
                </PermissionGate>
              )}
              {order?.paymentStatus === 'PAID' && (
                <PermissionGate permission="orders.refund">
                  <Button variant="danger" size="sm" icon={Wallet} onClick={() => setIsRefundOpen(true)}>
                    استرداد المبلغ
                  </Button>
                </PermissionGate>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Actions */}
        {activeTab === 'actions' && (
          <div className="space-y-5">
            {isTerminal ? (
              <div className="p-6 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-txt-muted mx-auto" />
                <p className="text-sm font-bold text-txt-primary">
                  الطلب في حالة نهائية ({ORDER_STATUS_LABELS[order?.status]})
                </p>
                <p className="text-xs text-txt-muted">لا يمكن تعديل حالة هذا الطلب.</p>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-sm font-bold text-txt-primary mb-3">تحديث الحالة (State Machine)</h3>
                  {allowedNext.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {allowedNext.map((s) => (
                        <PermissionGate key={s} permission="orders.update">
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={updateStatusMutation.isPending}
                            onClick={() => handleAdvance(s)}
                          >
                            {ORDER_STATUS_LABELS[s] || s}
                          </Button>
                        </PermissionGate>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-txt-muted">لا توجد انتقالات مسموحة من الحالة الحالية.</p>
                  )}
                </div>

                <div className="pt-4 border-t border-border-subtle">
                  <h3 className="text-sm font-bold text-txt-primary mb-3">إلغاء الطلب</h3>
                  <PermissionGate permission="orders.cancel">
                    <Button variant="danger" size="sm" icon={Ban} onClick={() => setIsCancelOpen(true)}>
                      إلغاء الطلب
                    </Button>
                  </PermissionGate>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal isOpen={isCancelOpen} onClose={() => setIsCancelOpen(false)} title="تأكيد إلغاء الطلب" size="sm">
        <div className="space-y-4 text-right">
          <p className="text-xs text-txt-muted">
            سيتم إلغاء الطلب <span className="font-bold text-txt-primary">#{order?.orderNumber}</span>. هل أنت متأكد؟
          </p>
          <Input
            label="سبب الإلغاء (مطلوب)"
            placeholder="مثال: العميل ألغى الطلب"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button variant="outline" size="sm" onClick={() => setIsCancelOpen(false)} disabled={cancelMutation.isPending}>
              تراجع
            </Button>
            <Button variant="danger" size="sm" isLoading={cancelMutation.isPending} onClick={handleCancel}>
              تأكيد الإلغاء
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} title="تحصيل الدفع" size="sm">
        <div className="space-y-4 text-right">
          <p className="text-xs text-txt-muted">
            استلام دفعة الطلب <span className="font-bold text-txt-primary">#{order?.orderNumber}</span> بمبلغ{' '}
            <span className="font-bold text-brand-primary">{Number(order?.total || 0).toFixed(2)} EGP</span>
          </p>
          <Select
            label="طريقة الدفع"
            options={PAYMENT_METHOD_OPTIONS}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <Input
            label="المبلغ (اختياري — الافتراضي الإجمالي)"
            type="number"
            step="0.01"
            min="0"
            dir="ltr"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button variant="outline" size="sm" onClick={() => setIsPaymentOpen(false)} disabled={paymentMutation.isPending}>
              تراجع
            </Button>
            <Button variant="primary" size="sm" isLoading={paymentMutation.isPending} onClick={handlePayment}>
              تأكيد الدفع
            </Button>
          </div>
        </div>
      </Modal>

      {/* Refund Modal */}
      <Modal isOpen={isRefundOpen} onClose={() => setIsRefundOpen(false)} title="استرداد المبلغ" size="sm">
        <div className="space-y-4 text-right">
          <p className="text-xs text-txt-muted">
            سيتم استرداد مبلغ الطلب <span className="font-bold text-txt-primary">#{order?.orderNumber}</span>.
          </p>
          <Input
            label="سبب الاسترداد (مطلوب)"
            placeholder="مثال: خطأ في الطلب"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button variant="outline" size="sm" onClick={() => setIsRefundOpen(false)} disabled={refundMutation.isPending}>
              تراجع
            </Button>
            <Button variant="danger" size="sm" isLoading={refundMutation.isPending} onClick={handleRefund}>
              تأكيد الاسترداد
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};