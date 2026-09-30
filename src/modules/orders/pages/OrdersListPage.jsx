import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAllOrdersQuery } from '../hooks/useOrders.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { DataTable } from '../../../shared/components/DataTable.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { OrderFormModal } from '../components/OrderFormModal.jsx';
import { OrdersStatusTabs } from '../components/list/OrdersStatusTabs.jsx';
import { OrdersFilterBar } from '../components/list/OrdersFilterBar.jsx';
import { ReceiptPrintTemplate } from '../components/ReceiptPrintTemplate.jsx';
import {
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
  ORDER_SOURCE_LABELS,
  orderStatusPill,
  orderSourcePill,
} from '../schemas/order.schema.js';
import {
  ShoppingCart,
  ReceiptText,
  Building2,
  Printer,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Activity,
  DollarSign,
  Package,
  Calendar,
} from 'lucide-react';

const normalizeCalendarDate = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MONTH_NAMES_OL = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
const DAY_HEADERS_OL = ['سبت', 'حد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];

function toDateStrOL(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
function getTodayStrOL() {
  const t = new Date();
  return toDateStrOL(t.getFullYear(), t.getMonth(), t.getDate());
}

function DatePickerField({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [viewYear, setViewYear] = useState(() => value ? +value.slice(0, 4) : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => value ? +value.slice(5, 7) - 1 : new Date().getMonth());
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const today = getTodayStrOL();

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
      ds: toDateStrOL(prevMonthYear, prevMonthIdx, day),
      isCurrentMonth: false,
    };
  });

  // Current month days
  const currentCells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      day,
      ds: toDateStrOL(viewYear, viewMonth, day),
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
      ds: toDateStrOL(nextMonthYear, nextMonthIdx, day),
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

      {/* ── Calendar via Portal ── */}
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
              {MONTH_NAMES_OL[viewMonth]} {viewYear}
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

          {/* Day headers */}
          <div className="grid grid-cols-7 px-2 pt-2 pb-1">
            {DAY_HEADERS_OL.map(d => (
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



export const OrdersListPage = () => {
  const navigate = useNavigate();
  const { activeBranchId, branches } = useBranch();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);

  const apiStatusParam = useMemo(() => {
    if (activeStatusTab === 'ALL' || activeStatusTab === 'ACTIVE') return undefined;
    return activeStatusTab;
  }, [activeStatusTab]);

  const {
    data: ordersResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useAllOrdersQuery({
    page,
    limit: 50,
    status: apiStatusParam,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    source: sourceFilter === 'ALL' ? undefined : sourceFilter,
    branchId: branchFilter === 'ALL' ? undefined : branchFilter,
  });

  // Real backend orders only (No mock data)
  const ordersList = useMemo(() => {
    return ordersResponse?.items || [];
  }, [ordersResponse]);

  // Robust client-side filter with normalized date comparison
  const filteredOrders = useMemo(() => {
    return ordersList.filter((o) => {
      // 1. Status Filter
      if (activeStatusTab === 'ACTIVE') {
        const activeStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'];
        if (!activeStatuses.includes(o.status)) return false;
      } else if (activeStatusTab !== 'ALL') {
        if (o.status !== activeStatusTab) return false;
      }

      // 2. Date Filter (Normalized calendar date YYYY-MM-DD)
      if (dateFilter) {
        const orderDateStr = normalizeCalendarDate(o.createdAt || o.orderDate);
        if (orderDateStr !== dateFilter) return false;
      }

      // 3. Type Filter
      if (typeFilter !== 'ALL' && o.type !== typeFilter) {
        return false;
      }

      // 4. Source Filter
      if (sourceFilter !== 'ALL' && o.source !== sourceFilter) {
        return false;
      }

      // 5. Branch Filter
      if (branchFilter !== 'ALL' && o.branchId && o.branchId !== branchFilter && o.branch?.id !== branchFilter) {
        return false;
      }

      // 6. Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        String(o.orderNumber || '').toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q) ||
        o.customer?.phone?.toLowerCase().includes(q) ||
        (o.table && (o.table.label?.toLowerCase().includes(q) || o.table.number?.toString().includes(q))) ||
        o.customerName?.toLowerCase().includes(q)
      );
    });
  }, [ordersList, activeStatusTab, dateFilter, typeFilter, sourceFilter, branchFilter, searchQuery]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { ALL: ordersList.length, ACTIVE: 0, DELIVERED: 0, CANCELLED: 0 };
    ordersList.forEach((o) => {
      if (['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)) {
        counts.ACTIVE += 1;
      } else if (o.status === 'DELIVERED') {
        counts.DELIVERED += 1;
      } else if (o.status === 'CANCELLED') {
        counts.CANCELLED += 1;
      }
    });
    return counts;
  }, [ordersList]);

  // KPI Metrics Calculation
  const metrics = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const activeOrders = filteredOrders.filter((o) =>
      ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)
    ).length;
    const totalCollected = filteredOrders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => {
        const val = Number(o.total || o.totalAmount || 0);
        if (o.paymentStatus === 'PAID') return sum + val;
        if (o.paymentStatus === 'PARTIAL') return sum + Number(o.amountPaid || 0);
        return sum;
      }, 0);

    return { totalOrders, activeOrders, totalCollected };
  }, [filteredOrders]);

  // Reset all active filters
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setDateFilter('');
    setActiveStatusTab('ALL');
    setTypeFilter('ALL');
    setSourceFilter('ALL');
    setBranchFilter('ALL');
    setPage(1);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      searchQuery.trim() ||
      dateFilter ||
      activeStatusTab !== 'ALL' ||
      typeFilter !== 'ALL' ||
      sourceFilter !== 'ALL' ||
      branchFilter !== 'ALL'
    );
  }, [searchQuery, dateFilter, activeStatusTab, typeFilter, sourceFilter, branchFilter]);

  const showBranchColumn = branchFilter === 'ALL' && branches.length > 1;

  const baseColumns = [
    {
      header: 'رقم الطلب',
      accessorKey: 'orderNumber',
      width: '110px',
      render: (row) => (
        <span className={`font-mono font-bold text-xs ${row.status === 'CANCELLED' ? 'text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
          #{row.orderNumber || row.id?.slice(0, 6)}
        </span>
      ),
    },
    ...(showBranchColumn
      ? [
          {
            header: 'الفرع',
            key: 'branch',
            width: '140px',
            render: (row) => (
              <span className="flex items-center gap-1.5 text-xs text-zinc-500 min-w-0">
                <Building2 className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                <span className="truncate">{row.branch?.name || 'غير محدد'}</span>
              </span>
            ),
          },
        ]
      : []),
    {
      header: 'العميل / الطاولة',
      key: 'destination',
      render: (row) => {
        if (row.table) {
          return (
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
              طاولة {row.table.label || row.table.number}
            </span>
          );
        }
        if (row.customer) {
          return (
            <div className="text-xs leading-tight">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{row.customer.name}</p>
              <p className="text-xs text-zinc-400 font-normal font-mono mt-0.5" dir="ltr">{row.customer.phone}</p>
            </div>
          );
        }
        return <span className="text-sm font-semibold text-zinc-500">{row.customerName || 'عميل مباشر'}</span>;
      },
    },
    {
      header: 'النوع والمصدر',
      key: 'typeSource',
      width: '140px',
      render: (row) => (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-xs text-zinc-800 dark:text-zinc-200">
            {ORDER_TYPE_LABELS[row.type] || row.type}
          </span>
          <span className="text-xs text-zinc-400 flex items-center gap-1">
            {ORDER_SOURCE_LABELS[row.source] || row.source}
          </span>
        </div>
      ),
    },
    {
      header: 'عدد الأصناف',
      key: 'itemCount',
      width: '100px',
      render: (row) => {
        const count = row.items?.reduce((s, it) => s + (it.qty || it.quantity || 1), 0) || row.items?.length || 1;
        return (
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
            <Package size={13} className="text-zinc-400" />
            <span>{count} صنف</span>
          </span>
        );
      },
    },
    {
      header: 'المبلغ الإجمالي',
      accessorKey: 'total',
      width: '140px',
      render: (row) => (
        <div className="flex flex-col items-start leading-tight">
          <div className="flex items-baseline gap-1 text-zinc-900 dark:text-zinc-100">
            <span className="text-base font-bold tracking-tight">
              {Number(row.total || row.totalAmount || 0).toFixed(2)}
            </span>
            <span className="text-xs text-zinc-400 font-normal">ج.م</span>
          </div>
          <span className="text-xs text-zinc-400 mt-0.5">
            {new Date(row.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ),
    },
    {
      header: 'الحالة',
      accessorKey: 'status',
      width: '120px',
      render: (row) => (
        <StatusPill status={orderStatusPill(row.status)}>
          {ORDER_STATUS_LABELS[row.status] || row.status}
        </StatusPill>
      ),
    },
    {
      header: 'التاريخ والوقت',
      accessorKey: 'createdAt',
      width: '140px',
      render: (row) => {
        const d = new Date(row.createdAt);
        const dateStr = normalizeCalendarDate(row.createdAt);
        const timeStr = d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        return (
          <div className="flex flex-col leading-tight font-mono text-xs" dir="ltr">
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">{dateStr}</span>
            <span className="text-xs text-zinc-400 mt-0.5">{timeStr}</span>
          </div>
        );
      },
    },
    {
      header: 'إجراءات',
      key: 'actions',
      width: '100px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => navigate(`/orders/${row.id}`)}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="عرض التفاصيل"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setReceiptOrder(row)}
            className="p-2 text-zinc-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors cursor-pointer"
            title="طباعة الفاتورة"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 py-4">
      {/* Header Title & New Order Button */}
      <div className="px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-brand-primary" />
            <span>سجل الطلبات والمبيعات</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            متابعة وإدارة كل الطلبات الواردة من الصالة، الدليفري، استلام الفرع، أو المتجر الإلكتروني.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>طلب جديد</span>
        </button>
      </div>

      {/* ORDERS TOOLBAR - FULL-BLEED (breaks out of ContentContainer padding) */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 border-b border-zinc-200 dark:border-zinc-800 bg-transparent px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* 1. RIGHT SECTION: Search Bar */}
        <div className="relative w-56 sm:w-64 md:w-72 shrink-0">
          <input
            type="text"
            placeholder="بحث برقم الطلب، العميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pr-9 pl-3 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500"
          />
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        </div>

        {/* 2. CENTER SECTION: Compact Filters (Centered) */}
        <div className="flex-1 flex items-center justify-center gap-2 min-w-0 overflow-x-auto no-scrollbar py-1">
          {/* Date Picker — custom overlay component */}
          <DatePickerField value={dateFilter || ''} onChange={setDateFilter} />

          {/* Status Select */}
          <select
            value={activeStatusTab}
            onChange={(e) => {
              setPage(1);
              setActiveStatusTab(e.target.value);
            }}
            className="h-9 px-2.5 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 cursor-pointer"
          >
            <option value="ALL">الحالة: الكل</option>
            <option value="ACTIVE">نشط</option>
            <option value="PENDING">انتظار</option>
            <option value="CONFIRMED">مؤكد</option>
            <option value="PREPARING">قيد التنفيذ</option>
            <option value="READY">جاهز</option>
            <option value="OUT_FOR_DELIVERY">في الطريق</option>
            <option value="DELIVERED">تم التسليم</option>
            <option value="CANCELLED">ملغي</option>
          </select>

          {/* Type Select */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setPage(1);
              setTypeFilter(e.target.value);
            }}
            className="h-9 px-2.5 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 cursor-pointer"
          >
            <option value="ALL">النوع: الكل</option>
            <option value="DINE_IN">صالة</option>
            <option value="TAKEAWAY">استلام</option>
            <option value="DELIVERY">توصيل</option>
          </select>

          {/* Source Select */}
          <select
            value={sourceFilter}
            onChange={(e) => {
              setPage(1);
              setSourceFilter(e.target.value);
            }}
            className="h-9 px-2.5 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 cursor-pointer"
          >
            <option value="ALL">المصدر: الكل</option>
            <option value="POS">الكاشير</option>
            <option value="PHONE">هاتف</option>
            <option value="WHATSAPP">واتساب</option>
            <option value="ONLINE">أونلاين</option>
            <option value="QR">طاولة (QR)</option>
          </select>
        </div>

        {/* 3. LEFT SECTION: Summary Metrics */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">{metrics.totalOrders}</span>
            <span className="text-zinc-500">طلب</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">{metrics.activeOrders}</span>
            <span className="text-zinc-500">نشط</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">{metrics.totalCollected.toFixed(0)}</span>
            <span className="text-zinc-500">ج.م</span>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div>
        <DataTable
          columns={baseColumns}
          data={filteredOrders}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
          onRowClick={(order) => navigate(`/orders/${order.id}`)}
          pagination={{
            page,
            limit: 20,
            total: filteredOrders.length,
            totalPages: Math.ceil(filteredOrders.length / 20) || 1,
            onPageChange: setPage,
          }}
          emptyTitle="لا توجد طلبات"
          emptyDescription="لم يتم العثور على أي طلبات تطابق معايير الفلترة المحددة."
          emptyActionLabel="إعادة ضبط الفلاتر / عرض كل الطلبات"
          onEmptyAction={handleResetFilters}
        />
      </div>

      {/* Create Order Modal */}
      <OrderFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultBranchId={activeBranchId}
      />

      {/* Receipt Print Preview Modal */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-brand-primary" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  معاينة وطباعة الفاتورة #{receiptOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content (Receipt Preview) */}
            <div className="p-4 overflow-y-auto flex-1 custom-scrollbar bg-zinc-50 dark:bg-black/30">
              <ReceiptPrintTemplate order={receiptOrder} isPreview={true} />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-white dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="btn btn-secondary text-xs px-4 py-2"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>طباعة الفاتورة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersListPage;
