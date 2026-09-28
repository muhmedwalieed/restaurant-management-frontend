import React from 'react';

export const PosOrderPaymentModal = ({
  isOpen,
  onClose,
  payAmount,
  onChangePayAmount,
  payMethod,
  onChangePayMethod,
  onConfirmPayment,
  isSettlingPayment = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="p-4 rounded-xl border space-y-3 w-full max-w-sm" style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}>
        <h4 className="text-sm font-bold" style={{ color: 'var(--t1)' }}>
          تحصيل دفعة مالية
        </h4>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: 'var(--t2)' }}>المبلغ المدفوع:</label>
          <input
            type="number"
            value={payAmount}
            onChange={(e) => onChangePayAmount(e.target.value)}
            className="w-full p-2 text-sm mono font-bold rounded-lg bg-bg-surface border border-border-default text-txt-primary"
          />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: 'var(--t2)' }}>طريقة الدفع:</label>
          <div className="grid grid-cols-2 gap-2">
            {['CASH', 'CARD'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChangePayMethod(m)}
                className={`py-1.5 text-xs font-semibold rounded-lg border ${
                  payMethod === m ? 'border-brand-primary bg-brand-primary text-white' : 'border-border-default text-txt-muted'
                }`}
              >
                {m === 'CASH' ? 'كاش' : 'فيزا'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border text-xs font-medium text-slate-300"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={isSettlingPayment}
            onClick={onConfirmPayment}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white"
            style={{ background: 'var(--ok)' }}
          >
            {isSettlingPayment ? 'جاري الحفظ...' : 'تأكيد السداد'}
          </button>
        </div>
      </div>
    </div>
  );
};
