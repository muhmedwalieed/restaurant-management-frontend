import React from 'react';
import { Lock, Clock, Star } from 'lucide-react';
import {
  RESOLUTION_STATUS_LABELS,
  RESOLUTION_CATEGORY_LABELS,
} from '../../schemas/ticket.schema.js';

export const TicketClosedSummary = ({ ticket }) => {
  if (!ticket || ticket.status !== 'CLOSED') return null;

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5 text-status-warning">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${
              s <= (rating || 0) ? 'fill-status-warning text-status-warning' : 'text-txt-dim stroke-1'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-3.5 rounded-lg bg-bg-base border border-border-default space-y-2 text-xs">
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2">
        <div className="flex items-center gap-1.5 font-bold text-status-danger">
          <Lock className="w-4 h-4 shrink-0" />
          <span>تم إغلاق التذكرة.</span>
        </div>
        <span className="text-[11px] text-txt-dim">
          {new Date(ticket.closedAt || ticket.updatedAt).toLocaleString('ar-EG')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
        <div>
          <span className="text-txt-muted">حالة الحل: </span>
          <strong className="text-txt-primary">
            {RESOLUTION_STATUS_LABELS[ticket.resolutionStatus] || ticket.resolutionStatus || 'تم الحل'}
          </strong>
        </div>
        <div>
          <span className="text-txt-muted">التصنيف: </span>
          <strong className="text-txt-primary">
            {RESOLUTION_CATEGORY_LABELS[ticket.resolutionCategory] || ticket.resolutionCategory || 'استفسار'}
          </strong>
        </div>
        <div>
          <span className="text-txt-muted">أغلقت بواسطة: </span>
          <strong className="text-txt-primary">
            {ticket.closedBy?.name || 'الموظف المسؤول'}
          </strong>
        </div>
      </div>

      {ticket.resolutionNotes && (
        <div className="p-2 bg-bg-surface rounded border border-border-subtle text-[11px] text-txt-primary">
          <span className="text-txt-muted font-bold block mb-0.5">ملاحظات الإغلاق:</span>
          <p className="whitespace-pre-wrap">{ticket.resolutionNotes}</p>
        </div>
      )}

      {ticket.feedbackRating ? (
        <div className="p-2.5 bg-status-warning-bg/20 rounded border border-status-warning/30 flex items-center justify-between gap-2 text-xs mt-2">
          <div className="space-y-0.5">
            <span className="font-bold text-txt-primary flex items-center gap-1.5">
              <span>تقييم العميل للخدمة:</span>
              {renderStars(ticket.feedbackRating)}
              <span className="font-mono">({ticket.feedbackRating}/5)</span>
            </span>
            {ticket.feedbackComment && (
              <p className="text-[11px] text-txt-muted italic">&ldquo;{ticket.feedbackComment}&rdquo;</p>
            )}
          </div>
          {ticket.feedbackResolved !== null && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                ticket.feedbackResolved
                  ? 'bg-status-success-bg text-status-success'
                  : 'bg-status-danger-bg text-status-danger'
              }`}
            >
              {ticket.feedbackResolved ? 'تم الحل بنجاح' : 'لم تُحل المشكلة'}
            </span>
          )}
        </div>
      ) : (
        <div className="text-[11px] text-txt-dim italic pt-1 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>تم إرسال استبيان التقييم للعميل عبر الواتساب وبانتظار رده...</span>
        </div>
      )}
    </div>
  );
};
