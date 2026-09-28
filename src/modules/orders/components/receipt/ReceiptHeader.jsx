import React from 'react';
import {
  ORDER_TYPE_LABELS,
  ORDER_SOURCE_LABELS,
} from '../../schemas/order.schema.js';

export const ReceiptHeader = ({
  order,
  restaurantName,
  branchName,
  formattedDate,
  customerName,
  tableLabel,
}) => {
  return (
    <>
      {/* Restaurant & Branch Header */}
      <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
        <h2 className="text-base font-bold tracking-tight text-black" dir="rtl">
          {restaurantName}
        </h2>
        {branchName && (
          <p className="text-xs text-gray-700 font-medium" dir="auto">
            <bdi>{branchName}</bdi>
          </p>
        )}
      </div>

      {/* Meta details */}
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
            {tableLabel && <bdi>{` (طاولة ${tableLabel})`}</bdi>}
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
    </>
  );
};
