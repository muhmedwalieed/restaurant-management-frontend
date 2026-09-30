import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const PosOrderCancelModal = ({
  isOpen,
  onClose,
  cancelReason,
  onChangeCancelReason,
  onConfirmCancel,
  isCancelling = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm" dir="rtl">
      <div className="p-5 rounded-2xl border space-y-4 w-full max-w-sm shadow-2xl" style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}>
        <h4 className="text-sm font-black text-red-500 flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>تأكيد إلغاء الطلب</span>
        </h4>
        <p className="text-xs font-medium" style={{ color: 'var(--t2)' }}>
          هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ يرجى تحديد سبب الإلغاء:
        </p>
        <textarea
          rows={3}
          value={cancelReason}
          onChange={(e) => onChangeCancelReason(e.target.value)}
          placeholder="اكتب سبب الإلغاء..."
          className="w-full p-2.5 text-xs font-bold rounded-xl border focus:outline-none transition-colors"
          style={{ background: 'var(--s2)', borderColor: 'var(--bd)', color: 'var(--t1)' }}
        />
        <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--bd)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border text-xs font-bold transition-opacity hover:opacity-80"
            style={{ background: 'var(--s2)', borderColor: 'var(--bd)', color: 'var(--t2)' }}
          >
            تراجع
          </button>
          <button
            type="button"
            disabled={isCancelling}
            onClick={onConfirmCancel}
            className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white transition-opacity disabled:opacity-50"
          >
            {isCancelling ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
          </button>
        </div>
      </div>
    </div>
  );
};
