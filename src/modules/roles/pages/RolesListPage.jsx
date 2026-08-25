import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useRolesQuery,
  useDeleteRoleMutation,
} from '../hooks/useRoles.js';
import { DataTable } from '../../../shared/components/DataTable.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { Modal } from '../../../shared/components/Modal.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { ShieldCheck, Plus, Edit3, Trash2, AlertTriangle } from 'lucide-react';

export const RolesListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [pageError, setPageError] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  const { data, isLoading, isError, error, refetch } = useRolesQuery({ search, limit: 100 });
  const deleteMutation = useDeleteRoleMutation();

  const rolesList = data?.items || (Array.isArray(data) ? data : []);
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    setPageError(null);
    try {
      await deleteMutation.mutateAsync(roleToDelete.id);
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    } catch (err) {
      setPageError(err?.message || 'حدث خطأ أثناء تنفيذ الحذف.');
    }
  };

  const columns = [
    {
      header: 'اسم الدور الوظيفي',
      accessorKey: 'name',
      render: (row) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-txt-primary">{row.name}</span>
            {row.isSystem && (
              <StatusPill status="info" className="text-xs py-0 px-2">
                دور نظام
              </StatusPill>
            )}
          </div>
          <span className="text-xs text-txt-muted mt-1">{row.description || 'بدون وصف'}</span>
        </div>
      ),
    },
    {
      header: 'عدد الصلاحيات الممنوحة',
      accessorKey: 'permissions',
      render: (row) => {
        const perms = row.permissions || [];
        if (row.isSystem || row.name === 'owner') {
          return (
            <StatusPill status="success" className="text-xs py-0.5 px-2.5 font-bold">
              وصول كامل (Super Admin)
            </StatusPill>
          );
        }
        return (
          <span className="text-xs font-semibold text-txt-primary">
            {perms.length} صلاحيات محددة
          </span>
        );
      },
    },
    {
      header: 'الإجراءات',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <PermissionGate permission="employees.manage_roles">
            {!row.isSystem ? (
              <button
                onClick={() => navigate(`/settings/roles/${row.id}/edit`)}
                className="p-1.5 text-txt-muted hover:text-brand-primary hover:bg-bg-surface-elevated rounded transition-colors"
                title="تعديل الصلاحيات"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            ) : (
              <span
                className="p-1.5 text-txt-muted/40 cursor-not-allowed rounded"
                title="أدوار النظام لا يمكن تعديلها"
              >
                <Edit3 className="w-4 h-4" />
              </span>
            )}
          </PermissionGate>

          {!row.isSystem && (
            <PermissionGate permission="employees.manage_roles">
              <button
                onClick={() => {
                  setRoleToDelete(row);
                  setIsDeleteModalOpen(true);
                }}
                className="p-1.5 text-txt-muted hover:text-status-danger hover:bg-status-danger-bg rounded transition-colors"
                title="حذف الدور"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </PermissionGate>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-primary" />
            <span>إدارة الأدوار والصلاحيات</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            تعريف المسميات الوظيفية وتحديد مصفوفة الصلاحيات المتاحة للمجموعات
          </p>
        </div>

        <PermissionGate permission="employees.manage_roles">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/settings/roles/new')}
          >
            إنشاء دور جديد
          </Button>
        </PermissionGate>
      </div>

      {pageError && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-status-danger-bg text-status-danger border border-status-danger/30 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{pageError}</span>
        </div>
      )}

      {}
      <DataTable
        columns={columns}
        data={rolesList}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="ابحث باسم الدور الوظيفي..."
        emptyTitle="لا توجد أدوار وظيفية"
        emptyDescription="لم يتم العثور على أي نتائج تطابق البحث."
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          onPageChange: () => {},
        }}
      />

      {}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="تأكيد حذف الدور الوظيفي"
        size="sm"
      >
        <div className="space-y-4 text-right">
          <p className="text-xs text-txt-muted">
            هل أنت متأكد من حذف الدور الوظيفي{' '}
            <span className="font-bold text-txt-primary">{roleToDelete?.name}</span>؟ لن تتاح الصلاحيات المرتبطة به مجددًا.
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
              حذف الدور
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
