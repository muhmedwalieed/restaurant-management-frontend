import React, { useState } from 'react';
import { useAuth } from '../../../auth/context/AuthContext.jsx';
import {
  X,
  CheckCircle2,
  XCircle,
  Banknote,
  Printer,
  Clock,
} from 'lucide-react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { ReceiptPrintTemplate } from '../ReceiptPrintTemplate.jsx';
import { PosOrderCustomerDetails } from './PosOrderCustomerDetails.jsx';
import { PosOrderCancelModal } from './PosOrderCancelModal.jsx';
import { PosOrderPaymentModal } from './PosOrderPaymentModal.jsx';

const NEXT_STATUS_TRANSITIONS = {
  PENDING: [{ id: 'CONFIRMED', label: 'تأكيد الطلب' }],
  CONFIRMED: [{ id: 'PREPARING', label: 'بدء التجهيز في المطبخ' }],
  PREPARING: [{ id: 'READY', label: 'جاهز للاستلام / التوصيل' }],
  OUT_FOR_DELIVERY: [{ id: 'DELIVERED', label: 'تم التوصيل بنجاح' }],
};

export const PosOrderDetailDrawer = ({
  order,
  onClose,
  onStatusChange,
  onCancelOrder,
  onAddPayment,
  isUpdatingStatus,
  isCancelling,
  isSettlingPayment,
}) => {
  const { currency } = useCurrency();
  const { hasPermission } = useAuth();
  const canUpdateStatus = hasPermission('orders.update');
  const canPay = hasPermission('orders.payment');
  const canCancel = hasPermission('orders.cancel');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('إلغاء بناءً على طلب الكاشير');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');

  if (!order) return null;

  const total = Number(order.total || order.totalAmount || 0);
  const paid = order.paymentStatus === 'PAID' ? total : Number(order.amountPaid || 0);
  const remaining = Math.max(0, total - paid);
  const items = order.items || [];

  const nextActions = React.useMemo(() => {
    if (!order?.status) return [];
    if (order.status === 'READY') {
      if (order.type === 'DELIVERY') {
        return [{ id: 'OUT_FOR_DELIVERY', label: 'خروج مع الدليفري', perm: 'orders.update' }];
      }
      return [{ id: 'DELIVERED', label: 'تسليم للعميل', perm: 'orders.update' }];
    }
    return (NEXT_STATUS_TRANSITIONS[order.status] || []).map((a) => ({ ...a, perm: 'orders.update' }));
  }, [order?.status, order?.type]);

  const handleActionClick = (actionId) => {
    onStatusChange(actionId);
  };

  const handleConfirmCancel = () => {
    onCancelOrder(order.id, cancelReason);
    setShowCancelModal(false);
  };

  const handleConfirmPayment = () => {
    const amt = parseFloat(payAmount) || remaining;
    if (amt <= 0) return;
    onAddPayment(order.id, amt, payMethod);
    setShowPaymentModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <aside
      className="w-full sm:w-96 shrink-0 flex flex-col border-r overflow-hidden h-full shadow-lg"
      style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--bd)' }}>
        <div>
          <h3 className="text-sm font-black" style={{ color: 'var(--t1)' }}>
            طلب #{order.orderNumber || order.id?.slice(0, 6)}
          </h3>
          <span className="text-xs text-zinc-400 font-normal mt-1 flex items-center gap-1">
            <Clock size={12} />
            {new Date(order.createdAt).toLocaleString('ar-EG')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            title="طباعة الإيصال"
            className="w-9 h-9 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Printer size={15} />
          </button>
          <ReceiptPrintTemplate order={order} />
          <button
            type="button"
            onClick={onClose}
            title="إغلاق"
            className="w-9 h-9 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Customer & Location */}
        <PosOrderCustomerDetails order={order} />

        {/* Items List */}
        <div className="space-y-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--t2)' }}>الأصناف المطلوبة</span>
          <div className="space-y-1.5">
            {items.map((it, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border text-xs flex items-center justify-between gap-3"
                style={{ background: 'var(--s2)', borderColor: 'var(--bd)' }}
              >
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {it.quantity}× {it.productName || it.name}
                  </span>
                  {(() => { const mods = it.selectedModifiers || it.modifiers || []; return mods.length > 0 ? (
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>
                      {mods.map((m) => `${m.name}${m.quantity > 1 ? ` ×${m.quantity}` : ''}${m.priceDelta ? ` (+${Number(m.priceDelta).toFixed(0)})` : ''}`).join('، ')}
                    </div>
                  ) : null; })()}
                </div>
                <span className="inline-flex items-baseline gap-1 shrink-0" dir="ltr">
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                    {(() => {
                      const p = Number(it.unitPrice || it.price) * (it.quantity || 1);
                      return p % 1 === 0 ? p.toFixed(0) : p.toFixed(2);
                    })()}
                  </span>
                  <span className="text-xs text-zinc-400">{currency || 'ج.م'}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-3.5 rounded-2xl border space-y-3 text-xs" style={{ background: 'var(--s2)', borderColor: 'var(--bd)' }}>
          <div className="flex items-center justify-between" style={{ color: 'var(--t2)' }}>
            <span className="font-medium">الإجمالي الكلي:</span>
            <span className="whitespace-nowrap font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1 shrink-0">
              <span className="font-mono">
                {total % 1 === 0 ? total.toFixed(0) : total.toFixed(2)}
              </span>
              <span className="text-xs font-normal text-zinc-400">{currency || 'ج.م'}</span>
            </span>
          </div>
          <div className="flex items-center justify-between" style={{ color: 'var(--t2)' }}>
            <span className="font-medium">المبلغ المدفوع:</span>
            <span className="whitespace-nowrap font-bold text-emerald-400 flex items-center gap-1 shrink-0">
              <span className="font-mono">
                {paid % 1 === 0 ? paid.toFixed(0) : paid.toFixed(2)}
              </span>
              <span className="text-xs font-normal text-emerald-400/80">{currency || 'ج.م'}</span>
            </span>
          </div>
          {remaining > 0 && (
            <div className="flex items-center justify-between font-bold text-red-500 pt-2 border-t" style={{ borderColor: 'var(--bd)' }}>
              <span>المتبقي للتحصيل:</span>
              <span className="whitespace-nowrap font-bold flex items-center gap-1 shrink-0">
                <span className="font-mono">
                  {remaining % 1 === 0 ? remaining.toFixed(0) : remaining.toFixed(2)}
                </span>
                <span className="text-xs font-normal text-red-500/80">{currency || 'ج.م'}</span>
              </span>
            </div>
          )}

          {/* Settle Payment Action */}
          {canPay && remaining > 0 && order.status !== 'CANCELLED' && (
            <button
              type="button"
              onClick={() => {
                setPayAmount(remaining % 1 === 0 ? remaining.toFixed(0) : remaining.toFixed(2));
                setShowPaymentModal(true);
              }}
              className="w-full h-11 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-zinc-100 font-semibold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Banknote size={15} />
              <span>تسجيل دفعة ({remaining % 1 === 0 ? remaining.toFixed(0) : remaining.toFixed(2)} {currency || 'ج.م'})</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer: Order Status Advancement & Cancel */}
      <div className="p-4 border-t space-y-2 shrink-0" style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}>
        {canUpdateStatus && nextActions.length > 0 && order.status !== 'CANCELLED' ? (
          <div className="space-y-1.5">
            {nextActions.map((action) => (
              <button
                key={action.id}
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleActionClick(action.id)}
                className="w-full h-11 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-750 text-zinc-100 border border-zinc-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        ) : (order.status === 'DELIVERED' || order.status === 'COMPLETED') ? (
          <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center justify-center gap-2 text-xs font-bold">
            <CheckCircle2 size={16} />
            <span>الطلب مكتمل وتم التسليم</span>
          </div>
        ) : null}

        {canCancel && order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && order.status !== 'COMPLETED' && (
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="w-full py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 border border-red-500/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <XCircle size={15} />
            <span>إلغاء الطلب</span>
          </button>
        )}
      </div>

      {/* Cancel Prompt Modal */}
      <PosOrderCancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        cancelReason={cancelReason}
        onChangeCancelReason={setCancelReason}
        onConfirmCancel={handleConfirmCancel}
        isCancelling={isCancelling}
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
      />
    </aside>
  );
};

export default PosOrderDetailDrawer;
