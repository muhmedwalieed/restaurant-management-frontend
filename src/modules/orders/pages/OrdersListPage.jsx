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
import { ShoppingCart, Plus, Eye, ReceiptText } from 'lucide-react';

const STATUS_FILTER_OPTIONS = [{ value: 'ALL', label: 'جميع الحالات' }, ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }))];

export const OrdersListPage = () => {
  const navigate = useNavigate();
  const { activeBranchId, activeBranch } = useBranch();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: ordersResponse, isLoading, isError, error, refetch } = useOrdersQuery(activeBranchId, {
    page,
    limit: 20,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  const ordersList = ordersResponse?.items || [];

  const filteredOrders = ordersList.filter((o) => {
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
      width: '110px',
      render: (row) => (
        <span className={`font-mono font-bold ${row.status === 'CANCELLED' ? 'text-txt-muted' : 'text-txt-primary'}`}>
          #{row.orderNumber}
        </span>
      ),
    },
    {
      header: 'الحالة',
      accessorKey: 'status',
      render: (row) => (
        <StatusPill status={orderStatusPill(row.status)}>{ORDER_STATUS_LABELS[row.status] || row.status}</StatusPill>
      ),
    },
    {
      header: 'النوع',
      accessorKey: 'type',
      render: (row) => <span className="font-semibold text-txt-primary">{ORDER_TYPE_LABELS[row.type] || row.type}</span>,
    },
    {
      header: 'العميل / الترابيزة',
      key: 'customer',
      render: (row) => (
        <span className="text-txt-muted">
          {row.customer?.phone || row.customer?.name || (row.table ? `ترابيزة ${row.table.label}` : '—')}
        </span>
      ),
    },
    {
      header: 'الإجمالي',
      accessorKey: 'total',
      width: '110px',
      render: (row) => <span className="font-bold text-txt-primary">{Number(row.total || 0).toFixed(2)} EGP</span>,
    },
    {
      header: 'التفاصيل',
      key: 'actions',
      render: (row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate(`/orders/${row.id}`)}
          icon={Eye}
          className="text-txt-primary hover:text-brand-primary hover:bg-bg-surface-elevated"
          title="عرض تفاصيل الطلب"
        >
          التفاصيل
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-brand-primary" />
            <span>إدارة الطلبات</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            إنشاء ومتابعة الطلبات وتحديث حالتها وجدولها الزمني
          </p>
        </div>

        <PermissionGate permission="orders.create">
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            طلب جديد
          </Button>
        </PermissionGate>
      </div>

      {activeBranch && (
        <div className="flex items-center gap-2 text-xs text-txt-muted">
          <span className="font-semibold text-txt-primary">الفرع الحالي:</span>
          <span>{activeBranch.name}</span>
          <span className="font-mono text-[10px]">({activeBranch.code})</span>
        </div>
      )}

      {!activeBranchId ? (
        <EmptyState
          title="لا يوجد فرع نشط"
          description="اختر فرعًا لعرض وإدارة طلباته."
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
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="ابحث برقم الطلب أو العميل أو الترابيزة..."
          emptyTitle="لا توجد طلبات مطابقة"
          emptyDescription="لم يتم إنشاء أي طلب بعد."
          pagination={{
            page,
            totalPages: ordersResponse?.pagination?.totalPages || 1,
            total: ordersResponse?.pagination?.total,
            onPageChange: setPage,
          }}
          filters={
            <div className="w-48">
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
          }
          mobileCardRender={(o) => (
            <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-3">
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
                  العميل/الترابيزة: <strong className="text-txt-primary">{o.customer?.phone || o.customer?.name || (o.table ? `ترابيزة ${o.table.label}` : '—')}</strong>
                </p>
                <p>
                  المصدر: <strong className="text-txt-primary">{ORDER_SOURCE_LABELS[o.source] || o.source}</strong>
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border-default">
                <span className="text-sm font-bold text-brand-primary">{Number(o.total || 0).toFixed(2)} EGP</span>
                <Button size="sm" variant="ghost" onClick={() => navigate(`/orders/${o.id}`)} icon={Eye} className="text-txt-primary hover:text-brand-primary">
                  التفاصيل
                </Button>
              </div>
            </div>
          )}
        />
      )}

      <OrderFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} branchId={activeBranchId} />
    </div>
  );
};