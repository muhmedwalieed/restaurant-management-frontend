import React from 'react';
import {
  ORDER_TYPE_LABELS,
  ORDER_SOURCE_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '../schemas/order.schema.js';

/**
 * Thermal receipt print template.
 *
 * RTL/BiDi rules (Print QA):
 * - The parent is `dir="rtl"`. Each row is `flex justify-between`, so the FIRST
 *   child sits on the RIGHT (the Arabic label) and the SECOND child sits on the
 *   LEFT (the value) — matching "label: value" RTL reading order.
 * - Arabic-only content: `dir="rtl"`.
 * - LTR content (order number, prices, currency, dates, phone): `dir="ltr"`.
 * - Mixed content uses `<bdi>` for isolation so parentheses, numbers and Latin
 *   names are never reordered by the surrounding RTL context.
 */
export const ReceiptPrintTemplate = ({ order, activeBranch, isPreview = false }) => {
  if (!order) return null;

  const branchName = order.branch?.name || activeBranch?.name || 'الفرع الرئيسي';
  const customerName =
    order.customer?.name || (order.customer?.phone ? 'عميل مسجل' : 'عميل مباشر');
  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString('ar-EG', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  const money = (value) => `EGP ${Number(value || 0).toFixed(2)}`;

  return (
    <div
      dir="rtl"
      className={
        isPreview
          ? 'w-full max-w-[340px] mx-auto bg-white text-black font-sans text-xs p-5 rounded-lg shadow-md border border-gray-200 text-right overflow-hidden'
          : 'printable-receipt hidden print:block print:w-[80mm] print:max-w-[80mm] print:bg-white print:text-black font-sans text-xs p-3 print:p-3 mx-auto text-right print:mx-auto'
      }
    >
      {/* 1. Header: Brand & Branch Context */}
      <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
        <h2 className="text-base font-bold tracking-tight text-black" dir="rtl">
          مطاعم برايم
        </h2>
        <p className="text-xs text-gray-700 font-medium" dir="auto">
          <bdi>{branchName}</bdi>
        </p>
        <p className="text-[10px] text-gray-500 font-mono tracking-wider" dir="ltr">
          CUSTOMER RECEIPT / فاتورة طلب
        </p>
      </div>

      {/* 2. Metadata Block — label (right) then value (left) */}
      <div className="py-2.5 space-y-1.5 border-b border-dashed border-gray-400 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-semibold" dir="rtl">
            رقم الطلب:
          </span>
          <span className="font-bold text-black font-mono inline-block" dir="ltr">
            #{order.orderNumber}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-semibold" dir="rtl">
            التاريخ والوقت:
          </span>
          <span className="font-mono text-gray-800 inline-block" dir="ltr">
            {formattedDate}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-semibold" dir="rtl">
            نوع الطلب:
          </span>
          <span className="font-semibold text-black inline-block" dir="rtl">
            <bdi>{ORDER_TYPE_LABELS[order.type] || order.type}</bdi>
            {order.table && <bdi>{` (طاولة ${order.table.label})`}</bdi>}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-semibold" dir="rtl">
            المصدر:
          </span>
          <span className="text-gray-800 inline-block" dir="rtl">
            <bdi>{ORDER_SOURCE_LABELS[order.source] || order.source}</bdi>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-semibold" dir="rtl">
            العميل:
          </span>
          <span className="text-gray-800 truncate max-w-[180px] inline-block" dir="auto">
            <bdi>{customerName}</bdi>
          </span>
        </div>

        {order.customer?.phone && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-semibold" dir="rtl">
              الهاتف:
            </span>
            <span className="font-mono text-gray-800 inline-block" dir="ltr">
              {order.customer.phone}
            </span>
          </div>
        )}
      </div>

      {/* 3. Items List Table */}
      <div className="py-2.5 border-b border-dashed border-gray-400">
        <table className="w-full text-right text-[11px] table-fixed" dir="rtl">
          <thead>
            <tr className="border-b border-gray-300 text-gray-700 font-bold">
              <th className="pb-1.5 text-right w-[44%]" dir="rtl">
                الصنف
              </th>
              <th className="pb-1.5 text-center w-[16%]" dir="rtl">
                الكمية
              </th>
              <th className="pb-1.5 text-left w-[20%]" dir="rtl">
                السعر
              </th>
              <th className="pb-1.5 text-left w-[20%]" dir="rtl">
                الإجمالي
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items?.map((item) => (
              <tr key={item.id} className="align-top">
                <td className="py-1.5 font-medium text-black break-words leading-tight" dir="auto">
                  <div dir="auto">{item.productName}</div>
                  {item.notes && (
                    <div className="text-[10px] text-gray-500 font-normal mt-0.5" dir="auto">
                      ملاحظة: <bdi>{item.notes}</bdi>
                    </div>
                  )}
                </td>
                <td className="py-1.5 text-center font-mono font-bold whitespace-nowrap" dir="ltr">
                  {item.quantity}
                </td>
                <td className="py-1.5 text-left font-mono tabular-nums whitespace-nowrap" dir="ltr">
                  {Number(item.unitPrice || 0).toFixed(2)}
                </td>
                <td className="py-1.5 text-left font-mono font-bold tabular-nums whitespace-nowrap" dir="ltr">
                  {Number(item.subtotal || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Financial Summary Breakdown — label (right) then LTR money value (left) */}
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

      {/* 5. Payment Status Summary */}
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

      {/* 6. Receipt Footer */}
      <div className="pt-2.5 text-center text-[10px] text-gray-600 space-y-0.5">
        <p className="font-semibold text-black" dir="rtl">
          شكراً لزيارتكم مطاعم برايم!
        </p>
        <p dir="rtl">نتمنى لكم تجربة شهية ويوماً سعيداً.</p>
      </div>
    </div>
  );
};

export default ReceiptPrintTemplate;