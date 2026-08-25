import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllOrdersQuery } from '../hooks/useOrders.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { DataTable } from '../../../shared/components/DataTable.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { OrderFormModal } from '../components/OrderFormModal.jsx';
import {
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
  ORDER_SOURCE_LABELS,
  orderStatusPill,
} from '../schemas/order.schema.js';
import { ShoppingCart, Plus, ReceiptText, ChevronLeft, Building2, Layers, CheckCircle2, Clock, XCircle, Store } from 'lucide-react';

const TYPE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'جميع الأنواع' },
  ...Object.entries(ORDER_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

const SOURCE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'جميع المصادر' },
  ...Object.entries(ORDER_SOURCE_LABELS).map(([value, label]) => ({ value, label })),
];

const STATUS_TAB_GROUPS = [
  { id: 'ALL', label: 'الكل', icon: Layers },
  { id: 'ACTIVE', label: 'قيد التنفيذ', icon: Clock, statuses: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'] },
  { id: 'DELIVERED', label: 'تم التسليم', icon: CheckCircle2, statuses: ['DELIVERED'] },
  { id: 'CANCELLED', label: 'ملغي', icon: XCircle, statuses: ['CANCELLED'] },
];

export const OrdersListPage = () => {
  const navigate = useNavigate();
  const { activeBranchId, activeBranch, branches } = useBranch();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Map active status tab to API query status filter parameter
  const apiStatusParam = useMemo(() => {
    if (activeStatusTab === 'ALL' || activeStatusTab === 'ACTIVE') return undefined;
    return activeStatusTab;
  }, [activeStatusTab]);

  const { data: ordersResponse, isLoading, isError, error, refetch } = useAllOrdersQuery({
    page,
    limit: 20,
    status: apiStatusParam,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    source: sourceFilter === 'ALL' ? undefined : sourceFilter,
    branchId: branchFilter === 'ALL' ? undefined : branchFilter,
  });

  const ordersList = useMemo(() => ordersResponse?.items || [], [ordersResponse]);

  // Client-side filtering for active tab sub-statuses & search query
  const filteredOrders = useMemo(() => {
    return ordersList.filter((o) => {
      // 1. Status Tab filter
      if (activeStatusTab === 'ACTIVE') {
        const activeStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'];
        if (!activeStatuses.includes(o.status)) return false;
      }

      // 2. Search query match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        String(o.orderNumber || '').includes(q) ||
        o.customer?.name?.toLowerCase().includes(q) ||
        o.customer?.phone?.toLowerCase().includes(q) ||
        (o.table && o.table.label?.toLowerCase().includes(q))
      );
    });
  }, [ordersList, activeStatusTab, searchQuery]);

  // Calculate live tab counts for fast visual feedback
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

  // Determine if branch column should be displayed (Hide by default when viewing single active branch)
  const showBranchColumn = branchFilter === 'ALL' && branches.length > 1;

  const baseColumns = [
    {
      header: 'رقم الطلب',
      accessorKey: 'orderNumber',
      width: '110px',
      render: (row) => (
        <span className={`font-mono font-bold text-xs ${row.status === 'CANCELLED' ? 'text-txt-muted' : 'text-txt-primary'}`}>
          #{row.orderNumber}
        </span>
      ),
    },
    ...(showBranchColumn
      ? [
          {
            header: 'الفرع',
            key: 'branch',
            width: '150px',
            render: (row) => (
              <span className="flex items-center gap-1.5 text-xs text-txt-muted min-w-0">
                <Building2 className="w-4 h-4 shrink-0 text-brand-primary/70" />
                <span className="truncate">{row.branch?.name || 'غير محدد'}</span>
              </span>
            ),
          },
        ]
      : []),
    {
      header: 'الحالة',
      accessorKey: 'status',
      width: '130px',
      render: (row) => (
        <StatusPill status={orderStatusPill(row.status)}>{ORDER_STATUS_LABELS[row.status] || row.status}</StatusPill>
      ),
    },
    {
      header: 'النوع',
      accessorKey: 'type',
      width: '110px',
      render: (row) => (
        <span className="font-semibold text-xs text-txt-primary">
          {ORDER_TYPE_LABELS[row.type] || row.type}
        </span>
      ),
    },
    {
      header: 'المصدر',
      accessorKey: 'source',
      width: '100px',
      render: (row) => (
        <span className="text-xs text-txt-muted">
          {ORDER_SOURCE_LABELS[row.source] || row.source}
        </span>
      ),
    },
    {
      header: 'العميل',
      key: 'customer',
      render: (row) => (
        <div className="flex flex-col text-xs leading-tight">
          <span className="font-medium text-txt-primary truncate">
            {row.customer?.name || 'عميل مباشر'}
          </span>
          {row.customer?.phone && (
            <span className="text-[11px] text-txt-muted font-mono" dir="ltr">
              {row.customer.phone}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'الطاولة',
      key: 'table',
      width: '110px',
      render: (row) => (
        <span className="text-xs text-txt-muted">
          {row.table ? `طاولة ${row.table.label}` : '—'}
        </span>
      ),
    },
    {
      header: 'وقت الطلب',
      key: 'createdAt',
      width: '110px',
      render: (row) => (
        <span className="text-xs text-txt-muted font-mono">
          {row.createdAt ? new Date(row.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '—'}
        </span>
      ),
    },
    {
      header: 'الإجمالي',
      accessorKey: 'total',
      align: 'left',
      width: '120px',
      render: (row) => (
        <span className="font-mono font-bold tabular-nums text-txt-primary text-xs">
          {Number(row.total || 0).toFixed(2)} <span className="text-[10px] text-txt-muted font-sans">EGP</span>
        </span>
      ),
    },
    {
      header: '',
      key: 'actions',
      align: 'left',
      width: '36px',
      render: () => (
        <div className="flex justify-end text-slate-500 group-hover:text-slate-200">
          <ChevronLeft className="w-4 h-4 transition-colors" />
        </div>
      ),
    },
  ];

  const branchOptions = [
    { value: 'ALL', label: 'جميع الفروع' },
    ...branches.map((b) => ({ value: b.id, label: b.name })),
  ];

  return (
    <div className="space-y-4">
      {/* 1. Page Header: Streamlined Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border-default/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-txt-primary leading-tight">
              إدارة الطلبات
            </h1>
            <div className="flex items-center gap-2 text-xs text-txt-muted mt-0.5">
              <span className="flex items-center gap-1 font-medium text-slate-300">
                <Store className="w-3.5 h-3.5 text-brand-primary" />
                {activeBranch?.name || 'جميع الفروع'}
              </span>
              <span>•</span>
              <span>إجمالي الطلبات المسجلة ({ordersResponse?.pagination?.total || ordersList.length})</span>
            </div>
          </div>
        </div>

        {/* Action Button: Primary New Order */}
        <PermissionGate permission="orders.create">
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold h-8"
            >
              طلب جديد
            </Button>
          </div>
        </PermissionGate>
      </div>

      {/* 2. 1-Click Status Quick Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {STATUS_TAB_GROUPS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeStatusTab === tab.id;
          const count = tabCounts[tab.id] || 0;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveStatusTab(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-brand-primary text-slate-950 shadow-sm'
                  : 'bg-bg-surface text-txt-muted border border-border-default hover:text-txt-primary hover:border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-white/[0.08] text-txt-muted'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Orders DataTable with Streamlined Filter Row */}
      <DataTable
        columns={baseColumns}
        data={filteredOrders}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        onRowClick={(row) => navigate(`/orders/${row.id}`)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="ابحث برقم الطلب، العميل، أو الطاولة..."
        emptyTitle="لا توجد طلبات"
        emptyDescription="لم يتم العثور على طلبات بالخيارات المحددة."
        pagination={{
          page,
          totalPages: ordersResponse?.pagination?.totalPages || 1,
          total: ordersResponse?.pagination?.total,
          onPageChange: setPage,
        }}
        filters={
          <div className="flex items-center gap-2 flex-wrap">
            {branches.length > 1 && (
              <div className="w-44">
                <Select
                  options={branchOptions}
                  value={branchFilter}
                  onChange={(e) => {
                    setPage(1);
                    setBranchFilter(e.target.value);
                  }}
                  aria-label="فلترة بالفرع"
                />
              </div>
            )}
            <div className="w-36">
              <Select
                options={TYPE_FILTER_OPTIONS}
                value={typeFilter}
                onChange={(e) => {
                  setPage(1);
                  setTypeFilter(e.target.value);
                }}
                aria-label="فلترة بالنوع"
              />
            </div>
            <div className="w-36">
              <Select
                options={SOURCE_FILTER_OPTIONS}
                value={sourceFilter}
                onChange={(e) => {
                  setPage(1);
                  setSourceFilter(e.target.value);
                }}
                aria-label="فلترة بالمصدر"
              />
            </div>
          </div>
        }
        mobileCardRender={(o) => (
          <div
            onClick={() => navigate(`/orders/${o.id}`)}
            className="bg-bg-surface border border-border-default rounded-lg p-3 space-y-2.5 cursor-pointer hover:border-brand-primary/40 active:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ReceiptText className={`w-4 h-4 shrink-0 ${o.status === 'CANCELLED' ? 'text-txt-muted' : 'text-brand-primary'}`} />
                <span className={`font-mono font-bold text-xs ${o.status === 'CANCELLED' ? 'text-txt-muted' : 'text-txt-primary'}`}>
                  #{o.orderNumber}
                </span>
              </div>
              <StatusPill status={orderStatusPill(o.status)}>{ORDER_STATUS_LABELS[o.status] || o.status}</StatusPill>
            </div>

            <div className="text-xs text-txt-muted space-y-1">
              {showBranchColumn && (
                <p className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 shrink-0 text-brand-primary" />
                  <strong className="text-txt-primary">{o.branch?.name || 'غير محدد'}</strong>
                </p>
              )}
              <p>
                النوع: <strong className="text-txt-primary">{ORDER_TYPE_LABELS[o.type] || o.type}</strong>
                {' · '}
                المصدر: <strong className="text-txt-primary">{ORDER_SOURCE_LABELS[o.source] || o.source}</strong>
              </p>
              <p>
                العميل: <strong className="text-txt-primary">{o.customer?.name || 'عميل مباشر'}{o.customer?.phone ? ` (${o.customer.phone})` : ''}</strong>
              </p>
              <p>
                الطاولة: <strong className="text-txt-primary">{o.table ? `طاولة ${o.table.label}` : '—'}</strong>
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border-default">
              <span className="text-xs font-bold text-brand-primary tabular-nums font-mono">
                {Number(o.total || 0).toFixed(2)} EGP
              </span>
              <span className="text-xs text-txt-muted flex items-center gap-1">
                التفاصيل
                <ChevronLeft className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}
      />

      {/* New Order Modal */}
      <OrderFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} branchId={activeBranchId} />
    </div>
  );
};