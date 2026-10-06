import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  UtensilsCrossed,
  Clock,
  Printer,
  XCircle,
  CreditCard,
  Receipt,
  CheckCircle2,
  ShoppingBag,
  Bike,
  Sparkles,
  Hourglass,
  Truck,
} from 'lucide-react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { useAuth } from '../../../auth/context/AuthContext.jsx';
import { ORDER_STATUSES, ORDER_TYPES } from '../../constants.js';
import { PosOrderCancelModal } from './PosOrderCancelModal.jsx';
import { PosOrderPaymentModal } from './PosOrderPaymentModal.jsx';
import { PosOrderRefundModal } from './PosOrderRefundModal.jsx';
import { RotateCcw } from 'lucide-react';
import { formatTableLabel } from '../../../tables/utils/tableLabel.js';

const STATUS_CONFIG = {
  PENDING: { label: 'انتظار', colorClass: 'text-amber-600 dark:text-amber-400', Icon: Hourglass },
  CONFIRMED: { label: 'مؤكد', colorClass: 'text-blue-600 dark:text-blue-400', Icon: CheckCircle2 },
  PREPARING: { label: 'قيد التجهيز', colorClass: 'text-sky-600 dark:text-sky-400', Icon: Clock },
  READY: { label: 'جاهز للتسليم', colorClass: 'text-emerald-600 dark:text-emerald-400', Icon: Sparkles },
  OUT_FOR_DELIVERY: { label: 'مع الطيار', colorClass: 'text-indigo-600 dark:text-indigo-400', Icon: Truck },
  DELIVERED: { label: 'تم التسليم', colorClass: 'text-emerald-600 dark:text-emerald-400', Icon: CheckCircle2 },
  COMPLETED: { label: 'مكتمل', colorClass: 'text-emerald-600 dark:text-emerald-400', Icon: CheckCircle2 },
  CANCELLED: { label: 'ملغي', colorClass: 'text-red-600 dark:text-red-400', Icon: XCircle },
};

const getNextStatusAction = (status, orderType) => {
  if (status === 'PENDING') {
    return { next: 'CONFIRMED', label: 'تأكيد الطلب', color: 'bg-blue-600 hover:bg-blue-700 text-white' };
  }
  if (status === 'CONFIRMED') {
    return { next: 'PREPARING', label: 'إرسال للمطبخ (قيد التجهيز)', color: 'bg-sky-600 hover:bg-sky-700 text-white' };
  }
  if (status === 'PREPARING') {
    return { next: 'READY', label: 'جاهز للتسليم', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' };
  }
  if (status === 'READY') {
    if (orderType === 'DELIVERY') {
      return { next: 'OUT_FOR_DELIVERY', label: 'خروج للتوصيل (مع السائق)', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' };
    }
    return { next: 'DELIVERED', label: 'تسليم الطلب', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' };
  }
  if (status === 'OUT_FOR_DELIVERY') {
    return { next: 'DELIVERED', label: 'تأكيد تسليم الطلب للعميل', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' };
  }
  return null;
};

const getSourceLabel = (src) => {
  if (!src) return null;
  const s = String(src).toUpperCase();
  if (s === 'POS' || s === 'CASHIER') return 'كاشير';
  if (s === 'PHONE') return 'هاتف';
  if (s === 'WAITER') return 'ويتر';
  if (s === 'QR') return 'QR طاولة';
  if (s === 'ONLINE') return 'أونلاين';
  return src;
};

const getTypeConfig = (type) => {
  const t = String(type || '').toUpperCase();
  if (t === 'DELIVERY') {
    return {
      label: 'توصيل',
      Icon: Bike,
      badgeClass: 'text-sky-600 dark:text-sky-400',
    };
  }
  if (t === 'PICKUP' || t === 'TAKEAWAY') {
    return {
      label: 'استلام',
      Icon: ShoppingBag,
      badgeClass: 'text-amber-600 dark:text-amber-400',
    };
  }
  return {
    label: 'صالة',
    Icon: UtensilsCrossed,
    badgeClass: 'text-emerald-600 dark:text-emerald-400',
  };
};

export const PosOrderDetailDrawer = ({
  isOpen = true,
  onClose,
  order,
  onPrintInvoice,
  onCancelOrder,
  onRefundOrder,
  onSettlePayment,
  onAddPayment,
  onStatusChange,
  isUpdatingStatus = false,
  isCancelling = false,
  isRefunding = false,
  isSettlingPayment = false,
  allowStatusChange = true,
}) => {
  const { currency } = useCurrency();
  const { user, hasPermission } = useAuth();

  const isCallCenter =
    user?.role === 'call_center' ||
    user?.role === 'CALL_CENTER' ||
    user?.role === 'كول سنتر' ||
    user?.role?.name === 'call_center' ||
    user?.role?.name === 'CALL_CENTER' ||
    user?.role?.name === 'كول سنتر' ||
    String(user?.roleName || user?.role?.name || user?.role || '').toLowerCase().includes('call_center') ||
    String(user?.roleName || user?.role?.name || user?.role || '').toLowerCase().includes('callcenter') ||
    String(user?.roleName || user?.role?.name || user?.role || '').includes('سنتر') ||
    String(user?.email || '').toLowerCase().includes('callcenter');

  const canUpdateStatus = Boolean(allowStatusChange && onStatusChange && hasPermission('orders.update') && !isCallCenter);
  const canCancelOrder = hasPermission(['orders.cancel', 'orders.manage']) || !user?.role;
  const canProcessPayment = hasPermission(['orders.payment', 'orders.manage']) || !user?.role;

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [isAutoDeliverPayment, setIsAutoDeliverPayment] = useState(false);

  // ── Resizable Width State (saved to localStorage) ──
  const [drawerWidth, setDrawerWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_order_drawer_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 320 && parsed <= 800) {
          return parsed;
        }
      }
    } catch {}
    return 460;
  });

  const containerRef = useRef(null);
  const isResizing = useRef(false);

  const startResizing = useCallback((e) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent) => {
      if (!isResizing.current) return;
      const leftEdge = containerRef.current ? containerRef.current.getBoundingClientRect().left : 0;
      const newWidth = moveEvent.clientX - leftEdge;
      const maxAllowed = typeof window !== 'undefined' ? Math.min(850, window.innerWidth - 300) : 750;
      const clamped = Math.max(340, Math.min(maxAllowed, Math.round(newWidth)));
      setDrawerWidth(clamped);
      try {
        localStorage.setItem('pos_order_drawer_width', String(clamped));
      } catch {}
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showPaymentModal) setShowPaymentModal(false);
        else if (showCancelModal) setShowCancelModal(false);
        else if (onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPaymentModal, showCancelModal, onClose]);

  if (!isOpen || !order) return null;

  const orderTypeVal = order.type || order.orderType || 'DINE_IN';
  const typeConfig = getTypeConfig(orderTypeVal);
  const TypeIcon = typeConfig.Icon;

  const statusInfo = STATUS_CONFIG[order.status] || {
    label: order.status || 'معلق',
    colorClass: 'text-zinc-600 dark:text-zinc-400',
    Icon: Clock,
  };
  const StatusIcon = statusInfo.Icon;

  const total = Number(order.totalAmount ?? order.total ?? 0);
  const paid = Number(order.amountPaid ?? order.paidAmount ?? 0);
  const remaining = Math.max(0, total - paid);
  const isPaid = order.paymentStatus === 'PAID' || remaining <= 0;

  const rawTable = order.table;
  const rawTableVal = rawTable
    ? typeof rawTable === 'string'
      ? rawTable
      : rawTable.label || rawTable.number || rawTable.name || ''
    : order.tableName || order.tableNumber || '';
  const tableLabel = rawTableVal ? formatTableLabel(rawTableVal) : '';

  const customerName = order.customer?.name || order.customerName || '';
  const customerPhone = order.customer?.phone || order.customerPhone || '';
  const customerAddress = order.customer?.address || order.customerAddress || order.address || order.deliveryAddress || '';

  const nextAction = getNextStatusAction(order.status, orderTypeVal);

  const handleNextStatusClick = () => {
    if (!nextAction || !onStatusChange) return;

    // Guard: Delivery/Completion requires remaining amount to be fully paid
    if (nextAction.next === 'DELIVERED' && remaining > 0) {
      setIsAutoDeliverPayment(true);
      setPayAmount(String(remaining));
      setPayMethod('CASH');
      setShowPaymentModal(true);
      return;
    }

    onStatusChange(nextAction.next);
  };

  const handleOpenPayment = () => {
    setIsAutoDeliverPayment(false);
    setPayAmount(remaining > 0 ? String(remaining) : '');
    setPayMethod('CASH');
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = (method, amount) => {
    if (onSettlePayment) {
      const numAmt = Number(amount) || remaining;
      onSettlePayment(order.id, numAmt, method, isAutoDeliverPayment);
    }
    setShowPaymentModal(false);
  };

  const handleConfirmCancel = (cancelData) => {
    if (onCancelOrder) {
      onCancelOrder(order.id, cancelData);
    }
    setShowCancelModal(false);
    setCancelReason('');
  };

  const handleConfirmRefund = (refundData) => {
    if (onRefundOrder) {
      onRefundOrder(order.id, refundData);
    }
    setShowRefundModal(false);
  };

  const items = order.items || [];
  const totalItemCount = items.reduce((s, it) => s + Number(it.quantity || it.qty || 1), 0);
  const sourceLabel = getSourceLabel(order.source);

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 sm:hidden backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <aside
        ref={containerRef}
        style={{ width: `${drawerWidth}px` }}
        className="fixed sm:relative inset-y-0 left-0 z-40 sm:z-10 max-sm:!w-full h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl sm:shadow-none flex flex-col shrink-0 overflow-hidden relative"
        dir="rtl"
      >
        {/* Desktop Draggable Resize Handle on right edge of drawer (between table and drawer in RTL) */}
        <div
          onMouseDown={startResizing}
          className="hidden sm:flex absolute right-0 top-0 bottom-0 w-2.5 -mr-1.5 cursor-col-resize z-50 group items-center justify-center select-none hover:bg-zinc-500/10 active:bg-zinc-500/20 transition-colors"
          title="اسحب لتعديل عرض تفاصيل الطلب"
        >
          <div className="w-1 h-8 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 transition-colors" />
        </div>
        {/* Header (Matching Table Header Height & Style 100%) */}
        <div className="h-10 px-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-100/95 dark:bg-zinc-900/95 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-sm font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">
              #{order.orderNumber || order.id?.slice(0, 6)}
            </span>
            <span className={`text-xs font-bold inline-flex items-center gap-1 ${typeConfig.badgeClass}`}>
              <TypeIcon size={12} />
              <span>{typeConfig.label}</span>
            </span>
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono mr-1">
              <span className="inline-flex items-center gap-1">
                <Clock size={11} className="text-zinc-400 shrink-0" />
                <span>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
                    : 'الآن'}
                </span>
              </span>
              {sourceLabel && (
                <span className="text-[11px] font-sans text-zinc-500 dark:text-zinc-400">
                  • {sourceLabel}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onPrintInvoice && (
              <button
                type="button"
                onClick={() => onPrintInvoice(order)}
                className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="طباعة الفاتورة"
              >
                <Printer size={13} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="إغلاق (Esc)"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Top Info (Fixed) */}
        <div className="shrink-0 bg-white dark:bg-zinc-950">
          {/* Customer & Location Section */}
          {(customerName || customerPhone || tableLabel || customerAddress) && (
            <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
              {/* Customer Profile Row: Name on Right, Table & Phone on Left */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0 shadow-2xs">
                    <User size={14} />
                  </div>
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {customerName || 'عميل مباشر'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {tableLabel && (
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                      <UtensilsCrossed size={12} />
                      <span>{tableLabel}</span>
                    </span>
                  )}
                  {customerPhone && (
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-mono text-xs bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700/80 shrink-0" dir="ltr">
                      <Phone size={12} className="text-zinc-400 shrink-0" />
                      <span>{customerPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              {customerAddress && (
                <div className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400 pt-1.5 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  <MapPin size={13} className="text-zinc-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed text-xs">{customerAddress}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Middle: Order Items Table (Scrollable on its own) */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar text-zinc-900 dark:text-zinc-100 flex flex-col">
          {/* Section Header */}
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400 px-4 py-2.5 bg-zinc-50/70 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
            <span className="flex items-center gap-1.5">
              <ShoppingBag size={14} className="text-zinc-400" />
              <span>الأصناف المطلوبة</span>
            </span>
            <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 font-bold">
              {totalItemCount} {totalItemCount === 1 ? 'صنف' : 'أصناف'}
            </span>
          </div>

          {/* Items Table */}
          <div className="flex-1">
            <table className="w-full text-right text-xs border-collapse">
              <thead className="sticky top-0 z-10 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xs">
                <tr>
                  <th className="py-2.5 px-4 font-bold">الصنف</th>
                  <th className="py-2.5 px-2 text-center font-bold w-12">الكمية</th>
                  <th className="py-2.5 px-2 text-center font-bold w-20">السعر</th>
                  <th className="py-2.5 px-4 text-left font-bold w-24">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                {items.map((it, idx) => {
                  const pName = it.productName || it.product?.name || it.name || 'صنف';
                  const qty = Number(it.quantity ?? it.qty ?? 1);
                  const unitPrice = Number(it.unitPrice ?? it.price ?? 0);
                  const itemTotal = Number(it.totalPrice ?? (unitPrice * qty));
                  const modifiers = it.modifiers || [];

                  return (
                    <tr key={it.id || idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                      {/* Product Name & Modifiers & Notes */}
                      <td className="py-2.5 px-4 align-top">
                        <div className="space-y-0.5">
                          <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 leading-snug">
                            {pName}
                          </p>
                          {it.notes && (
                            <p className="text-[11px] text-zinc-400 italic">
                              {it.notes}
                            </p>
                          )}
                          {modifiers.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {modifiers.map((m, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400"
                                >
                                  + {m.name || m.optionName || m.modifierOptionName || m}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Quantity (Clean number without ×) */}
                      <td className="py-2.5 px-2 text-center align-top whitespace-nowrap">
                        <span className="font-mono font-bold text-xs text-zinc-800 dark:text-zinc-200">
                          {qty}
                        </span>
                      </td>

                      {/* Unit Price */}
                      <td className="py-2.5 px-2 text-center align-top whitespace-nowrap">
                        <div className="flex items-baseline justify-center gap-0.5" dir="rtl">
                          <span className="text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-300">
                            {unitPrice.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-sans text-zinc-400">
                            {currency}
                          </span>
                        </div>
                      </td>

                      {/* Line Total */}
                      <td className="py-2.5 px-4 text-left align-top whitespace-nowrap">
                        <div className="flex items-baseline justify-end gap-0.5" dir="rtl">
                          <span className="text-xs font-mono font-black text-zinc-900 dark:text-zinc-100">
                            {itemTotal.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-400 font-sans">
                            {currency}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section (Fixed / Pinned Totals & Actions) */}
        <div className="shrink-0 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/80 backdrop-blur-xs flex flex-col">
          {/* Financial Breakdown Section (Pinned directly above buttons) */}
          <div className="p-3.5 space-y-1.5 text-xs border-b border-zinc-200/70 dark:border-zinc-800/70">
            {/* Total */}
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 font-medium">
              <span>إجمالي الطلب:</span>
              <div className="flex items-baseline gap-1 font-mono font-black text-zinc-900 dark:text-zinc-100 text-sm" dir="rtl">
                <span>{total.toFixed(2)}</span>
                <span className="text-[10px] font-bold text-zinc-400 font-sans">{currency}</span>
              </div>
            </div>

            {/* Discount if present */}
            {Number(order.discountAmount || 0) > 0 && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>خصم (كوبون/عرض):</span>
                <div className="flex items-baseline gap-1 font-mono font-bold" dir="rtl">
                  <span>-{Number(order.discountAmount).toFixed(2)}</span>
                  <span className="text-[10px] font-sans">{currency}</span>
                </div>
              </div>
            )}

            {/* Paid Amount */}
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 font-medium">
              <span>المبلغ المدفوع:</span>
              <div className="flex items-baseline gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400" dir="rtl">
                <span>{paid.toFixed(2)}</span>
                <span className="text-[10px] font-sans">{currency}</span>
              </div>
            </div>

            {/* Remaining or Fully Paid Status with Compact Pay Button */}
            {remaining > 0 ? (
              <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600 dark:text-zinc-400 font-bold">المتبقي:</span>
                  <div className="flex items-baseline gap-1 font-mono font-black text-amber-600 dark:text-amber-400 text-sm" dir="rtl">
                    <span>{remaining.toFixed(2)}</span>
                    <span className="text-[10px] font-sans">{currency}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenPayment}
                  className="h-7 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CreditCard size={13} />
                  <span>تسجيل دفعة</span>
                </button>
              </div>
            ) : (
              <div className="pt-1.5 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>حالة السداد:</span>
                <span className="inline-flex items-center gap-1 text-xs">
                  <CheckCircle2 size={13} />
                  <span>مدفوع بالكامل</span>
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons Row / Completion Status */}
          <div className="p-3">
            {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && order.status !== 'DELIVERED' ? (
              <div className="flex items-center gap-2">
                {/* 1. If remaining balance exists, primary action is to record payment */}
                {remaining > 0 ? (
                  <button
                    type="button"
                    onClick={handleOpenPayment}
                    className="flex-1 h-9 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CreditCard size={14} />
                    <span>تسجيل دفعة ({remaining.toFixed(0)} {currency})</span>
                  </button>
                ) : nextAction && onStatusChange && canUpdateStatus ? (
                  /* 2. If fully paid and user is Cashier/KDS with update rights, show next status transition */
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={handleNextStatusClick}
                    className={`flex-1 h-9 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] disabled:opacity-50 ${nextAction.color}`}
                  >
                    {isUpdatingStatus ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>جاري التحديث...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} />
                        <span className="truncate">{nextAction.label}</span>
                      </>
                    )}
                  </button>
                ) : (
                  /* 3. If fully paid and Call Center, show Paid badge */
                  <div className="flex-1 h-9 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>الطلب مدفوع بالكامل</span>
                  </div>
                )}

                {/* Cancel Button (Always available for Call Center & Staff) */}
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="h-9 px-3.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  title="إلغاء الطلب"
                >
                  <XCircle size={14} />
                  <span>إلغاء الطلب</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {onPrintInvoice && (
                  <button
                    type="button"
                    onClick={() => onPrintInvoice(order)}
                    className="flex-1 h-9 px-3 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Printer size={14} />
                    <span>طباعة الفاتورة</span>
                  </button>
                )}

                {order.status === 'CANCELLED' ? (
                  order.paymentStatus === 'REFUNDED' ? (
                    <div className="flex-1 h-9 px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center gap-1.5">
                      <XCircle size={14} />
                      <span>تم إلغاء الطلب (مسترجع)</span>
                    </div>
                  ) : paid > 0 ? (
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1 h-9 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 truncate">
                        <AlertTriangle size={14} className="shrink-0" />
                        <span className="truncate">ملغي (مدفوع: {paid.toFixed(0)} {currency})</span>
                      </div>
                      {onRefundOrder && (
                        <button
                          type="button"
                          onClick={() => setShowRefundModal(true)}
                          className="h-9 px-3 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
                          title="استرجاع المبلغ للعميل"
                        >
                          <RotateCcw size={14} />
                          <span>استرجاع</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 h-9 px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center gap-1.5">
                      <XCircle size={14} />
                      <span>تم إلغاء الطلب</span>
                    </div>
                  )
                ) : (
                  <div className="flex-1 h-9 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>تم تسليم الطلب</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cancel Prompt Modal */}
        <PosOrderCancelModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          order={order}
          cancelReason={cancelReason}
          onChangeCancelReason={setCancelReason}
          onConfirmCancel={handleConfirmCancel}
          isCancelling={isCancelling}
          currency={currency}
        />

        {/* Refund Prompt Modal */}
        <PosOrderRefundModal
          isOpen={showRefundModal}
          onClose={() => setShowRefundModal(false)}
          order={order}
          onConfirmRefund={handleConfirmRefund}
          isRefunding={isRefunding}
          currency={currency}
        />

        {/* Payment Settlement Modal */}
        <PosOrderPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          order={order}
          totalAmount={total}
          remainingAmount={remaining}
          currency={currency}
          payAmount={payAmount}
          onChangePayAmount={setPayAmount}
          payMethod={payMethod}
          onChangePayMethod={setPayMethod}
          onConfirmPayment={handleConfirmPayment}
          isSettlingPayment={isSettlingPayment}
          autoDeliver={isAutoDeliverPayment}
        />
      </aside>
    </>
  );
};

export default PosOrderDetailDrawer;
