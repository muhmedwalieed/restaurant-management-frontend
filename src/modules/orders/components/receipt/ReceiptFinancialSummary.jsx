import React from 'react';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '../../schemas/order.schema.js';

export const ReceiptFinancialSummary = ({ order, currency = 'EGP' }) => {
  const money = (value) => `${currency} ${Number(value || 0).toFixed(2)}`;

  return (
    <>
      {/* Financial Summary */}
      <div className="py-2.5 space-y-1.5 border-b border-dashed border-gray-400 text-xs">
        <div className="flex items-center justify-between text-gray-700">
          <span dir="rtl">المجموع الفرعي:</span>
          <span className="font-mono tabular-nums inline-block" dir="ltr">
            {money(order.subtotal || order.total)}
          </span>
        </div>
        {order.tax > 0 && (
          <div className="flex items-center justify-between text-gray-700">
            <span dir="rtl">الضريبة:</span>
            <span className="font-mono tabular-nums inline-block" dir="ltr">
              {money(order.tax)}
            </span>
          </div>
        )}
        {order.discount > 0 && (
          <div className="flex items-center justify-between text-gray-700">
            <span dir="rtl">الخصم:</span>
            <span className="font-mono tabular-nums inline-block" dir="ltr">
              -{money(order.discount)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1.5 text-sm font-bold text-black border-t border-gray-300">
          <span dir="rtl">الإجمالي النهائي:</span>
          <span className="font-mono tabular-nums inline-block" dir="ltr">
            {money(order.total)}
          </span>
        </div>
      </div>

      {/* Payment Information */}
      <div className="py-2 border-b border-dashed border-gray-400 text-[11px] space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-semibold" dir="rtl">
            حالة الدفع:
          </span>
          <span className="font-bold text-black inline-block" dir="rtl">
            <bdi>{PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus || 'غير مدفوع'}</bdi>
          </span>
        </div>
        {order.paymentMethod && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-semibold" dir="rtl">
              طريقة الدفع:
            </span>
            <span className="text-gray-800 inline-block" dir="rtl">
              <bdi>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</bdi>
            </span>
          </div>
        )}
      </div>
    </>
  );
};
