import React from 'react';
import {
  TICKET_STATUS_LABELS,
  ticketStatusPill,
  TICKET_TYPE_LABELS,
  ticketTypeBadgeClass,
} from '../../schemas/ticket.schema.js';
import { StatusPill } from '../../../../shared/components/StatusPill.jsx';
import { Button } from '../../../../shared/components/Button.jsx';
import {
  Phone,
  User,
  Headset,
  Shield,
  XCircle,
  CheckCircle2,
  UserCheck,
  ShoppingBag,
} from 'lucide-react';

export const TicketHeader = ({
  ticket,
  currentUser,
  isOwnerOrAdmin,
  onAssignToMe,
  onTakeover,
  onOpenCloseModal,
  isAssigning,
  isTakingOver,
}) => {
  if (!ticket) return null;

  const isClosed = ticket.status === 'CLOSED';
  const isAssignedToMe = ticket.assignedAgentId === currentUser?.id;
  const isAssignedToOther = Boolean(ticket.assignedAgentId && ticket.assignedAgentId !== currentUser?.id);
  const isUnassigned = !ticket.assignedAgentId;
  const ticketNum = ticket.ticketNumber ? `#T-${ticket.ticketNumber}` : `#${ticket.id.slice(-4)}`;

  return (
    <div className="shrink-0 z-10 bg-bg-base border-b border-border-default p-3.5 space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-bg-surface border border-border-default text-txt-primary dir-ltr">
            {ticketNum}
          </span>
          <h3 className="text-sm font-bold text-txt-primary">
            {ticket.subject || 'محادثة تذكرة'}
          </h3>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${ticketTypeBadgeClass(
              ticket.ticketType
            )}`}
          >
            {TICKET_TYPE_LABELS[ticket.ticketType] || ticket.ticketType}
          </span>
          <StatusPill status={ticketStatusPill(ticket.status)}>
            {TICKET_STATUS_LABELS[ticket.status] || ticket.status}
          </StatusPill>
        </div>

        {/* Action Buttons */}
        {!isClosed ? (
          <div className="flex items-center gap-2 flex-wrap">
            {isUnassigned && (
              <Button
                size="sm"
                variant="primary"
                icon={Headset}
                className="text-xs h-8 px-3.5 font-bold shadow-sm rounded-lg"
                isLoading={isAssigning}
                onClick={onAssignToMe}
              >
                تولّي التذكرة
              </Button>
            )}

            {isAssignedToMe && (
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-status-success-bg text-status-success border border-status-success/30 font-bold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                أنت المسؤول
              </span>
            )}

            {isOwnerOrAdmin && isAssignedToOther && (
              <Button
                size="sm"
                variant="outline"
                icon={Shield}
                className="text-xs h-8 px-2.5 text-brand-primary border-brand-primary/30 font-medium rounded-lg"
                isLoading={isTakingOver}
                onClick={onTakeover}
                title="سحب التذكرة للمشرف"
              >
                سحب للمشرف
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              icon={XCircle}
              aria-label="إغلاق التذكرة"
              className="text-xs h-8 px-3 text-status-danger bg-status-danger-bg/10 hover:bg-status-danger-bg/30 border-status-danger/30 font-bold rounded-lg"
              onClick={onOpenCloseModal}
              title="إغلاق التذكرة وتوثيق الحل"
            >
              إغلاق التذكرة
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-lg bg-bg-surface border border-border-default text-txt-muted font-medium flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
              <span>تذكرة مغلقة</span>
            </span>
          </div>
        )}
      </div>

      {/* Customer & Agent Details */}
      <div className="flex items-center justify-between gap-2 text-xs text-txt-muted border-t border-border-subtle pt-2 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-brand-primary" />
            <strong className="text-txt-primary dir-ltr font-mono">{ticket.customerPhone}</strong>
          </span>
          {ticket.customer?.name && (
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-txt-dim" />
              <span>{ticket.customer.name}</span>
            </span>
          )}
          <span className="text-txt-dim">
            المسؤول:{' '}
            <strong className="text-txt-primary">
              {ticket.assignedAgent?.name || (isAssignedToMe ? currentUser?.name : 'غير معين')}
            </strong>
          </span>
        </div>
      </div>

      {/* Linked Order Banner */}
      {ticket.relatedOrder && (
        <div className="p-2.5 rounded-md bg-brand-primary/5 border border-brand-primary/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-primary shrink-0" />
            <div>
              <span className="font-bold text-txt-primary">
                مرتبط بطلب: أوردر #{ticket.relatedOrder.orderNumber}
              </span>
              <span className="text-txt-muted mr-2">
                (الحالة: {ticket.relatedOrder.status} · الإجمالي:{' '}
                {Number(ticket.relatedOrder.total).toFixed(2)}{' '}
                {ticket.relatedOrder.currency || 'ج.م'})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
