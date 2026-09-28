import React from 'react';

export const ModifierModalFooter = ({
  unitPrice = 0,
  currency = 'ج.م',
  onClose,
  onConfirm,
}) => {
  return (
    <div
      className="px-5 py-4 shrink-0 flex flex-col gap-3"
      style={{ borderTop: '1px solid var(--bd)', background: 'var(--s1)' }}
    >
      <div className="inset px-4 py-2.5 flex items-center justify-between" style={{ border: '1px solid var(--bd)' }}>
        <span className="text-xs" style={{ color: 'var(--t2)' }}>
          السعر النهائي للصنف
        </span>
        <span className="text-sm font-bold mono" style={{ color: 'var(--ac)' }}>
          {unitPrice.toFixed(2)} {currency}
        </span>
      </div>

      <div className="flex gap-2.5">
        <button
          type="button"
          className="btn btn-ghost flex-1 cursor-pointer"
          onClick={onClose}
        >
          إلغاء
        </button>
        <button
          type="button"
          className="btn btn-primary flex-1 cursor-pointer"
          onClick={onConfirm}
        >
          إضافة للسلة • {unitPrice.toFixed(2)} {currency}
        </button>
      </div>
    </div>
  );
};
