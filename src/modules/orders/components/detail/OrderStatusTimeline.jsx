import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { ORDER_STATUS_LABELS, nextStatuses } from '../../schemas/order.schema.js';
import { Button } from '../../../../shared/components/Button.jsx';

export const OrderStatusTimeline = ({
  order,
  onStatusChange,
  isUpdatingStatus,
  onOpenCancelModal,
}) => {
  if (!order) return null;

  const validNext = nextStatuses(order.status) || [];

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-4 space-y-3 shadow-sm select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-txt-primary flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-primary" />
          <span>مرحلة وحالة الطلب الحالية:</span>
        </h3>

        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
          <button
            type="button"
            onClick={onOpenCancelModal}
            className="text-[11px] text-red-400 hover:underline font-semibold cursor-pointer"
          >
            إلغاء الطلب
          </button>
        )}
      </div>

      {/* Action Buttons for Next Status Transitions */}
      {validNext.length > 0 && order.status !== 'CANCELLED' && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {validNext.map((statusKey) => (
            <Button
              key={statusKey}
              size="sm"
              variant="primary"
              disabled={isUpdatingStatus}
              onClick={() => onStatusChange(statusKey)}
              className="text-xs shadow-sm font-bold"
            >
              <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
              <span>ترقية إلى: {ORDER_STATUS_LABELS[statusKey]}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
