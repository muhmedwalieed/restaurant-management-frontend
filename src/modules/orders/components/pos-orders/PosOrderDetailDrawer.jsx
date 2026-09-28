import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Banknote,
} from 'lucide-react';
import { ReceiptPrintTemplate } from '../ReceiptPrintTemplate.jsx';
import { PosOrderCustomerDetails } from './PosOrderCustomerDetails.jsx';
import { PosOrderCancelModal } from './PosOrderCancelModal.jsx';
import { PosOrderPaymentModal } from './PosOrderPaymentModal.jsx';

const NEXT_STATUS_TRANSITIONS = {
  PENDING: [{ id: 'CONFIRMED', label: 'تأكيد الطلب', color: 'var(--ac)' }],
  CONFIRMED: [{ id: 'PREPARING', label: 'بدء التجهيز في المطبخ', color: 'var(--ac)' }],
  PREPARING: [{ id: 'READY', label: 'جاهز للاستلام / التوصيل', color: 'var(--ok)' }],
  READY: [
    { id: 'OUT_FOR_DELIVERY', label: 'خروج مع الدليفري', color: 'var(--ac)' },
    { id: 'DELIVERED', label: 'تسليم للعميل', color: 'var(--ok)' },
  ],
  OUT_FOR_DELIVERY: [{ id: 'DELIVERED', label: 'تم التوصيل بنجاح', color: 'var(--ok)' }],
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
  const nextActions = NEXT_STATUS_TRANSITIONS[order.status] || [];

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

  return (
    <aside
      className="w-full sm:w-96 shrink-0 flex flex-col border-r overflow-hidden select-none h-full"
      style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--bd)' }}>
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--t1)' }}>
            طلب #{order.orderNumber || order.id?.slice(0, 6)}
          </h3>
          <span className="text-[11px]" style={{ color: 'var(--t3)' }}>
            {new Date(order.createdAt).toLocaleString('ar-EG')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ReceiptPrintTemplate order={order} />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Customer & Location */}
        <PosOrderCustomerDetails order={order} />

        {/* Status Actions */}
        {nextActions.length > 0 && order.status !== 'CANCELLED' && (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--t2)' }}>
              ترقية حالة الطلب:
            </span>
            <div className="space-y-1.5">
              {nextActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => onStatusChange(action.id)}
                  className="w-full py-2 px-3 rounded-xl font-bold text-xs text-white shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: action.color }}
                >
                  <CheckCircle2 size={14} />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-2">
          <span className="text-xs font-bold" style={{ color: 'var(--t2)' }}>الأصناف المطلوبة</span>
          <div className="space-y-1.5">
            {items.map((it, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border text-xs flex items-center justify-between"
                style={{ background: 'var(--s2)', borderColor: 'var(--bd)' }}
              >
                <div>
                  <span className="font-semibold" style={{ color: 'var(--t1)' }}>
                    {it.quantity}× {it.productName || it.name}
                  </span>
                  {it.modifiers && it.modifiers.length > 0 && (
                    <div className="text-[10px]" style={{ color: 'var(--t3)' }}>
                      {it.modifiers.map((m) => m.optionName || m.name).join('، ')}
                    </div>
                  )}
                </div>
                <span className="mono font-bold" style={{ color: 'var(--t1)' }}>
                  {(Number(it.unitPrice || it.price) * (it.quantity || 1)).toFixed(2)} ج
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-3 rounded-xl border space-y-2 text-xs" style={{ background: 'var(--s2)', borderColor: 'var(--bd)' }}>
          <div className="flex items-center justify-between" style={{ color: 'var(--t2)' }}>
            <span>الإجمالي الكلي:</span>
            <span className="mono font-bold" style={{ color: 'var(--t1)' }}>{total.toFixed(2)} ج</span>
          </div>
          <div className="flex items-center justify-between" style={{ color: 'var(--t2)' }}>
            <span>المبلغ المدفوع:</span>
            <span className="mono font-bold text-emerald-400">{paid.toFixed(2)} ج</span>
          </div>
          {remaining > 0 && (
            <div className="flex items-center justify-between font-bold text-red-400 pt-1 border-t border-white/5">
              <span>المتبقي للتحصيل:</span>
              <span className="mono">{remaining.toFixed(2)} ج</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Settle & Cancel */}
      <div className="p-4 border-t space-y-2 shrink-0" style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}>
        {remaining > 0 && order.status !== 'CANCELLED' && (
          <button
            type="button"
            onClick={() => {
              setPayAmount(String(remaining));
              setShowPaymentModal(true);
            }}
            className="w-full py-2 rounded-xl font-bold text-xs text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            style={{ background: 'var(--ok)' }}
          >
            <Banknote size={14} />
            <span>تسجيل دفعة ({remaining.toFixed(2)} ج)</span>
          </button>
        )}

        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="w-full py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <XCircle size={14} />
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
