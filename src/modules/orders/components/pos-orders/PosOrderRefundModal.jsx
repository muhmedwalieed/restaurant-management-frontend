import React, { useState, useEffect } from 'react';
import { RotateCcw, DollarSign, Wallet, CreditCard, Banknote, HelpCircle } from 'lucide-react';

export const PosOrderRefundModal = ({
  isOpen,
  onClose,
  order,
  onConfirmRefund,
  isRefunding = false,
  currency = 'ج.م',
}) => {
  const paidAmount = Number(order?.amountPaid || (order?.paymentStatus === 'PAID' ? order?.total : 0)) || 0;

  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundMethod, setRefundMethod] = useState('CASH');

  useEffect(() => {
    if (isOpen && order) {
      setRefundReason(order.status === 'CANCELLED' ? `استرجاع للطلب الملغي #${order.orderNumber}` : '');
      setRefundAmount(String(paidAmount > 0 ? paidAmount : ''));
      setRefundMethod(order.paymentMethod || 'CASH');
    }
  }, [isOpen, order, paidAmount]);

  if (!isOpen || !order) return null;

  const handleConfirm = () => {
    if (!refundReason.trim()) return;
    const numAmt = Number(refundAmount) || paidAmount;
    if (numAmt <= 0) return;

    if (onConfirmRefund) {
      onConfirmRefund({
        orderId: order.id,
        reason: refundReason.trim(),
        amount: numAmt,
        paymentMethod: refundMethod,
        expectedVersion: Number(order.version || 1),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div
        className="p-5 rounded-2xl border space-y-4 w-full max-w-md shadow-2xl transition-all"
        style={{ background: 'var(--s1, #18181b)', borderColor: 'var(--bd, #27272a)' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--bd, #27272a)' }}>
          <h4 className="text-sm font-black text-amber-500 flex items-center gap-2">
            <RotateCcw size={18} className="shrink-0" />
            <span>استرجاع مبلغ الطلب #{order.orderNumber}</span>
          </h4>
          <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            مدفوع: {paidAmount.toFixed(2)} {currency}
          </span>
        </div>

        {/* Refund Amount */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold block" style={{ color: 'var(--t1, #f4f4f5)' }}>
            المبلغ المراد استرجاعه ({currency}) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.5"
              min="0.01"
              max={paidAmount || 100000}
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-2.5 text-xs font-bold rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all text-left"
              style={{ background: 'var(--s2, #09090b)', borderColor: 'var(--bd, #27272a)', color: 'var(--t1, #f4f4f5)' }}
            />
            <span className="absolute left-3 top-2.5 text-xs font-bold text-zinc-500">{currency}</span>
          </div>
        </div>

        {/* Refund Method Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold block" style={{ color: 'var(--t1, #f4f4f5)' }}>
            طريقة إرجاع المبلغ للعميل:
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'CASH', label: 'كاش', icon: Banknote },
              { id: 'CARD', label: 'بطاقة', icon: CreditCard },
              { id: 'INSTAPAY', label: 'انستاباي', icon: RotateCcw },
              { id: 'WALLET', label: 'محفظة', icon: Wallet },
            ].map((m) => {
              const Icon = m.icon;
              const isSel = refundMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setRefundMethod(m.id)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                    isSel
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-xs'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon size={14} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reason for Refund */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold block" style={{ color: 'var(--t1, #f4f4f5)' }}>
            سبب الاسترجاع <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="اكتب سبب استرجاع المبلغ..."
            className="w-full p-2.5 text-xs font-medium rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all resize-none"
            style={{ background: 'var(--s2, #09090b)', borderColor: 'var(--bd, #27272a)', color: 'var(--t1, #f4f4f5)' }}
          />
        </div>

        <div className="flex items-start gap-1.5 text-[11px] text-zinc-400 bg-amber-500/5 p-2 rounded-lg border border-amber-500/20">
          <HelpCircle size={14} className="shrink-0 text-amber-400 mt-0.5" />
          <span>
            سيتم قيد المبلغ كمسترجع وتعديل صافي مبيعات وخزينة وردية الكاشير الحالية بدقة.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--bd, #27272a)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border text-xs font-bold transition-opacity hover:opacity-80 cursor-pointer"
            style={{ background: 'var(--s2, #09090b)', borderColor: 'var(--bd, #27272a)', color: 'var(--t2, #a1a1aa)' }}
          >
            تراجع
          </button>
          <button
            type="button"
            disabled={isRefunding || !refundReason.trim() || Number(refundAmount) <= 0}
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            {isRefunding ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري الاسترجاع...</span>
              </>
            ) : (
              <>
                <RotateCcw size={14} />
                <span>تأكيد الاسترجاع</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PosOrderRefundModal;
