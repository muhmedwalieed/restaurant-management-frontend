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
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="p-4 rounded-xl border space-y-3 w-full max-w-sm" style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}>
        <h4 className="text-sm font-bold text-red-400 flex items-center gap-1.5">
          <AlertTriangle size={16} />
          <span>تأكيد إلغاء الطلب</span>
        </h4>
        <p className="text-xs" style={{ color: 'var(--t2)' }}>
          هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ يرجى تحديد سبب الإلغاء:
        </p>
        <textarea
          rows={2}
          value={cancelReason}
          onChange={(e) => onChangeCancelReason(e.target.value)}
          className="w-full p-2 text-xs rounded-lg bg-bg-surface border border-border-default text-txt-primary"
        />
        <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border text-xs font-medium text-slate-300"
          >
            تراجع
          </button>
          <button
            type="button"
            disabled={isCancelling}
            onClick={onConfirmCancel}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white"
          >
            {isCancelling ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
          </button>
        </div>
      </div>
    </div>
  );
};
