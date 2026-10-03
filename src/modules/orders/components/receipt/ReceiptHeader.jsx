import React from 'react';
import {
  ORDER_TYPE_LABELS,
  ORDER_SOURCE_LABELS,
} from '../../schemas/order.schema.js';
import { formatTableLabel } from '../../../tables/utils/tableLabel.js';

/**
 * Centered receipt header — same shape as the table thermal bill
 * (big branch name, order line, date) followed by the order meta block.
 */
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
      {/* Restaurant / Branch + order reference, centered */}
      <div className="text-center pb-2.5 border-b border-dashed border-[#ccc] space-y-0.5">
        <div className="text-base font-bold text-black" dir="rtl">
          <bdi>{restaurantName}</bdi>
        </div>
        {branchName && (
          <div className="text-xs text-[#666] font-medium" dir="auto">
            <bdi>{branchName}</bdi>
          </div>
        )}
        <div className="text-xs text-[#666] flex items-center justify-center gap-1">
          <span dir="rtl">فاتورة طلب</span>
          <span className="font-mono font-bold text-black" dir="ltr">#{order.orderNumber}</span>
        </div>
        <div className="text-[11px] text-[#888] flex items-center justify-center gap-1">
          <span dir="rtl">التاريخ:</span>
          <span className="font-mono" dir="ltr">{formattedDate}</span>
        </div>
      </div>

      {/* Order meta */}
      <div className="py-2.5 space-y-1.5 border-b border-dashed border-[#ccc] text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-[#555] font-semibold" dir="rtl">
            نوع الطلب:
          </span>
          <span className="font-semibold text-black inline-block" dir="rtl">
            <bdi>{ORDER_TYPE_LABELS[order.type] || order.type}</bdi>
            {tableLabel && <bdi>{` (${formatTableLabel(tableLabel)})`}</bdi>}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#555] font-semibold" dir="rtl">
            المصدر:
          </span>
          <span className="text-[#444] inline-block" dir="rtl">
            <bdi>{ORDER_SOURCE_LABELS[order.source] || order.source}</bdi>
          </span>
        </div>

        {(order.type !== 'DINE_IN' || order.customer?.name) && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[#555] font-semibold" dir="rtl">
                العميل:
              </span>
              <span className="text-[#444] truncate max-w-[180px] inline-block" dir="auto">
                <bdi>{customerName}</bdi>
              </span>
            </div>

            {order.customer?.phone && (
              <div className="flex items-center justify-between">
                <span className="text-[#555] font-semibold" dir="rtl">
                  الهاتف:
                </span>
                <span className="font-mono text-[#444] inline-block" dir="ltr">
                  {order.customer.phone}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ReceiptHeader;
