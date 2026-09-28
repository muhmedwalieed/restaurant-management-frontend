import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllOrdersQuery } from '../hooks/useOrders.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { DataTable } from '../../../shared/components/DataTable.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { OrderFormModal } from '../components/OrderFormModal.jsx';
import { OrdersStatusTabs } from '../components/list/OrdersStatusTabs.jsx';
import { OrdersFilterBar } from '../components/list/OrdersFilterBar.jsx';
import {
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
  ORDER_SOURCE_LABELS,
  orderStatusPill,
} from '../schemas/order.schema.js';
import { ShoppingCart, ReceiptText, ChevronLeft, Building2 } from 'lucide-react';

export const OrdersListPage = () => {
  const navigate = useNavigate();
  const { activeBranchId, branches } = useBranch();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const filteredOrders = useMemo(() => {
    return ordersList.filter((o) => {
      if (activeStatusTab === 'ACTIVE') {
        const activeStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'];
        if (!activeStatuses.includes(o.status)) return false;
      }

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
      header: 'العميل / الطاولة',
      key: 'destination',
      render: (row) => {
        if (row.table) {
          return (
            <span className="font-bold text-xs text-txt-primary flex items-center gap-1">
              طاولة {row.table.label}
            </span>
          );
        }
        if (row.customer) {
          return (
            <div className="text-xs">
              <p className="font-bold text-txt-primary">{row.customer.name}</p>
              <p className="text-[11px] text-txt-muted font-mono" dir="ltr">{row.customer.phone}</p>
            </div>
          );
        }
        return <span className="text-xs text-txt-muted">—</span>;
      },
    },
    {
      header: 'المبلغ الإجمالي',
      accessorKey: 'total',
      width: '120px',
      render: (row) => (
        <span className="font-mono font-bold text-xs text-txt-primary">
          {Number(row.total || 0).toFixed(2)} EGP
        </span>
      ),
    },
    {
      header: 'التاريخ والوقت',
      accessorKey: 'createdAt',
      width: '150px',
      render: (row) => {
        const d = new Date(row.createdAt);
        return (
          <span className="text-xs text-txt-muted font-mono" dir="ltr">
            {d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })} - {d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </span>
        );
      },
    },
    {
      header: '',
      key: 'actions',
      width: '50px',
      render: () => (
        <span className="text-txt-muted group-hover:text-txt-primary transition-colors flex justify-end">
          <ChevronLeft className="w-4 h-4" />
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-brand-primary" />
            <span>سجل الطلبات والمبيعات</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
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

      {/* Status Tabs */}
      <OrdersStatusTabs
        activeStatusTab={activeStatusTab}
        onTabChange={(tab) => { setPage(1); setActiveStatusTab(tab); }}
        tabCounts={tabCounts}
      />

      {/* Filter Bar */}
      <OrdersFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeChange={(v) => { setPage(1); setTypeFilter(v); }}
        sourceFilter={sourceFilter}
        onSourceChange={(v) => { setPage(1); setSourceFilter(v); }}
        branchFilter={branchFilter}
        onBranchChange={(v) => { setPage(1); setBranchFilter(v); }}
        branches={branches}
      />

      {/* Orders Table */}
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
          total: ordersResponse?.meta?.totalItems ?? filteredOrders.length,
          totalPages: ordersResponse?.meta?.totalPages || 1,
          onPageChange: setPage,
        }}
        emptyMessage="لم يتم العثور على أي طلبات تطابق معايير الفلترة الحالية."
      />

      {/* Modal */}
      <OrderFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultBranchId={activeBranchId}
      />
    </div>
  );
};
