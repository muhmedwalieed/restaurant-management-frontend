import React from 'react';
import { Button } from '../../../../shared/components/Button.jsx';
import { Bell, Receipt, Check } from 'lucide-react';

export const TableSessionWaiterCallBanner = ({
  waiterCall,
  acceptMutation,
  dismissMutation,
}) => {
  if (!waiterCall) return null;

  const isAccepted = waiterCall.status === 'ACCEPTED';
  const isBill = waiterCall.type === 'BILL';

  return (
    <div
      className={`rounded-lg border p-3 space-y-2 ${
        isAccepted
          ? 'border-status-success/30 bg-status-success/5'
          : isBill
            ? 'border-amber-500/40 bg-amber-500/10'
            : 'border-status-warning/30 bg-status-warning/5'
      }`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`text-xs font-bold flex items-center gap-1.5 ${
            isAccepted
              ? 'text-status-success'
              : isBill
                ? 'text-amber-300'
                : 'text-status-warning'
          }`}
        >
          {isBill ? <Receipt className="w-4 h-4 text-amber-400" /> : <Bell className="w-3.5 h-3.5" />}
          {isAccepted
            ? isBill
              ? 'الويتر في الطريق للعميل بالحساب'
              : 'الويتر في الطريق للعميل'
            : isBill
              ? `طلب فاتورة وحساب من ${waiterCall.requesterName}`
              : `استدعاء ويتر من ${waiterCall.requesterName}`}
        </p>
        {isBill && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            طلب حساب
          </span>
        )}
      </div>

      {waiterCall.note && <p className="text-[11px] text-txt-muted">{waiterCall.note}</p>}

      <div className="flex flex-wrap gap-2 pt-1">
        {waiterCall.status === 'PENDING' && (
          <Button
            size="sm"
            variant="primary"
            icon={Check}
            isLoading={acceptMutation.isPending}
            onClick={() => acceptMutation.mutate()}
          >
            قبول والذهاب للعميل
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          icon={Check}
          isLoading={dismissMutation.isPending}
          onClick={() => dismissMutation.mutate()}
          title="تم الوصول للعميل"
        >
          تم الوصول
        </Button>
      </div>
    </div>
  );
};
