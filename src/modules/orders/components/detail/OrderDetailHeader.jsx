import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ReceiptText, Printer } from 'lucide-react';
import { Button } from '../../../../shared/components/Button.jsx';
import { StatusPill } from '../../../../shared/components/StatusPill.jsx';
import { ORDER_STATUS_LABELS, orderStatusPill } from '../../schemas/order.schema.js';

export const OrderDetailHeader = ({ order, onOpenPrintModal }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 select-none">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/orders')}
          icon={ChevronRight}
          className="text-xs shrink-0"
        >
          العودة للطلبات
        </Button>

        <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
          <h1 className="text-lg font-bold text-txt-primary flex items-center gap-2 truncate">
            <ReceiptText className="w-5 h-5 text-brand-primary shrink-0" />
            <span>طلب #{order?.orderNumber}</span>
          </h1>

          <StatusPill status={orderStatusPill(order?.status)}>
            {ORDER_STATUS_LABELS[order?.status] || order?.status}
          </StatusPill>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          icon={Printer}
          onClick={onOpenPrintModal}
          className="text-xs"
        >
          طباعة الفاتورة
        </Button>
      </div>
    </div>
  );
};
