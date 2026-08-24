import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrdersQuery } from '../hooks/useOrders.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { DataTable } from '../../../shared/components/DataTable.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { OrderFormModal } from '../components/OrderFormModal.jsx';
import {
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
  ORDER_SOURCE_LABELS,
  orderStatusPill,
} from '../schemas/order.schema.js';
import { ShoppingCart, Plus, ReceiptText, PhoneCall, ChevronLeft } from 'lucide-react';

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'جميع الحالات' },
  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const TYPE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'جميع الأنواع' },
  ...Object.entries(ORDER_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

export const OrdersListPage = () => {
  const navigate = useNavigate();
  const { activeBranchId } = useBranch();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: ordersResponse, isLoading, isError, error, refetch } = useOrdersQuery(activeBranchId, {
    page,
    limit: 20,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
  });

  const ordersList = ordersResponse?.items || [];

  const filteredOrders = ordersList.filter((o) => {
    if (typeFilter !== 'ALL' && o.type !== typeFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(o.orderNumber || '').includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.phone?.toLowerCase().includes(q) ||
      (o.table && o.table.label?.toLowerCase().includes(q))
    );
  });

  const columns = [
    {
      header: 'رقم الطلب',
      accessorKey: 'orderNumber',
      width: '120px',
      render: (row) => (
        <span className={`font-mono font-bold text-xs ${row.status === 'CANCELLED' ? 'text-txt-muted' : 'text-txt-primary'}`}>
          #{row.orderNumber}
        </span>
      ),
    },
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
      header: 'العميل / الطاولة',
      key: 'customer',
      render: (row) => (
        <div className="flex flex-col text-xs leading-tight">
          <span className="font-medium text-txt-primary truncate">
            {row.customer?.name || (row.table ? `طاولة ${row.table.label}` : 'عميل مباشر')}
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
      header: 'وقت الطلب',
      key: 'createdAt',
      width: '120px',
      render: (row) => (
        <span className="text-xs text-txt-muted">
          {row.createdAt ? new Date(row.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '—'}
        </span>
      ),
    },
    {
      header: 'الإجمالي',
      accessorKey: 'total',
      align: 'left',
      width: '130px',
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

  return (
    <div className="space-y-5">
      {/* 1. Page Header: Title on Right, Grouped Minimal Actions on Left */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-brand-primary" />
            <span>إدارة الطلبات</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            إنشاء ومتابعة الطلبات وتحديث حالتها وجدولها الزمني
          </p>
        </div>

        {/* Action Buttons Group: Secondary Phone Order + Primary New Order */}
        <PermissionGate permission="orders.create">
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={PhoneCall}
              onClick={() => navigate('/phone-order')}
              className="text-xs"
            >
              طلب هاتف
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold"
            >
              طلب جديد
            </Button>
          </div>
        </PermissionGate>
      </div>

      {/* 2. Orders Content Table */}
      {!activeBranchId ? (
        <EmptyState
          title="لا يوجد فرع نشط"
          description="اختر فرعًا من أعلى الشاشة لعرض وإدارة طلباته."
          icon={ShoppingCart}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredOrders}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
          onRowClick={(row) => navigate(`/orders/${row.id}`)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="ابحث برقم الطلب، العميل، أو الطاولة..."
          emptyTitle="لا توجد طلبات مطابقة"
          emptyDescription="لم يتم العثور على طلبات بالخيارات المحددة."
          pagination={{
            page,
            totalPages: ordersResponse?.pagination?.totalPages || 1,
            total: ordersResponse?.pagination?.total,
            onPageChange: setPage,
          }}
          filters={
            <div className="flex items-center gap-2">
              <div className="w-40">
                <Select
                  options={STATUS_FILTER_OPTIONS}
                  value={statusFilter}
                  onChange={(e) => {
                    setPage(1);
                    setStatusFilter(e.target.value);
                  }}
                  aria-label="فلترة بالحالة"
                />
              </div>
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
            </div>
          }
          mobileCardRender={(o) => (
            <div
              onClick={() => navigate(`/orders/${o.id}`)}
              className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-3 cursor-pointer hover:border-brand-primary/40 active:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ReceiptText className={`w-4 h-4 shrink-0 ${o.status === 'CANCELLED' ? 'text-txt-muted' : 'text-brand-primary'}`} />
                  <span className={`font-mono font-bold text-sm ${o.status === 'CANCELLED' ? 'text-txt-muted' : 'text-txt-primary'}`}>
                    #{o.orderNumber}
                  </span>
                </div>
                <StatusPill status={orderStatusPill(o.status)}>{ORDER_STATUS_LABELS[o.status] || o.status}</StatusPill>
              </div>

              <div className="text-xs text-txt-muted space-y-1">
                <p>
                  النوع: <strong className="text-txt-primary">{ORDER_TYPE_LABELS[o.type] || o.type}</strong>
                </p>
                <p>
                  العميل/الطاولة: <strong className="text-txt-primary">{o.customer?.phone || o.customer?.name || (o.table ? `طاولة ${o.table.label}` : 'غير محدد')}</strong>
                </p>
                <p>
                  المصدر: <strong className="text-txt-primary">{ORDER_SOURCE_LABELS[o.source] || o.source}</strong>
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border-default">
                <span className="text-sm font-bold text-brand-primary tabular-nums font-mono">
                  {Number(o.total || 0).toFixed(2)} EGP
                </span>
                <span className="text-xs text-txt-muted flex items-center gap-1 group-hover:text-brand-primary">
                  التفاصيل
                  <ChevronLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          )}
        />
      )}

      {/* New Order Modal */}
      <OrderFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} branchId={activeBranchId} />
    </div>
  );
};