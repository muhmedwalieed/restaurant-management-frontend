import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomersQuery } from '../hooks/useCustomers.js';
import { DataTable } from '../../../shared/components/DataTable.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { CustomerFormModal } from '../components/CustomerFormModal.jsx';
import { Users, Plus, Eye, Phone, Mail } from 'lucide-react';

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
        <div className="flex flex-col">
          <span className="font-bold text-txt-primary">{row.name}</span>
          {row.notes && <span className="text-[11px] text-txt-muted truncate max-w-[200px]">{row.notes}</span>}
        </div>
      ),
    },
    {
      header: 'الهاتف',
      accessorKey: 'phone',
      render: (row) => (
        <span className="dir-ltr inline-block font-semibold text-txt-primary">
          <Phone className="w-3.5 h-3.5 inline text-txt-muted ml-1" />
          {row.phone || '—'}
        </span>
      ),
    },
    {
      header: 'البريد',
      accessorKey: 'email',
      render: (row) => (
        <span className="text-txt-muted">
          <Mail className="w-3.5 h-3.5 inline text-txt-muted ml-1" />
          {row.email || '—'}
        </span>
      ),
    },
    {
      header: 'الطلبات',
      accessorKey: '_count',
      width: '90px',
      render: (row) => <span className="font-bold text-txt-primary">{row._count?.orders ?? 0}</span>,
    },
    {
      header: 'التفاصيل',
      key: 'actions',
      render: (row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate(`/customers/${row.id}`)}
          icon={Eye}
          className="text-txt-primary hover:text-brand-primary hover:bg-bg-surface-elevated"
          title="عرض تفاصيل العميل"
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
            <Users className="w-6 h-6 text-brand-primary" />
            <span>إدارة العملاء (CRM)</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            قاعدة بيانات العملاء، العناوين، وتاريخ طلباتهم
          </p>
        </div>

        <PermissionGate permission="customers.create">
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            إضافة عميل
          </Button>
        </PermissionGate>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="ابحث بالاسم أو الهاتف أو البريد..."
        emptyTitle="لا توجد عملاء مطابقين"
        emptyDescription="لم يتم إضافة أي عميل بهذه البيانات بعد."
        pagination={{
          page,
          totalPages: customersResponse?.pagination?.totalPages || 1,
          total: customersResponse?.pagination?.total,
          onPageChange: setPage,
        }}
        mobileCardRender={(c) => (
          <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm text-txt-primary">{c.name}</span>
              <span className="text-xs text-txt-muted">{c._count?.orders ?? 0} طلب</span>
            </div>
            {c.phone && (
              <p className="text-xs text-txt-muted dir-ltr flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {c.phone}
              </p>
            )}
            {c.email && (
              <p className="text-xs text-txt-muted dir-ltr flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {c.email}
              </p>
            )}
            <div className="flex items-center justify-end pt-2 border-t border-border-default">
              <Button size="sm" variant="ghost" onClick={() => navigate(`/customers/${c.id}`)} icon={Eye} className="text-txt-primary hover:text-brand-primary">
                التفاصيل
              </Button>
            </div>
          </div>
        )}
      />

      <CustomerFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};