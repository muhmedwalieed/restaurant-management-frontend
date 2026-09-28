import React from 'react';
import { Button } from '../../../../shared/components/Button.jsx';
import { EditableItemRow } from './TableSessionItemsList.jsx';
import { Receipt, CheckCircle2, Undo2 } from 'lucide-react';

export const TableSessionPendingOrderCard = ({
  pendingOrder,
  confirmMutation,
  rejectMutation,
  updateMutation,
  removeMutation,
  onConfirm,
  onReject,
}) => {
  if (!pendingOrder) return null;

  return (
    <div className="rounded-lg border border-status-warning/30 bg-status-warning/5 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-status-warning flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5" />
          أوردر #{pendingOrder.orderNumber} بانتظار المراجعة
        </p>
        <span className="text-xs font-mono font-bold text-txt-primary">
          {Number(pendingOrder.total || 0).toFixed(2)}
        </span>
      </div>

      <div className="space-y-1.5 max-h-44 overflow-y-auto">
        {pendingOrder.items.map((item) => (
          <EditableItemRow
            key={item.id}
            item={item}
            onUpdate={(id, qty) => updateMutation.mutate({ itemId: id, quantity: qty })}
            onRemove={(id) => removeMutation.mutate(id)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          size="sm"
          variant="primary"
          icon={CheckCircle2}
          isLoading={confirmMutation.isPending}
          onClick={onConfirm}
        >
          تأكيد الطلب #{pendingOrder.orderNumber}
        </Button>
        <Button
          size="sm"
          variant="outline"
          icon={Undo2}
          isLoading={rejectMutation.isPending}
          onClick={onReject}
          title="إرجاع الطلب للعميل للتعديل وإعادة الإرسال"
        >
          إرجاع للعميل
        </Button>
      </div>
    </div>
  );
};
