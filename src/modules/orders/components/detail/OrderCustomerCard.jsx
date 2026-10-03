import React from 'react';
import { User } from 'lucide-react';
import { ORDER_TYPE_LABELS, ORDER_SOURCE_LABELS } from '../../schemas/order.schema.js';
import { formatTableLabel } from '../../../tables/utils/tableLabel.js';

export const OrderCustomerCard = ({ order }) => {
  if (!order) return null;

  const customerName = order.customer?.name || order.customerName || 'عميل مباشر';
  const phone = order.customer?.phone || order.customerPhone;
  const deliveryAddress = order.deliveryAddress;
  const table = order.table;

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-4 space-y-3 shadow-sm text-xs">
      <h3 className="font-bold text-txt-primary flex items-center gap-2 border-b border-border-subtle/50 pb-2">
        <User className="w-4 h-4 text-brand-primary" />
        <span>بيانات العميل ونوع الطلب</span>
      </h3>

      <div className="space-y-2">
        {order.type !== 'DINE_IN' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-txt-muted">اسم العميل:</span>
              <span className="font-bold text-txt-primary">{customerName}</span>
            </div>

            {phone && (
              <div className="flex items-center justify-between">
                <span className="text-txt-muted">رقم الهاتف:</span>
                <span className="font-mono font-semibold text-txt-primary" dir="ltr">
                  {phone}
                </span>
              </div>
            )}
          </>
        )}

        <div className="flex items-center justify-between">
          <span className="text-txt-muted">نوع الطلب:</span>
          <span className="font-semibold text-txt-primary">
            {ORDER_TYPE_LABELS[order.type] || order.type}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-txt-muted">المصدر:</span>
          <span className="font-semibold text-txt-primary">
            {ORDER_SOURCE_LABELS[order.source] || order.source}
          </span>
        </div>

        {table && (
          <div className="flex items-center justify-between pt-1 border-t border-border-subtle/30">
            <span className="text-txt-muted">الطاولة:</span>
            <span className="font-bold text-brand-primary">
              {formatTableLabel(table.label || table.number || table.name)}
            </span>
          </div>
        )}

        {deliveryAddress && (
          <div className="pt-1 border-t border-border-subtle/30 space-y-1">
            <span className="text-txt-muted block">عنوان التوصيل:</span>
            <span className="font-medium text-txt-primary leading-relaxed block bg-bg-base p-2 rounded-lg">
              {deliveryAddress}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
