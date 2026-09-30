import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';

const STATUS_OPTIONS = [
  { v: 'PENDING', l: 'انتظار' },
  { v: 'CONFIRMED', l: 'مؤكد' },
  { v: 'PREPARING', l: 'قيد التنفيذ' },
  { v: 'READY', l: 'جاهز' },
  { v: 'OUT_FOR_DELIVERY', l: 'في الطريق' },
  { v: 'DELIVERED', l: 'تم التسليم' },
  { v: 'CANCELLED', l: 'ملغي' },
];

const TYPE_OPTIONS = [
  { v: 'PICKUP', l: 'استلام' },
  { v: 'DELIVERY', l: 'توصيل' },
  { v: 'DINE_IN', l: 'صالة' },
];

const SOURCE_OPTIONS = [
  { v: 'CASHIER', l: 'كاشير' },
  { v: 'PHONE', l: 'هاتف' },
  { v: 'WHATSAPP', l: 'واتساب' },
  { v: 'WEBSITE', l: 'موقع' },
  { v: 'QR', l: 'طاولة (QR)' },
];

const MONTH_NAMES = [
  'يناير','فبراير','مارس','أبريل','مايو','يونيو',
  'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر',
];
const DAY_HEADERS = ['سبت', 'حد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];

function toDs(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function todayDs() {
  const t = new Date();
  return toDs(t.getFullYear(), t.getMonth(), t.getDate());
}

/**
 * DatePickerField — compact trigger + Portal calendar using site design tokens.
 * Selected day → var(--ac) / var(--ti)
 * Borders/surfaces → var(--s2) / var(--bd) / var(--t2) / var(--t3)
 */
function DatePickerField({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [viewYear, setViewYear] = useState(() => value ? +value.slice(0, 4) : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => value ? +value.slice(5, 7) - 1 : new Date().getMonth());
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const today = todayDs();

  useEffect(() => {
    if (value) {
      setViewYear(+value.slice(0, 4));
      setViewMonth(+value.slice(5, 7) - 1);
    }
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => {
      if (!triggerRef.current?.contains(e.target) && !dropdownRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isOpen]);

  const openCalendar = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 5, left: r.left });
    }
    setIsOpen(o => !o);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const jsFirstDay = new Date(viewYear, viewMonth, 1).getDay();
  const firstDayOffset = (jsFirstDay + 1) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonthYear = viewMonth === 0 ? viewYear - 1 : viewYear;
  const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
  const nextMonthYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;

  // Previous month trailing days
  const prevCells = Array.from({ length: firstDayOffset }, (_, i) => {
    const day = daysInPrevMonth - firstDayOffset + 1 + i;
    return {
      day,
      ds: toDs(prevMonthYear, prevMonthIdx, day),
      isCurrentMonth: false,
    };
  });

  // Current month days
  const currentCells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      day,
      ds: toDs(viewYear, viewMonth, day),
      isCurrentMonth: true,
    };
  });

  // Next month leading days (fill full grid)
  const totalSoFar = prevCells.length + currentCells.length;
  const targetTotal = totalSoFar <= 35 ? 35 : 42;
  const nextCellsCount = targetTotal - totalSoFar;
  const nextCells = Array.from({ length: nextCellsCount }, (_, i) => {
    const day = i + 1;
    return {
      day,
      ds: toDs(nextMonthYear, nextMonthIdx, day),
      isCurrentMonth: false,
    };
  });

  const allCells = [...prevCells, ...currentCells, ...nextCells];

  return (
    <div style={{ direction: 'ltr' }} className="shrink-0">
      {/* ── Compact trigger ── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openCalendar}
        className="h-8 flex items-center gap-1.5 px-2 text-[11px] rounded-lg cursor-pointer transition-colors"
        style={{
          background: 'var(--s2)',
          border: `1px solid ${isOpen ? '#52525b' : 'var(--bd)'}`,
          color: value ? 'var(--t1, #e4e4e7)' : 'var(--t3)',
          minWidth: '120px',
        }}
      >
        <Calendar
          size={12}
          className="shrink-0"
          style={{ color: value ? '#a1a1aa' : 'var(--t3)' }}
        />
        <span className="font-mono tracking-wider">
          {value || 'YYYY-MM-DD'}
        </span>
      </button>

      {/* ── Calendar via Portal (escapes overflow:hidden parents) ── */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            top: pos.top,
            left: pos.left,
            direction: 'rtl',
            background: 'var(--s2)',
            border: '1px solid var(--bd)',
          }}
          className="fixed z-[9999] w-64 rounded-xl shadow-2xl shadow-black/50 overflow-hidden select-none"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ borderBottom: '1px solid var(--bd)', background: 'var(--s1, var(--s2))' }}
          >
            <button
              type="button"
              onClick={prevMonth}
              title="الشهر السابق"
              className="w-6 h-6 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
              style={{ color: 'var(--t3)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bd)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <ChevronRight size={14} />
            </button>
            <span className="text-xs font-bold select-none" style={{ color: 'var(--t1, #e4e4e7)' }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              title="الشهر التالي"
              className="w-6 h-6 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
              style={{ color: 'var(--t3)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bd)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <ChevronLeft size={14} />
            </button>
          </div>

          {/* Day headers (Starts Saturday on Right -> Friday on Left) */}
          <div className="grid grid-cols-7 px-2 pt-2 pb-1">
            {DAY_HEADERS.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold py-1" style={{ color: 'var(--t3)' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0.5 px-2 pb-2">
            {allCells.map((cell) => {
              const isSel = cell.ds === value;
              const isTdy = cell.ds === today;
              return (
                <button
                  key={cell.ds}
                  type="button"
                  onClick={() => { onChange(cell.ds); setIsOpen(false); }}
                  className="h-7 w-full flex items-center justify-center rounded-lg text-[11px] font-medium cursor-pointer transition-colors"
                  style={
                    !cell.isCurrentMonth
                      ? (isSel
                          ? { background: '#27272a', color: '#f4f4f5', border: '1px solid #52525b', fontWeight: 700 }
                          : { color: 'var(--t3)', opacity: 0.35 })
                      : isSel
                      ? { background: '#27272a', color: '#f4f4f5', border: '1px solid #52525b', fontWeight: 700 }
                      : isTdy
                      ? { outline: '1px solid var(--bd)', color: 'var(--t1, #e4e4e7)', fontWeight: 700 }
                      : { color: 'var(--t2)' }
                  }
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--bd)'; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = isSel ? '#27272a' : 'transparent'; }}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 flex items-center justify-between" style={{ borderTop: '1px solid var(--bd)' }}>
            <button
              type="button"
              onClick={() => { onChange(today); setIsOpen(false); }}
              className="text-[11px] font-semibold cursor-pointer"
              style={{ color: 'var(--ac)' }}
            >
              اليوم
            </button>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(''); setIsOpen(false); }}
                className="text-[10px] cursor-pointer"
                style={{ color: 'var(--t3)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--t1, #ffffff)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
              >
                مسح
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function FilterDropdown({ label, value, onChange, options }) {
  return (
    <div className="relative flex items-center shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 pr-2.5 pl-6 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 appearance-none focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 cursor-pointer transition-colors"
        title={label}
      >
        <option value="all">{label}: الكل</option>
        {options.map((o) => (
          <option key={o.v} value={o.v}>{label}: {o.l}</option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 dark:text-zinc-500"
      />
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
  const { currency } = useCurrency();

  return (
    <div className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-transparent px-6 h-14 flex items-center justify-between gap-4 shrink-0 select-none">

      {/* ── 1. Right: Search Bar ── */}
      <div className="relative shrink-0 w-56 sm:w-64">
        <Search
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onChangeSearch(e.target.value)}
          placeholder="بحث برقم الطلب، العميل..."
          className="w-full h-9 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pr-9 pl-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors"
        />
      </div>

      {/* ── 2. Center: Date + Filters ── */}
      <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
        <DatePickerField value={date} onChange={onChangeDate} />
        <FilterDropdown label="الحالة" value={status} onChange={onChangeStatus} options={STATUS_OPTIONS} />
        <FilterDropdown label="النوع" value={type} onChange={onChangeType} options={TYPE_OPTIONS} />
        <FilterDropdown label="المصدر" value={source} onChange={onChangeSource} options={SOURCE_OPTIONS} />
      </div>

      {/* ── 3. Left: KPI Metrics Summary ── */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
          <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">{totalOrders}</span>
          <span className="text-zinc-500">طلب</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">{activeCount}</span>
          <span className="text-zinc-500">نشط</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="whitespace-nowrap flex items-center gap-1">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">
              {revenue % 1 === 0 ? revenue.toFixed(0) : revenue.toFixed(2)}
            </span>
            <span className="text-zinc-500">{currency || 'ج.م'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PosOrdersFilterBar;
