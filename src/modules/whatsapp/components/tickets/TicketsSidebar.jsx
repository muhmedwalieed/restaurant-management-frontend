import React from 'react';
import { Search, Plus, Tag } from 'lucide-react';
import { Button } from '../../../../shared/components/Button.jsx';
import { TicketListItem } from './TicketListItem.jsx';
import { TICKET_STATUS_LABELS } from '../../schemas/ticket.schema.js';

export const TYPE_FILTERS = [
  { id: 'ALL', label: 'الكل' },
  { id: 'SUPPORT', label: 'دعم' },
  { id: 'COMPLAINT', label: 'شكاوى' },
  { id: 'ORDER', label: 'طلبات' },
  { id: 'INQUIRY', label: 'استفسار' },
];

export const TicketsSidebar = ({
  tickets = [],
  selectedTicketId,
  onSelectTicket,
  searchQuery,
  onChangeSearch,
  typeFilter,
  onChangeTypeFilter,
  statusFilter,
  onChangeStatusFilter,
  onOpenNewTicketModal,
}) => {
  return (
    <div className="w-full md:w-[330px] lg:w-[360px] h-full flex flex-col shrink-0 border-l border-border-default bg-bg-base overflow-hidden select-none">
      {/* Top Header */}
      <div className="p-3.5 border-b border-border-default space-y-3 shrink-0 bg-gradient-to-b from-bg-surface to-bg-base">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
              <Tag className="w-3.5 h-3.5 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-txt-primary leading-tight">
                قائمة التذاكر ({tickets.length})
              </h2>
              <span className="text-[10px] text-txt-muted font-medium">
                {tickets.length} تذكرة
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            className="text-[11px] px-2.5 py-1 h-7 font-bold rounded-lg shadow-sm"
            onClick={onOpenNewTicketModal}
          >
            جديدة
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-txt-dim pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearch(e.target.value)}
            placeholder="بحث بالهاتف، الموضوع، العميل..."
            className="w-full h-8 pr-10 pl-3 rounded-lg bg-bg-surface border border-border-default text-txt-primary text-[11px] focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all placeholder:text-txt-dim"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
          {TYPE_FILTERS.map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => onChangeTypeFilter(tf.id)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all text-[11px] font-medium cursor-pointer ${
                typeFilter === tf.id
                  ? 'bg-brand-primary text-txt-inverted font-bold shadow-sm'
                  : 'bg-bg-surface text-txt-muted hover:text-txt-primary hover:bg-bg-surface/80 border border-border-default'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => onChangeStatusFilter(e.target.value)}
          className="w-full h-7 text-[11px] px-2 rounded-lg bg-bg-surface border border-border-default text-txt-primary focus:outline-none focus:border-brand-primary"
        >
          <option value="ALL">جميع الحالات</option>
          {Object.entries(TICKET_STATUS_LABELS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Tickets List Scrollable */}
      <div className="flex-1 overflow-y-auto divide-y divide-border-subtle custom-scrollbar">
        {tickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-txt-muted space-y-1">
            <p className="font-bold text-txt-primary">لا توجد تذاكر مطابقة</p>
            <p className="text-[11px]">جرّب تغيير فلاتر البحث أو إنشاء تذكرة جديدة.</p>
          </div>
        ) : (
          tickets.map((t) => (
            <TicketListItem
              key={t.id}
              ticket={t}
              isSelected={selectedTicketId === t.id}
              onSelect={onSelectTicket}
            />
          ))
        )}
      </div>
    </div>
  );
};
