import React, { useState, useEffect } from 'react';
import { AlertTriangle, RotateCcw, DollarSign, Wallet, CreditCard, Banknote, HelpCircle } from 'lucide-react';

export const PosOrderCancelModal = ({
  isOpen,
  onClose,
  order,
  cancelReason,
  onChangeCancelReason,
  onConfirmCancel,
  isCancelling = false,
  currency = 'ج.م',
}) => {
  const paidAmount = Number(order?.amountPaid || (order?.paymentStatus === 'PAID' ? order?.total : 0)) || 0;
  const hasPaid = paidAmount > 0 && order?.paymentStatus !== 'REFUNDED';

  const [shouldRefund, setShouldRefund] = useState(true);
  const [refundMethod, setRefundMethod] = useState('CASH');

  useEffect(() => {
    if (isOpen) {
      setShouldRefund(hasPaid);
      setRefundMethod(order?.paymentMethod || 'CASH');
    }
  }, [isOpen, hasPaid, order?.paymentMethod]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirmCancel) {
      onConfirmCancel({
        reason: cancelReason,
        refund: hasPaid ? shouldRefund : false,
        refundMethod: hasPaid && shouldRefund ? refundMethod : undefined,
        refundAmount: hasPaid && shouldRefund ? paidAmount : undefined,
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
          <h4 className="text-sm font-black text-red-500 flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0 animate-bounce" />
            <span>تأكيد إلغاء الطلب #{order?.orderNumber || ''}</span>
          </h4>
          <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-zinc-800 text-zinc-300">
            {order?.type === 'DELIVERY' ? 'دليفري' : order?.type === 'PICKUP' ? 'استلام' : 'صالة'}
          </span>
        </div>

        {/* Cancellation Reason */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold block" style={{ color: 'var(--t1, #f4f4f5)' }}>
            سبب الإلغاء <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={cancelReason}
            onChange={(e) => onChangeCancelReason(e.target.value)}
            placeholder="اكتب سبب إلغاء الطلب (مطلوب)..."
            className="w-full p-2.5 text-xs font-medium rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-500 transition-all resize-none"
            style={{ background: 'var(--s2, #09090b)', borderColor: 'var(--bd, #27272a)', color: 'var(--t1, #f4f4f5)' }}
          />
        </div>

        {/* Paid Order Handling (If order has money paid) */}
        {hasPaid ? (
          <div className="p-3.5 rounded-xl border space-y-3 bg-amber-500/5 border-amber-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-amber-500" />
                <span className="text-xs font-black text-amber-500">
                  الطلب مدفوع: {paidAmount.toFixed(2)} {currency}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                {order?.paymentMethod || 'CASH'}
              </span>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shouldRefund}
                onChange={(e) => setShouldRefund(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-zinc-700 bg-zinc-900 cursor-pointer accent-red-600"
              />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-zinc-200 block">
                  استرجاع المبلغ للعميل فوراً ({paidAmount.toFixed(2)} {currency})
                </span>
                <span className="text-[11px] text-zinc-400 block">
                  سيتم تسجيل عملية الاسترجاع وتعديل حسابات الوردية والدرج تلقائياً.
                </span>
              </div>
            </label>

            {shouldRefund ? (
              <div className="pt-2 border-t border-amber-500/20 space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 block">
                  طريقة إرجاع المبلغ:
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
            ) : (
              <div className="flex items-start gap-1.5 text-[11px] text-zinc-400 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                <HelpCircle size={14} className="shrink-0 text-zinc-400 mt-0.5" />
                <span>
                  لم يتم اختيار الاسترجاع الفوري. سيبقى الطلب كـ "ملغي معلق الاسترجاع"، ويمكنك استرداد المبلغ لاحقاً من شاشة تفاصيل الطلب.
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-400 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
            <span>هذا الطلب غير مدفوع (لا توجد مبالغ مالية بحاجة للاسترداد).</span>
          </div>
        )}

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
            disabled={isCancelling || !cancelReason.trim()}
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            {isCancelling ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري الإلغاء...</span>
              </>
            ) : (
              <>
                <AlertTriangle size={14} />
                <span>{hasPaid && shouldRefund ? 'تأكيد الإلغاء والاسترجاع' : 'تأكيد الإلغاء'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PosOrderCancelModal;
