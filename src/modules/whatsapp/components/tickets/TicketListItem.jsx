import React from 'react';
import {
  TICKET_STATUS_LABELS,
  ticketStatusPill,
  TICKET_TYPE_LABELS,
  ticketTypeBadgeClass,
} from '../../schemas/ticket.schema.js';
import { StatusPill } from '../../../../shared/components/StatusPill.jsx';
import { User, ShoppingBag } from 'lucide-react';

export const TicketListItem = ({ ticket, isSelected, onSelect }) => {
  const typeLabel = TICKET_TYPE_LABELS[ticket.ticketType] || ticket.ticketType;
  const statusLabel = TICKET_STATUS_LABELS[ticket.status] || ticket.status;
  const customerName = ticket.customer?.name || ticket.customerPhone;

  return (
    <div
      onClick={() => onSelect(ticket.id)}
      className={`p-3.5 border-b cursor-pointer transition-colors relative text-right ${
        isSelected
          ? 'bg-bg-surface border-r-2 border-r-brand-primary'
          : 'hover:bg-bg-surface/50 border-border-default/60'
      }`}
    >
      {/* Header: Ticket Number & Status */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-brand-primary">
            #{ticket.ticketNumber}
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${ticketTypeBadgeClass(
              ticket.ticketType
            )}`}
          >
            {typeLabel}
          </span>
        </div>

        <StatusPill status={ticketStatusPill(ticket.status)}>
          {statusLabel}
        </StatusPill>
      </div>

      {/* Subject */}
      <h4 className="text-xs font-bold text-txt-primary truncate mb-1">
        {ticket.subject || 'تذكرة بدون موضوع'}
      </h4>

      {/* Customer & Linked Order */}
      <div className="flex items-center justify-between text-[11px] text-txt-muted gap-2 mt-2">
        <span className="flex items-center gap-1 truncate">
          <User size={12} className="text-txt-dim shrink-0" />
          <span className="truncate">{customerName}</span>
        </span>

        {ticket.relatedOrder && (
          <span className="mono font-bold text-brand-primary flex items-center gap-1 shrink-0 bg-brand-primary/10 px-1.5 py-0.5 rounded">
            <ShoppingBag size={10} />
            <span>أوردر #{ticket.relatedOrder.orderNumber}</span>
          </span>
        )}
      </div>
    </div>
  );
};
