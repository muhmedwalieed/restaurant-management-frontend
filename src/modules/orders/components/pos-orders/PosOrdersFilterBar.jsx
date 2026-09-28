import React from 'react';
import { Search, ChevronDown, Calendar } from 'lucide-react';

export const STATUS_OPTIONS = [
  { v: 'PENDING', l: 'انتظار' },
  { v: 'CONFIRMED', l: 'مؤكد' },
  { v: 'PREPARING', l: 'قيد التنفيذ' },
  { v: 'READY', l: 'جاهز' },
  { v: 'OUT_FOR_DELIVERY', l: 'في الطريق' },
  { v: 'DELIVERED', l: 'تم التسليم' },
  { v: 'CANCELLED', l: 'ملغي' },
];

export const TYPE_OPTIONS = [
  { v: 'DINE_IN', l: 'صالة' },
  { v: 'PICKUP', l: 'استلام' },
  { v: 'DELIVERY', l: 'توصيل' },
];

export const SOURCE_OPTIONS = [
  { v: 'CASHIER', l: 'كاشير' },
  { v: 'PHONE', l: 'هاتف' },
  { v: 'WHATSAPP', l: 'واتساب' },
  { v: 'WEBSITE', l: 'موقع' },
  { v: 'QR', l: 'طاولة (QR)' },
];

function FilterDropdown({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0 text-xs">
      <span style={{ color: 'var(--t3)' }}>{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="inp text-xs appearance-none py-1 pr-3 pl-7 rounded-lg bg-bg-surface border border-border-default text-txt-primary"
          style={{ height: 32 }}
        >
          <option value="all">الكل</option>
          {options.map((o) => (
            <option key={o.v} value={o.v}>
              {o.l}
            </option>
          ))}
        </select>
        <ChevronDown size={12} className="absolute top-1/2 -translate-y-1/2 left-2 pointer-events-none text-slate-400" />
      </div>
    </div>
  );
}

export const PosOrdersFilterBar = ({
  totalOrders = 0,
  activeCount = 0,
  revenue = 0,
  searchQuery = '',
  onChangeSearch,
  date,
  onChangeDate,
  status,
  onChangeStatus,
  type,
  onChangeType,
  source,
  onChangeSource,
}) => {
  return (
    <div className="flex flex-col border-b shrink-0 select-none" style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}>
      {/* Top row: Summary & Search */}
      <div className="flex items-center justify-between gap-4 px-4 h-14 border-b" style={{ borderColor: 'var(--bd)' }}>
        <div className="flex items-center gap-3 text-xs">
          <h2 className="text-sm font-bold" style={{ color: 'var(--t1)' }}>الطلبات</h2>
          <span className="text-slate-400">·</span>
          <span><strong style={{ color: 'var(--t1)' }}>{totalOrders}</strong> طلب</span>
          <span className="text-slate-400">·</span>
          <span><strong style={{ color: 'var(--ac)' }}>{activeCount}</strong> نشط</span>
          <span className="text-slate-400">·</span>
          <span className="mono"><strong style={{ color: 'var(--ok)' }}>{revenue.toFixed(2)}</strong> ج محصّل</span>
        </div>

        <div className="relative w-64">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearch(e.target.value)}
            placeholder="اسم، رقم طلب، موبايل..."
            className="w-full pr-9 pl-3 py-1.5 rounded-lg bg-bg-surface border border-border-default text-xs text-txt-primary"
          />
        </div>
      </div>

      {/* Bottom row: Filters */}
      <div className="flex items-center gap-3 px-4 py-2 overflow-x-auto scrollbar-thin">
        {/* Date Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <Calendar size={13} style={{ color: 'var(--t3)' }} />
          <input
            type="date"
            value={date}
            onChange={(e) => onChangeDate(e.target.value)}
            className="py-1 px-2 text-xs rounded-lg bg-bg-surface border border-border-default text-txt-primary"
          />
        </div>

        <FilterDropdown label="الحالة:" value={status} onChange={onChangeStatus} options={STATUS_OPTIONS} />
        <FilterDropdown label="النوع:" value={type} onChange={onChangeType} options={TYPE_OPTIONS} />
        <FilterDropdown label="المصدر:" value={source} onChange={onChangeSource} options={SOURCE_OPTIONS} />
      </div>
    </div>
  );
};
