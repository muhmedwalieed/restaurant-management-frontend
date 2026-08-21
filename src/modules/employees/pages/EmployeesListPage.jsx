import { useState } from 'react';
import {
  useEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useChangePasswordMutation,
  useChangeRoleMutation,
  useDeleteEmployeeMutation,
  useForceLogoutEmployeeMutation,
} from '../hooks/useEmployees.js';
import { useRolesQuery } from '../../roles/hooks/useRoles.js';
import { DataTable } from '../../../shared/components/DataTable.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { Modal } from '../../../shared/components/Modal.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { EmployeeFormModal } from '../components/EmployeeFormModal.jsx';
import { ChangePasswordModal } from '../components/ChangePasswordModal.jsx';
import { ChangeRoleModal } from '../components/ChangeRoleModal.jsx';
import { UserPlus, Edit3, Key, Shield, Trash2, Users, LogOut, AlertTriangle } from 'lucide-react';

const STATUS_LABELS = {
  ACTIVE: { label: 'نشط', tone: 'success' },
  INACTIVE: { label: 'معطل', tone: 'neutral' },
  SUSPENDED: { label: 'موقوف', tone: 'danger' },
};

export const EmployeesListPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageError, setPageError] = useState(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedEmployeeForForm, setSelectedEmployeeForForm] = useState(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedEmployeeForPassword, setSelectedEmployeeForPassword] = useState(null);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedEmployeeForRole, setSelectedEmployeeForRole] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const [isForceLogoutModalOpen, setIsForceLogoutModalOpen] = useState(false);
  const [employeeToForceLogout, setEmployeeToForceLogout] = useState(null);

  // React Query Hooks
  const { data, isLoading, isError, error, refetch } = useEmployeesQuery({
    search,
    status: statusFilter || undefined,
    roleId: roleFilter || undefined,
    page,
    limit: 10,
  });
  const { data: rolesData } = useRolesQuery({ limit: 100 });

  const createMutation = useCreateEmployeeMutation();
  const updateMutation = useUpdateEmployeeMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const changeRoleMutation = useChangeRoleMutation();
  const deleteMutation = useDeleteEmployeeMutation();
  const forceLogoutMutation = useForceLogoutEmployeeMutation();

  const employeesList = data?.items || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const roleOptions = (rolesData?.items || []).map((role) => ({
    value: role.id,
    label: role.name,
  }));

  const runMutation = async (fn) => {
    setPageError(null);
    try {
      await fn();
      return true;
    } catch (err) {
      setPageError(err?.message || 'حدث خطأ أثناء تنفيذ العملية.');
      return false;
    }
  };

  const handleSaveEmployee = async (formData) => {
    const ok = await runMutation(() =>
      selectedEmployeeForForm
        ? updateMutation.mutateAsync({ id: selectedEmployeeForForm.id, payload: formData })
        : createMutation.mutateAsync(formData)
    );
    if (ok) {
      setIsFormModalOpen(false);
      setSelectedEmployeeForForm(null);
    }
  };

  const handleSavePassword = async (payload) => {
    if (!selectedEmployeeForPassword) return;
    const ok = await runMutation(() =>
      changePasswordMutation.mutateAsync({ id: selectedEmployeeForPassword.id, payload })
    );
    if (ok) {
      setIsPasswordModalOpen(false);
      setSelectedEmployeeForPassword(null);
    }
  };

  const handleSaveRole = async (payload) => {
    if (!selectedEmployeeForRole) return;
    const ok = await runMutation(() =>
      changeRoleMutation.mutateAsync({ id: selectedEmployeeForRole.id, payload })
    );
    if (ok) {
      setIsRoleModalOpen(false);
      setSelectedEmployeeForRole(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    const ok = await runMutation(() => deleteMutation.mutateAsync(employeeToDelete.id));
    if (ok) {
      setIsDeleteModalOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleConfirmForceLogout = async () => {
    if (!employeeToForceLogout) return;
    const ok = await runMutation(() => forceLogoutMutation.mutateAsync(employeeToForceLogout.id));
    if (ok) {
      setIsForceLogoutModalOpen(false);
      setEmployeeToForceLogout(null);
    }
  };

  // Table Columns Setup
  const columns = [
    {
      header: 'الموظف',
      accessorKey: 'name',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-txt-primary">{row.name}</span>
          <span className="text-[11px] text-txt-muted">{row.email}</span>
        </div>
      ),
    },
    {
      header: 'الهاتف',
      accessorKey: 'phone',
      render: (row) => row.phone || '—',
    },
    {
      header: 'الدور الوظيفي',
      accessorKey: 'role',
      render: (row) => (
        <span className="font-semibold text-brand-primary">{row.role?.name || row.role || '—'}</span>
      ),
    },
    {
      header: 'الحالة',
      accessorKey: 'status',
      render: (row) => {
        const status = STATUS_LABELS[row.status] || STATUS_LABELS.INACTIVE;
        return <StatusPill status={status.tone}>{status.label}</StatusPill>;
      },
    },
    {
      header: 'الإجراءات',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <PermissionGate permission="employees.manage">
            <button
              onClick={() => {
                setSelectedEmployeeForForm(row);
                setIsFormModalOpen(true);
              }}
              className="p-1.5 text-txt-muted hover:text-brand-primary hover:bg-bg-surface-elevated rounded transition-colors"
              title="تعديل البيانات"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </PermissionGate>

          <PermissionGate permission="employees.manage">
            <button
              onClick={() => {
                setSelectedEmployeeForPassword(row);
                setIsPasswordModalOpen(true);
              }}
              className="p-1.5 text-txt-muted hover:text-status-warning hover:bg-bg-surface-elevated rounded transition-colors"
              title="تغيير كلمة المرور"
            >
              <Key className="w-4 h-4" />
            </button>
          </PermissionGate>

          <PermissionGate permission="employees.manage_roles">
            <button
              onClick={() => {
                setSelectedEmployeeForRole(row);
                setIsRoleModalOpen(true);
              }}
              className="p-1.5 text-txt-muted hover:text-status-info hover:bg-bg-surface-elevated rounded transition-colors"
              title="تغيير الدور"
            >
              <Shield className="w-4 h-4" />
            </button>
          </PermissionGate>

          <PermissionGate permission="employees.manage_roles">
            <button
              onClick={() => {
                setEmployeeToForceLogout(row);
                setIsForceLogoutModalOpen(true);
              }}
              className="p-1.5 text-txt-muted hover:text-status-warning hover:bg-bg-surface-elevated rounded transition-colors"
              title="إغلاق جميع جلسات الموظف"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </PermissionGate>

          <PermissionGate permission="employees.manage">
            <button
              onClick={() => {
                setEmployeeToDelete(row);
                setIsDeleteModalOpen(true);
              }}
              className="p-1.5 text-txt-muted hover:text-status-danger hover:bg-status-danger-bg rounded transition-colors"
              title="حذف الموظف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </PermissionGate>
        </div>
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
            إدارة أطقم العمل، توزيع الأدوار والصلاحيات، وإعادة تعيين كلمات المرور
          </p>
        </div>

        <PermissionGate permission="employees.manage">
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => {
              setSelectedEmployeeForForm(null);
              setIsFormModalOpen(true);
            }}
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

      {/* Create / Edit Employee Modal */}
      <EmployeeFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialValues={selectedEmployeeForForm}
        onSubmit={handleSaveEmployee}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        employee={selectedEmployeeForPassword}
        onSubmit={handleSavePassword}
        isLoading={changePasswordMutation.isPending}
      />

      {/* Change Role Modal */}
      <ChangeRoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        employee={selectedEmployeeForRole}
        onSubmit={handleSaveRole}
        isLoading={changeRoleMutation.isPending}
      />

      {/* Soft-Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="تأكيد حذف الموظف"
        size="sm"
      >
        <div className="space-y-4 text-right">
          <p className="text-xs text-txt-muted">
            هل أنت أصلًا متأكد من تعطيل/حذف الحساب المخصص لـ{' '}
            <span className="font-bold text-txt-primary">{employeeToDelete?.name}</span>؟
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={handleConfirmDelete}
            >
              تعطيل / حذف الحساب
            </Button>
          </div>
        </div>
      </Modal>

      {/* Force Logout Confirmation Modal */}
      <Modal
        isOpen={isForceLogoutModalOpen}
        onClose={() => setIsForceLogoutModalOpen(false)}
        title="إغلاق جلسات الموظف"
        size="sm"
      >
        <div className="space-y-4 text-right">
          <p className="text-xs text-txt-muted">
            سيتم تسجيل خروج فوري من جميع الأجهزة النشطة للحساب{' '}
            <span className="font-bold text-txt-primary">{employeeToForceLogout?.name}</span>. هل أنت متأكد؟
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button variant="outline" size="sm" onClick={() => setIsForceLogoutModalOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={forceLogoutMutation.isPending}
              onClick={handleConfirmForceLogout}
            >
              إغلاق الجلسات
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};