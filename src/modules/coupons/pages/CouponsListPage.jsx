import { useState } from 'react';
import { TicketPercent, Plus, Pencil, Trash2 } from 'lucide-react';
import { useCouponsQuery, useDeleteCouponMutation } from '../hooks/useCoupons.js';
import { DataTable } from '../../../shared/components/DataTable.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { CouponFormModal } from '../components/CouponFormModal.jsx';

const formatMoney = (v) => `${Number(v || 0).toLocaleString('ar-EG')} ج.م`;

export const CouponsListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState(null);

  const { data: couponsResponse, isLoading, isError, error, refetch } = useCouponsQuery({
    page,
    limit: 20,
    q: searchQuery || undefined,
    type: typeFilter || undefined,
  });
  const deleteMutation = useDeleteCouponMutation();

  const coupons = couponsResponse?.items || [];

  const openCreate = () => {
    setCouponToEdit(null);
    setIsModalOpen(true);
  };
  const openEdit = (coupon) => {
    setCouponToEdit(coupon);
    setIsModalOpen(true);
  };

  const columns = [
    {
      header: 'الكود',
      accessorKey: 'code',
      render: (row) => (
        <span className="dir-ltr inline-block font-bold text-txt-primary px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary">
          {row.code}
        </span>
      ),
    },
    {
      header: 'الخصم',
      accessorKey: 'value',
      render: (row) => (
        <span className="font-semibold text-txt-primary">
          {row.type === 'PERCENTAGE' ? `${Number(row.value)}%` : formatMoney(row.value)}
        </span>
      ),
    },
    {
      header: 'حد أدنى',
      accessorKey: 'minSubtotal',
      render: (row) => <span className="text-txt-muted">{Number(row.minSubtotal) > 0 ? formatMoney(row.minSubtotal) : '—'}</span>,
    },
    {
      header: 'الاستخدام',
      accessorKey: 'timesUsed',
      render: (row) => (
        <span className="text-txt-muted">
          {row.timesUsed}
          {row.usageLimit ? ` / ${row.usageLimit}` : ''}
        </span>
      ),
    },
    {
      header: 'الحالة',
      accessorKey: 'isActive',
      render: (row) => (
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full ${
            row.isActive ? 'bg-status-success/10 text-status-success font-bold' : 'bg-bg-surface-elevated text-txt-muted'
          }`}
        >
          {row.isActive ? 'مفعّل' : 'معطّل'}
        </span>
      ),
    },
    {
      header: 'إجراءات',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(row)} title="تعديل">
            تعديل
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={Trash2}
            className="text-status-danger hover:text-status-danger"
            title="حذف الكوبون"
            onClick={() => {
              if (window.confirm(`متأكد إنك عايز تعطّل كوبون ${row.code}؟`)) deleteMutation.mutate(row.id);
            }}
          >
            حذف
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <TicketPercent className="w-6 h-6 text-brand-primary" />
            <span>كوبونات الخصم</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">كوبونات النسبة المئوية والمبلغ الثابت بتطبق تلقائيًا على الأوردرات</p>
        </div>

        <PermissionGate permission="coupons.manage">
          <Button variant="primary" size="sm" icon={Plus} onClick={openCreate}>
            إضافة كوبون
          </Button>
        </PermissionGate>
      </div>

      <DataTable
        columns={columns}
        data={coupons}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        searchQuery={searchQuery}
        onSearchChange={(v) => {
          setSearchQuery(v);
          setPage(1);
        }}
        searchPlaceholder="ابحث بكود الكوبون..."
        filters={
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="bg-bg-base border border-border-default rounded-md text-xs px-3 py-2 text-txt-primary focus-visible:outline-none focus-visible:border-brand-primary"
            >
              <option value="">كل الأنواع</option>
              <option value="PERCENTAGE">نسبة مئوية</option>
              <option value="FIXED">مبلغ ثابت</option>
            </select>
          </div>
        }
        emptyTitle="لا توجد كوبونات"
        emptyDescription="ضيف أول كوبون خصم عشان تقدر تقدم عروض لعملائك."
        pagination={{
          page,
          totalPages: couponsResponse?.pagination?.totalPages || 1,
          total: couponsResponse?.pagination?.total,
          onPageChange: setPage,
        }}
      />

      <CouponFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} couponToEdit={couponToEdit} />
    </div>
  );
};

export default CouponsListPage;