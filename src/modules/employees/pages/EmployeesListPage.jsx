import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useEmployeesQuery,
  useCreateEmployeeMutation,
} from '../hooks/useEmployees.js';
import { useRolesQuery } from '../../roles/hooks/useRoles.js';
import { DataTable } from '../../../shared/components/DataTable.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { EmployeeFormModal } from '../components/EmployeeFormModal.jsx';
import { UserPlus, Users, Eye, AlertTriangle } from 'lucide-react';

export const EmployeesListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageError, setPageError] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useEmployeesQuery({
    search,
    status: statusFilter || undefined,
    roleId: roleFilter || undefined,
    page,
    limit: 10,
  });
  const { data: rolesData } = useRolesQuery({ limit: 100 });

  const createMutation = useCreateEmployeeMutation();

  const employeesList = data?.items || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const roleOptions = (rolesData?.items || []).map((role) => ({
    value: role.id,
    label: role.name,
  }));

  const handleSaveEmployee = async (formData) => {
    setPageError(null);
    try {
      await createMutation.mutateAsync(formData);
      setIsFormModalOpen(false);
    } catch (err) {
      setPageError(err?.message || 'حدث خطأ أثناء إضافة الموظف.');
    }
  };

  const columns = [
    {
      header: 'الموظف',
      accessorKey: 'name',
      render: (row) => (
        <div className="flex flex-col">
          <span className={`font-bold ${row.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-txt-primary'}`}>
            {row.name}
          </span>
          <span className="text-[11px] text-txt-muted">{row.email}</span>
        </div>
      ),
    },
    {
      header: 'الهاتف',
      accessorKey: 'phone',
      render: (row) => (
        <span className={`dir-ltr inline-block ${row.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-txt-primary'}`}>
          {row.phone || '—'}
        </span>
      ),
    },
    {
      header: 'الدور الوظيفي',
      accessorKey: 'role',
      render: (row) => (
        <span className={`font-semibold ${row.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-brand-primary'}`}>
          {row.role?.name || row.role || '—'}
        </span>
      ),
    },
    {
      header: 'الإجراءات',
      key: 'actions',
      render: (row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate(`/settings/employees/${row.id}`)}
          icon={Eye}
          className="text-txt-primary hover:text-brand-primary hover:bg-bg-surface-elevated"
          title="عرض تفاصيل الموظف"
        >
          التفاصيل
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-primary" />
            <span>إدارة الموظفين الحسابية</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            إدارة أطقم العمل وتوزيع الأدوار والصلاحيات
          </p>
        </div>

        <PermissionGate permission="employees.manage">
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => setIsFormModalOpen(true)}
          >
            إضافة موظف جديد
          </Button>
        </PermissionGate>
      </div>

      {pageError && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-status-danger-bg text-status-danger border border-status-danger/30 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{pageError}</span>
        </div>
      )}

      {/* Filter Options */}
      <DataTable
        columns={columns}
        data={employeesList}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="ابحث باسم الموظف، البريد، أو التليفون..."
        emptyTitle="لم يتم العثور على موظفين"
        emptyDescription="لم يتم إضافة أي موظف بهذه البيانات حتى الآن."
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          onPageChange: setPage,
        }}
        filters={
          <>
            <div className="w-44">
              <Select
                placeholder="جميع الحالات"
                options={[
                  { value: '', label: 'جميع الحالات' },
                  { value: 'ACTIVE', label: 'نشط' },
                  { value: 'INACTIVE', label: 'معطل' },
                  { value: 'SUSPENDED', label: 'موقوف' },
                ]}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-44">
              <Select
                placeholder="جميع الأدوار"
                options={[{ value: '', label: 'جميع الأدوار' }, ...roleOptions]}
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </>
        }
      />

      {/* Create Employee Modal */}
      <EmployeeFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSaveEmployee}
        isLoading={createMutation.isPending}
      />
    </div>
  );
};