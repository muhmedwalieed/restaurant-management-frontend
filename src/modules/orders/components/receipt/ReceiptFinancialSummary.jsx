import React from 'react';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '../../schemas/order.schema.js';

export const ReceiptFinancialSummary = ({ order, currency = 'EGP' }) => {
  const money = (value) => `${Number(value || 0).toFixed(2)} ${currency}`;

  return (
    <>
      {/* Financial Summary */}
      <div className="py-2.5 space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-[#555]">
          <span dir="rtl">المجموع الفرعي:</span>
          <span className="font-mono tabular-nums inline-block" dir="ltr">
            {money(order.subtotal || order.total)}
          </span>
        </div>
        {order.tax > 0 && (
          <div className="flex items-center justify-between text-[#555]">
            <span dir="rtl">الضريبة:</span>
            <span className="font-mono tabular-nums inline-block" dir="ltr">
              {money(order.tax)}
            </span>
          </div>
        )}
        {order.discount > 0 && (
          <div className="flex items-center justify-between text-[#555]">
            <span dir="rtl">الخصم:</span>
            <span className="font-mono tabular-nums inline-block" dir="ltr">
              -{money(order.discount)}
            </span>
          </div>
        )}
      </div>

      {/* Grand total — the receipt's focal row */}
      <div className="pt-2 border-t border-dashed border-[#ccc] flex items-center justify-between text-[15px] font-bold text-black">
        <span dir="rtl">الإجمالي النهائي:</span>
        <span className="font-mono tabular-nums inline-block" dir="ltr">
          {money(order.total)}
        </span>
      </div>

      {/* Payment Information */}
      <div className="mt-2.5 py-2 border-t border-dashed border-[#ccc] text-[11px] space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[#555] font-semibold" dir="rtl">
            حالة الدفع:
          </span>
          <span className="font-bold text-black inline-block" dir="rtl">
            <bdi>{PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus || 'غير مدفوع'}</bdi>
          </span>
        </div>
        {order.paymentMethod && (
          <div className="flex items-center justify-between">
            <span className="text-[#555] font-semibold" dir="rtl">
              طريقة الدفع:
            </span>
            <span className="text-[#444] inline-block" dir="rtl">
              <bdi>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</bdi>
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default ReceiptFinancialSummary;
