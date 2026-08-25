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
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import { ReceiptPrintTemplate } from '../components/ReceiptPrintTemplate.jsx';
import {
  ReceiptText,
  ChevronRight,
  History,
  AlertCircle,
  CheckCircle2,
  Ban,
  Tag,
  Wallet,
  Banknote,
  Printer,
  UtensilsCrossed,
  Copy,
  Check,
} from 'lucide-react';

const formatSmartDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  const timeFormatted = date.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (diffMinutes < 1 && diffMinutes >= 0) {
    return `الآن (${timeFormatted})`;
  }

  if (diffMinutes < 60 && diffMinutes > 0) {
    return `منذ ${diffMinutes} دقيقة`;
  }

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `اليوم، ${timeFormatted}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `أمس، ${timeFormatted}`;
  }

  if (date.getFullYear() === now.getFullYear()) {
    const dayMonth = date.toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
    });
    return `${dayMonth}، ${timeFormatted}`;
  }

  const fullDate = date.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `${fullDate}، ${timeFormatted}`;
};

const parseHistoryMetadata = (h) => {
  let title = 'تحديث الطلب';
  let subtitle = '';

  if (h.reason === 'Order created') {
    title = 'تم إنشاء الطلب';
    subtitle = h.employee?.name ? `بواسطة: ${h.employee.name}` : 'بواسطة: النظام';
  } else if (h.reason?.startsWith('Order round')) {
    const round = h.reason.match(/\d+/)?.[0] || '';
    title = round === '1' ? 'تم إنشاء الطلب' : `تمت إضافة طلب إضافي (جولة ${round})`;
    subtitle = h.employee?.name ? `بواسطة: ${h.employee.name}` : 'بواسطة: النظام';
  } else if (h.reason?.startsWith('Payment processed')) {
    title = 'تم تحصيل الدفع';
    const method = h.reason.match(/\((\w+)\)/)?.[1];
    subtitle = method ? `طريقة الدفع: ${PAYMENT_METHOD_LABELS[method] || method}` : 'تم الدفع بنجاح';
  } else if (h.reason?.startsWith('Payment refunded')) {
    title = 'استرداد المبلغ';
    subtitle = h.reason.replace('Payment refunded:', 'سبب الاسترداد:');
  } else if (h.reason?.startsWith('Status updated from')) {
    const match = h.reason.match(/from (\w+) to (\w+)/);
    if (match) {
      title = ORDER_STATUS_LABELS[match[2]] ? `تم نقل الطلب إلى: ${ORDER_STATUS_LABELS[match[2]]}` : `تحديث الحالة إلى ${match[2]}`;
      subtitle = h.employee?.name ? `بواسطة: ${h.employee.name}` : (ORDER_STATUS_LABELS[match[1]] ? `من: ${ORDER_STATUS_LABELS[match[1]]}` : '');
    }
  } else if (h.toStatus) {
    title = ORDER_STATUS_LABELS[h.toStatus] ? `تم تغيير الحالة إلى: ${ORDER_STATUS_LABELS[h.toStatus]}` : h.toStatus;
    subtitle = h.employee?.name ? `بواسطة: ${h.employee.name}` : (h.reason || '');
  } else {
    title = h.reason || 'تحديث على الطلب';
  }

  return { title, subtitle };
};

const ItemModifiers = ({ item }) =>
  item?.selectedModifiers?.length ? (
    <span className="text-[11px] text-brand-primary mt-0.5 truncate">
      {item.selectedModifiers.map((m) => m.name).join(' + ')}
    </span>
  ) : null;

export const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeBranchId, activeBranch } = useBranch();
  const [actionSuccess, setActionSuccess] = useAutoDismiss();
  const [actionError, setActionError] = useState(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundError, setRefundError] = useState(null);
  const [cancelAlso, setCancelAlso] = useState(true);
  const [isCopiedPhone, setIsCopiedPhone] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

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
      setCancelError('سبب الإلغاء مطلوب');
      return;
    }
    setCancelError(null);
    const ok = await runAction(() =>
      cancelMutation.mutateAsync({ branchId, id, payload: { expectedVersion: order.version, reason: cancelReason } })
    );
    if (ok) {
      setIsCancelOpen(false);
      setCancelReason('');
      setCancelError(null);
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
      setRefundError('سبب الاسترداد مطلوب');
      return;
    }
    setRefundError(null);
    const shouldCancel = cancelAlso && order?.status !== 'CANCELLED' && order?.status !== 'DELIVERED';

    const ok = await runAction(async () => {
      const refundRes = await refundMutation.mutateAsync({
        branchId,
        orderId: id,
        payload: { expectedVersion: order.version, reason: refundReason },
      });

      if (shouldCancel) {
        const nextVersion = refundRes?.version ?? (refundRes?.data?.version ?? (order.version + 1));
        await cancelMutation.mutateAsync({
          branchId,
          id,
          payload: { expectedVersion: nextVersion, reason: refundReason },
        });
      }
    });

    if (ok) {
      setIsRefundOpen(false);
      setRefundReason('');
      setRefundError(null);
      if (shouldCancel) {
        setActionSuccess('تم استرداد المبلغ وإلغاء الطلب بنجاح.');
      }
    }
  };

  const handleCopyPhone = (phone) => {
    if (!phone) return;
    navigator.clipboard?.writeText?.(phone);
    setIsCopiedPhone(true);
    setTimeout(() => setIsCopiedPhone(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton height={48} className="w-1/3" />
        <LoadingSkeleton height={320} className="w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-status-danger-bg border border-status-danger/30 rounded-lg p-6 text-center space-y-3">
        <AlertCircle className="w-6 h-6 text-status-danger mx-auto" />
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

  const customerAddress =
    order?.customer?.address ||
    (order?.customer?.addresses && order.customer.addresses.length > 0
      ? [order.customer.addresses[0]?.street, order.customer.addresses[0]?.city].filter(Boolean).join(' - ')
      : null);

  const roundsMap = new Map();
  for (const it of order?.items || []) {
    const r = it.round || 1;
    if (!roundsMap.has(r)) roundsMap.set(r, []);
    roundsMap.get(r).push(it);
  }
  const orderRounds = Array.from(roundsMap.entries())
    .map(([round, items]) => ({
      round,
      items,
      subtotal: items.reduce((acc, i) => acc + Number(i.subtotal || 0), 0),
    }))
    .sort((a, b) => a.round - b.round);

  return (
    <>
      <div className="space-y-5 print:hidden">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/orders')}
            icon={ChevronRight}
            className="text-xs shrink-0"
          >
            العودة للطلبات
          </Button>

          <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
            <h1 className="text-lg font-bold text-txt-primary flex items-center gap-2 truncate">
              <ReceiptText className="w-5 h-5 text-brand-primary shrink-0" />
              <span>طلب #{order?.orderNumber}</span>
            </h1>

            {}
            <StatusPill status={orderStatusPill(order?.status)}>
              {ORDER_STATUS_LABELS[order?.status] || order?.status}
            </StatusPill>
          </div>
        </div>

        {}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            icon={Printer}
            onClick={() => setIsPrintModalOpen(true)}
            className="text-xs"
          >
            طباعة الفاتورة
          </Button>
        </div>
      </div>

      {}
      {actionSuccess && (
        <div className="p-3 rounded-lg text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3 rounded-lg text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {}
        <div className="lg:col-span-2 space-y-5">
          {}
          <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border-default flex items-center justify-between bg-bg-base/40">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-brand-primary shrink-0" />
                <h3 className="text-xs font-bold text-txt-primary">الأصناف المطلوبة</h3>
              </div>
              <span className="text-xs text-txt-muted">
                {order?.items?.length || 0} أصناف
                {orderRounds.length > 1 ? ` • ${orderRounds.length} طلبات` : ''}
              </span>
            </div>

            {}
            {orderRounds.length > 1 ? (
              <div className="divide-y divide-white/[0.06]">
                {orderRounds.map((round) => (
                  <div key={round.round} className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-txt-primary">
                        {round.round === 1 ? 'الطلب الأول' : `الطلب ${round.round === 2 ? 'الثاني' : `#${round.round}`}`}
                        <span className="text-[11px] font-semibold text-txt-muted mr-1">(جولة {round.round})</span>
                      </h4>
                      <span className="text-[11px] font-mono font-bold text-txt-primary" dir="ltr">
                        حساب الطلب: {round.subtotal.toFixed(2)} EGP
                      </span>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-border-subtle">
                      <table className="w-full text-xs text-right">
                        <thead className="bg-bg-base/60 text-txt-muted border-b border-border-default select-none">
                          <tr>
                            <th className="px-4 py-2 font-semibold">الصنف</th>
                            <th className="px-4 py-2 font-semibold text-center w-20">الكمية</th>
                            <th className="px-4 py-2 font-semibold text-left w-28">السعر</th>
                            <th className="px-4 py-2 font-semibold text-left w-28">الإجمالي</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                          {round.items.map((item) => (
                            <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-txt-primary">{item.productName}</span>
                                  {item.notes && (
                                    <span className="text-[11px] text-txt-muted mt-0.5">
                                      ملاحظات: {item.notes}
                                    </span>
                                  )}
                                  <ItemModifiers item={item} />
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center font-mono font-bold text-txt-primary">
                                {item.quantity}×
                              </td>
                              <td className="px-4 py-3 text-left font-mono tabular-nums text-txt-muted">
                                {Number(item.unitPrice || 0).toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-left font-mono font-bold tabular-nums text-txt-primary">
                                {Number(item.subtotal || 0).toFixed(2)} EGP
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead className="bg-bg-base/60 text-txt-muted border-b border-border-default select-none">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">الصنف</th>
                      <th className="px-4 py-2.5 font-semibold text-center w-20">الكمية</th>
                      <th className="px-4 py-2.5 font-semibold text-left w-28">السعر</th>
                      <th className="px-4 py-2.5 font-semibold text-left w-28">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {order?.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-txt-primary">{item.productName}</span>
                            {item.notes && (
                              <span className="text-[11px] text-txt-muted mt-0.5">
                                ملاحظات: {item.notes}
                              </span>
                            )}
                            <ItemModifiers item={item} />
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-txt-primary">
                          {item.quantity}×
                        </td>
                        <td className="px-4 py-3.5 text-left font-mono tabular-nums text-txt-muted">
                          {Number(item.unitPrice || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5 text-left font-mono font-bold tabular-nums text-txt-primary">
                          {Number(item.subtotal || 0).toFixed(2)} EGP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {}
            <div className="p-4 border-t border-white/[0.08] bg-bg-base/30 space-y-2 text-xs">
              {orderRounds.length > 1 && (
                <div className="space-y-1 pb-2 border-b border-white/[0.06]">
                  {orderRounds.map((round) => (
                    <div key={round.round} className="flex items-center justify-between text-txt-muted">
                      <span>حساب {round.round === 1 ? 'الطلب الأول' : `الطلب ${round.round === 2 ? 'الثاني' : `#${round.round}`}`}:</span>
                      <span className="font-mono tabular-nums">{round.subtotal.toFixed(2)} EGP</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-txt-muted">
                <span>المجموع الفرعي:</span>
                <span className="font-mono tabular-nums">{Number(order?.subtotal || order?.total || 0).toFixed(2)} EGP</span>
              </div>
              {order?.tax > 0 && (
                <div className="flex items-center justify-between text-txt-muted">
                  <span>الضريبة:</span>
                  <span className="font-mono tabular-nums">{Number(order.tax).toFixed(2)} EGP</span>
                </div>
              )}
              {order?.discount > 0 && (
                <div className="flex items-center justify-between text-status-success font-medium">
                  <span>الخصم:</span>
                  <span className="font-mono tabular-nums">-{Number(order.discount).toFixed(2)} EGP</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.08] text-sm font-bold">
                <span className="text-white">الإجمالي النهائي:</span>
                <span className="font-mono text-base font-bold text-white tabular-nums">
                  {Number(order?.total || 0).toFixed(2)} EGP
                </span>
              </div>
            </div>
          </div>

          {}
          {(order?.notes || order?.cancelReason) && (
            <div className="bg-bg-surface border border-border-default rounded-xl p-4 space-y-3 shadow-sm">
              {order?.notes && (
                <div>
                  <h4 className="text-xs font-bold text-txt-primary mb-1">ملاحظات الطلب:</h4>
                  <p className="text-xs text-txt-muted bg-bg-base p-2.5 rounded-lg border border-border-subtle">
                    {order.notes}
                  </p>
                </div>
              )}
              {order?.cancelReason && (
                <div>
                  <h4 className="text-xs font-bold text-status-danger mb-1 flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5" />
                    <span>سبب الإلغاء:</span>
                  </h4>
                  <p className="text-xs text-status-danger bg-status-danger-bg p-2.5 rounded-lg border border-status-danger/30">
                    {order.cancelReason}
                  </p>
                </div>
              )}
            </div>
          )}

          {}
          <div className="bg-bg-surface border border-border-default rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <History className="w-4 h-4 text-brand-primary shrink-0" />
              <h3 className="text-xs font-bold text-txt-primary">السجل الزمني ومراحل الطلب</h3>
            </div>

            {isHistoryLoading ? (
              <LoadingSkeleton height={140} className="w-full" />
            ) : !history || history.length === 0 ? (
              <p className="text-xs text-txt-muted text-center py-4">لا توجد حركات مسجلة لهذا الطلب بعد.</p>
            ) : (
              <ol className="relative border-r border-white/10 mr-2 space-y-5 pr-1">
                {history.map((h, idx) => {
                  const { title, subtitle } = parseHistoryMetadata(h);
                  return (
                    <li key={h.id || idx} className="mr-4 relative">
                      <span className="absolute -right-[21px] top-1.5 w-2 h-2 rounded-full bg-slate-400 ring-4 ring-bg-surface" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-slate-100">
                          {title}
                        </h4>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[11px] text-slate-300" dir="ltr">
                            {formatSmartDate(h.createdAt)}
                          </span>
                          {subtitle && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-400">{subtitle}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>

        {}
        <div className="space-y-5">
          {}
          <div className="bg-bg-surface border border-border-default rounded-xl p-4 space-y-3.5 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
              <Tag className="w-4 h-4 text-brand-primary shrink-0" />
              <h3 className="text-xs font-bold text-txt-primary">بيانات الطلب والعميل</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-txt-muted">نوع الطلب:</span>
                <span className="font-semibold text-txt-primary">
                  {ORDER_TYPE_LABELS[order?.type] || order?.type}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-txt-muted">المصدر:</span>
                <span className="font-semibold text-txt-primary">
                  {ORDER_SOURCE_LABELS[order?.source] || order?.source}
                </span>
              </div>
              {order?.table && (
                <div className="flex items-center justify-between">
                  <span className="text-txt-muted">الطاولة:</span>
                  <span className="font-bold text-brand-primary">
                    طاولة {order.table.label}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-border-subtle/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-txt-muted">الاسم:</span>
                  <span className="font-semibold text-txt-primary truncate max-w-[170px]">
                    {order?.customer?.name || (order?.customer?.phone ? 'عميل مسجل' : 'عميل مباشر')}
                  </span>
                </div>
                {order?.customer?.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-txt-muted">رقم الهاتف:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-medium text-txt-primary" dir="ltr">
                        {order.customer.phone}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyPhone(order.customer.phone)}
                        className="p-1 rounded text-txt-muted hover:text-txt-primary hover:bg-white/[0.05] transition-colors"
                        title="نسخ رقم الهاتف"
                      >
                        {isCopiedPhone ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                )}
                {customerAddress && (
                  <div className="flex items-start justify-between gap-2 pt-1 border-t border-border-subtle/50">
                    <span className="text-txt-muted shrink-0">العنوان:</span>
                    <span className="text-txt-primary text-right font-medium leading-relaxed">
                      {customerAddress}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-border-subtle/50">
                  <span className="text-txt-muted">وقت الإنشاء:</span>
                  <span className="text-txt-primary font-mono text-[11px]" dir="ltr">
                    {formatSmartDate(order?.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="bg-bg-surface border border-border-default rounded-xl p-4 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-brand-primary shrink-0" />
                <h3 className="text-xs font-bold text-txt-primary">حالة الدفع</h3>
              </div>
              <StatusPill status={paymentStatusPill(order?.paymentStatus || 'PENDING')}>
                {PAYMENT_STATUS_LABELS[order?.paymentStatus] || order?.paymentStatus || 'قيد الانتظار'}
              </StatusPill>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-txt-muted">المبلغ الإجمالي:</span>
              <span className="font-mono text-base font-bold text-brand-primary tabular-nums">
                {Number(order?.total || 0).toFixed(2)} EGP
              </span>
            </div>

            {order?.paymentStatus === 'PAID' && order?.paidAt && (
              <div className="bg-bg-base/60 border border-border-subtle rounded-lg p-2.5 text-[11px] text-txt-muted space-y-0.5">
                <div>تم الدفع بتاريخ: <span className="font-mono text-txt-primary">{new Date(order.paidAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span></div>
                {order.paymentMethod && <div>طريقة الدفع: <strong className="text-txt-primary">{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</strong></div>}
              </div>
            )}

            {order?.paymentStatus === 'REFUNDED' && order?.refundReason && (
              <div className="bg-status-danger-bg/40 border border-status-danger/20 rounded-lg p-2.5 text-[11px] text-status-danger">
                سبب الاسترداد: {order.refundReason}
              </div>
            )}

            <div className="pt-1">
              {order?.paymentStatus !== 'PAID' && order?.paymentStatus !== 'REFUNDED' && !isCancelled && (
                <PermissionGate permission="orders.payment">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Banknote}
                    onClick={() => setIsPaymentOpen(true)}
                    className="w-full text-xs font-medium justify-center border-white/10 hover:bg-white/[0.05] text-txt-primary"
                  >
                    تحصيل الدفع
                  </Button>
                </PermissionGate>
              )}
              {order?.paymentStatus === 'PAID' && (
                <PermissionGate permission="orders.refund">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Wallet}
                    onClick={() => setIsRefundOpen(true)}
                    className="w-full text-xs justify-center border-white/[0.08] hover:bg-white/[0.04]"
                  >
                    استرداد المبلغ
                  </Button>
                </PermissionGate>
              )}
            </div>
          </div>

          {}
          <div className="bg-bg-surface border border-border-default rounded-xl p-4 space-y-3.5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
              <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0" />
              <h3 className="text-xs font-bold text-txt-primary">التحكم في الحالة</h3>
            </div>

            {isTerminal ? (
              <div className="text-center py-2 space-y-1">
                <p className="text-xs font-bold text-txt-muted">
                  الطلب في حالة نهائية ({ORDER_STATUS_LABELS[order?.status] || order?.status})
                </p>
                <p className="text-[11px] text-txt-muted">لا يمكن تعديل حالة هذا الطلب.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {allowedNext.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {allowedNext.map((s) => (
                      <PermissionGate key={s} permission="orders.update">
                        <Button
                          variant="outline"
                          size="sm"
                          isLoading={updateStatusMutation.isPending}
                          onClick={() => handleAdvance(s)}
                          className="w-full text-xs font-medium justify-center border-white/[0.1] hover:bg-white/[0.05] text-txt-primary"
                        >
                          تغيير إلى: {ORDER_STATUS_LABELS[s] || s}
                        </Button>
                      </PermissionGate>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-txt-muted text-center py-1">لا توجد حالات تالية متاحة.</p>
                )}

                <PermissionGate permission="orders.cancel">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Ban}
                    onClick={() => setIsCancelOpen(true)}
                    className="w-full text-xs justify-center mt-2 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
                  >
                    إلغاء الطلب
                  </Button>
                </PermissionGate>
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      <Modal
        isOpen={isCancelOpen}
        onClose={() => {
          setIsCancelOpen(false);
          setCancelError(null);
        }}
        title="تأكيد إلغاء الطلب"
        size="sm"
      >
        <div className="space-y-4 text-right">
          <p className="text-xs text-txt-muted">
            سيتم إلغاء الطلب <span className="font-bold text-txt-primary font-mono">#{order?.orderNumber}</span>. هل أنت متأكد؟
          </p>
          <Input
            label="سبب الإلغاء"
            required
            error={cancelError}
            placeholder="مثال: رغبة العميل في إلغاء الطلب"
            value={cancelReason}
            onChange={(e) => {
              setCancelReason(e.target.value);
              if (cancelError) setCancelError(null);
            }}
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button
              variant="outline"
              size="sm"
              className="border border-white/10 text-slate-300 hover:bg-white/[0.04]"
              onClick={() => {
                setIsCancelOpen(false);
                setCancelError(null);
              }}
              disabled={cancelMutation.isPending}
            >
              تراجع
            </Button>
            <Button variant="danger" size="sm" isLoading={cancelMutation.isPending} onClick={handleCancel}>
              تأكيد الإلغاء
            </Button>
          </div>
        </div>
      </Modal>

      {}
      <Modal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title="تحصيل الدفع"
        size="sm"
      >
        <div className="space-y-4 text-right">
          <p className="text-xs text-txt-muted">
            استلام دفعة الطلب <span className="font-bold text-txt-primary font-mono">#{order?.orderNumber}</span> بمبلغ{' '}
            <span className="font-bold text-brand-primary font-mono">{Number(order?.total || 0).toFixed(2)} EGP</span>
          </p>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-txt-primary block">طريقة الدفع</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-bg-base/80 border border-border-default rounded-lg">
              {PAYMENT_METHOD_OPTIONS.map((opt) => {
                const isSelected = paymentMethod === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPaymentMethod(opt.value)}
                    className={`py-2 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-brand-primary text-slate-950 shadow-sm'
                        : 'text-txt-muted hover:text-txt-primary hover:bg-white/[0.04]'
                    }`}
                  >
                    {opt.value === 'CASH' && <Banknote className="w-3.5 h-3.5" />}
                    {opt.value === 'CARD' && <Wallet className="w-3.5 h-3.5" />}
                    {opt.value === 'ONLINE' && <Tag className="w-3.5 h-3.5" />}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <Input
            label="المبلغ المستلم"
            type="number"
            step="0.01"
            min="0"
            dir="ltr"
            placeholder={Number(order?.total || 0).toFixed(2)}
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button
              variant="outline"
              size="sm"
              className="border border-white/10 text-slate-300 hover:bg-white/[0.04]"
              onClick={() => setIsPaymentOpen(false)}
              disabled={paymentMutation.isPending}
            >
              تراجع
            </Button>
            <Button
              size="sm"
              className="bg-white text-slate-950 font-semibold hover:bg-slate-200 border-none px-4"
              isLoading={paymentMutation.isPending}
              onClick={handlePayment}
            >
              تأكيد الدفع
            </Button>
          </div>
        </div>
      </Modal>

      {}
      <Modal
        isOpen={isRefundOpen}
        onClose={() => {
          setIsRefundOpen(false);
          setRefundError(null);
        }}
        title="استرداد المبلغ"
        size="sm"
      >
        <div className="space-y-4 text-right">
          <p className="text-xs text-txt-muted">
            سيتم استرداد مبلغ الطلب <span className="font-bold text-txt-primary font-mono">#{order?.orderNumber}</span> بمبلغ{' '}
            <span className="font-bold text-brand-primary font-mono">{Number(order?.total || 0).toFixed(2)} EGP</span>.
          </p>
          <Input
            label="سبب الاسترداد"
            required
            error={refundError}
            placeholder="مثال: خطأ في الصنف أو رغبة العميل في الإلغاء"
            value={refundReason}
            onChange={(e) => {
              setRefundReason(e.target.value);
              if (refundError) setRefundError(null);
            }}
          />

          {order?.status !== 'CANCELLED' && order?.status !== 'DELIVERED' && (
            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-bg-base/60 border border-border-subtle cursor-pointer hover:border-white/10 transition-colors select-none">
              <input
                type="checkbox"
                checked={cancelAlso}
                onChange={(e) => setCancelAlso(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-border-default bg-bg-surface text-brand-primary focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-txt-primary">
                  إلغاء الطلب تلقائياً مع الاسترداد
                </span>
                <span className="text-[11px] text-txt-muted leading-relaxed">
                  تغيير حالة الطلب مباشرة إلى «ملغي» بعد تسجيل الاسترداد المالي
                </span>
              </div>
            </label>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button
              variant="outline"
              size="sm"
              className="border border-white/10 text-slate-300 hover:bg-white/[0.04]"
              onClick={() => {
                setIsRefundOpen(false);
                setRefundError(null);
              }}
              disabled={refundMutation.isPending || cancelMutation.isPending}
            >
              تراجع
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={refundMutation.isPending || cancelMutation.isPending}
              onClick={handleRefund}
            >
              {cancelAlso && order?.status !== 'CANCELLED' && order?.status !== 'DELIVERED'
                ? 'تأكيد الاسترداد والإلغاء'
                : 'تأكيد الاسترداد'}
            </Button>
          </div>
        </div>
      </Modal>

      {}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={`معاينة فاتورة الطلب #${order?.orderNumber}`}
        size="md"
      >
        <div className="space-y-4 text-center">
          <div className="bg-bg-base/80 p-4 rounded-xl border border-border-subtle overflow-y-auto max-h-[60vh] custom-scrollbar">
            <ReceiptPrintTemplate order={order} activeBranch={activeBranch} isPreview={true} />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button
              variant="outline"
              size="sm"
              className="border border-white/10 text-slate-300 hover:bg-white/[0.04]"
              onClick={() => setIsPrintModalOpen(false)}
            >
              إغلاق
            </Button>
            <Button
              size="sm"
              icon={Printer}
              className="bg-brand-primary text-slate-950 font-semibold hover:bg-sky-400 border-none px-4"
              onClick={() => {
                window.print();
              }}
            >
              طباعة الآن
            </Button>
          </div>
        </div>
      </Modal>
      </div>

      {}
      <ReceiptPrintTemplate order={order} activeBranch={activeBranch} />
    </>
  );
};
