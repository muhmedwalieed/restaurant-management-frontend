import React, { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { AlertTriangle, X } from 'lucide-react';

const COMMON_REASONS = [
  'العميل لا يجيب على الهاتف',
  'العنوان غير صحيح أو غير واضح',
  'العميل رفض استلام الطلب',
  'العميل قام بإلغاء الطلب عند الوصول',
  'تأخر شديد في الوصول لظروف طارئة',
];

export const DeliveryFailModal = ({
  isOpen,
  onClose,
  order,
  onConfirmFail,
  isLoading = false,
}) => {
  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  if (!isOpen || !order) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason = selectedReason === 'other' ? customReason : selectedReason;
    if (!finalReason.trim()) return;
    onConfirmFail(order, finalReason);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تعذر تسليم طلب #${order.orderNumber}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs" dir="rtl">
        <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 flex items-start gap-2.5 text-red-600 dark:text-red-400">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-xs">هل أنت متأكد من تعذر تسليم هذا الطلب؟</p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              سيتم تسجيل الطلب كمرتجع للمطعم وإشعار الإدارة بالسبب.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-bold text-zinc-900 dark:text-zinc-100">اختر سبب التعذر:</label>
          <div className="space-y-1.5">
            {COMMON_REASONS.map((r) => (
              <label
                key={r}
                className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                  selectedReason === r
                    ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  name="failReason"
                  checked={selectedReason === r}
                  onChange={() => setSelectedReason(r)}
                  className="accent-red-600"
                />
                <span>{r}</span>
              </label>
            ))}

            <label
              className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                selectedReason === 'other'
                  ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <input
                type="radio"
                name="failReason"
                checked={selectedReason === 'other'}
                onChange={() => setSelectedReason('other')}
                className="accent-red-600"
              />
              <span>سبب آخر (كتابة يدوية)</span>
            </label>
          </div>

          {selectedReason === 'other' && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="اكتب سبب تعذر التسليم بالتفصيل..."
              rows={2}
              required
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-red-500"
            />
          )}
        </div>

        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-bold text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-500 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'جاري التسجيل...' : 'تأكيد تعذر التسليم'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DeliveryFailModal;
