import React from 'react';
import { History } from 'lucide-react';
import { ORDER_STATUS_LABELS } from '../../schemas/order.schema.js';

export const OrderHistoryAuditTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) return null;

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-4 space-y-3 shadow-sm text-xs">
      <h3 className="font-bold text-txt-primary flex items-center gap-2 border-b border-border-subtle/50 pb-2">
        <History className="w-4 h-4 text-brand-primary" />
        <span>سجل تتبع مراحل الطلب (Audit Log)</span>
      </h3>

      <div className="space-y-3 relative before:absolute before:right-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-default/60">
        {history.map((step, idx) => (
          <div key={idx} className="flex items-start gap-3 relative pr-5">
            <div className="absolute right-0 top-1 w-4 h-4 rounded-full bg-brand-primary/20 border-2 border-brand-primary flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-txt-primary">
                  {ORDER_STATUS_LABELS[step.status] || step.status || step.action}
                </span>
                <span className="text-[10px] text-txt-dim mono">
                  {new Date(step.createdAt).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {step.user?.name && (
                <span className="text-[11px] text-txt-muted block">
                  بواسطة: {step.user.name}
                </span>
              )}

              {step.notes && (
                <p className="text-[11px] text-txt-dim mt-0.5 leading-snug">
                  {step.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
