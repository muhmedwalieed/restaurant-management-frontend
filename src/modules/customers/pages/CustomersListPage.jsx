import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomersQuery } from '../hooks/useCustomers.js';
import { DataTable } from '../../../shared/components/DataTable.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { CustomerFormModal } from '../components/CustomerFormModal.jsx';
import { Users, Plus, ChevronLeft } from 'lucide-react';

export const CustomersListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: customersResponse, isLoading, isError, error, refetch } = useCustomersQuery({
    page,
    limit: 20,
    q: searchQuery || undefined,
  });

  const customers = customersResponse?.items || [];

  const columns = [
    {
      header: 'العميل',
      accessorKey: 'name',
      render: (row) => (
        <div className="flex flex-col text-xs leading-tight">
          <span className="font-bold text-txt-primary truncate">{row.name}</span>
          {row.notes && <span className="text-[11px] text-txt-muted truncate max-w-[200px]">{row.notes}</span>}
        </div>
      ),
    },
    {
      header: 'الهاتف',
      accessorKey: 'phone',
      width: '150px',
      render: (row) => (
        <div className="flex flex-col text-xs leading-tight">
          <span className="font-mono font-semibold text-txt-primary dir-ltr inline-block">
            {row.phone || '—'}
          </span>
          {(row.phones?.length || 0) > 1 && (
            <span className="text-[11px] text-txt-muted">
              {row.phones.length} أرقام
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'إجمالي الطلبات',
      accessorKey: '_count',
      width: '120px',
      render: (row) => (
        <span className="font-mono font-bold tabular-nums text-txt-primary text-xs">
          {row._count?.orders ?? 0}
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
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2.5">
            <Users className="w-5 h-5 text-brand-primary" />
            <span>إدارة العملاء</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            قاعدة بيانات العملاء، العناوين، وسجل الطلبات
          </p>
        </div>

        <PermissionGate permission="customers.create">
          <Button
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-slate-950 hover:bg-slate-200 font-bold border-0 shadow-sm text-xs"
          >
            إضافة عميل
          </Button>
        </PermissionGate>
      </div>

      {}
      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        onRowClick={(row) => navigate(`/customers/${row.id}`)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="ابحث بالاسم أو الهاتف..."
        emptyTitle="لا توجد عملاء مطابقين"
        emptyDescription="لم يتم إضافة أي عميل بهذه البيانات بعد."
        pagination={{
          page,
          totalPages: customersResponse?.pagination?.totalPages || 1,
          total: customersResponse?.pagination?.total,
          onPageChange: setPage,
        }}
        mobileCardRender={(c) => (
          <div
            onClick={() => navigate(`/customers/${c.id}`)}
            className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-3 cursor-pointer hover:border-brand-primary/40 active:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm text-txt-primary">{c.name}</span>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-bg-surface-elevated text-txt-muted border border-border-subtle">
                {c._count?.orders ?? 0} طلبات
              </span>
            </div>
            <div className="text-xs text-txt-muted space-y-1">
              {c.phone && (
                <p className="dir-ltr text-right">
                  الهاتف: <strong className="text-txt-primary font-mono">{c.phone}</strong>
                </p>
              )}
              {(c.phones?.length || 0) > 1 && (
                <p className="text-right">
                  أرقام إضافية: <strong className="text-txt-primary">{c.phones.length - 1}</strong>
                </p>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-default text-xs text-txt-muted">
              <span>عرض ملف العميل</span>
              <ChevronLeft className="w-4 h-4 text-brand-primary" />
            </div>
          </div>
        )}
      />

      <CustomerFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
