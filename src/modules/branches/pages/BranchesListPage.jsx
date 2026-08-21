import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} from '../hooks/useBranches.js';
import { DataTable } from '../../../shared/components/DataTable.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { BranchFormModal } from '../components/BranchFormModal.jsx';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Settings,
  ShieldCheck,
  Phone,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'جميع الحالات' },
  { value: 'ACTIVE', label: 'نشط فقط' },
  { value: 'INACTIVE', label: 'معطل فقط' },
  { value: 'SUSPENDED', label: 'موقوف فقط' },
];

export const BranchesListPage = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [deletingBranch, setDeletingBranch] = useState(null);

  const queryParams = selectedStatus !== 'ALL' ? { status: selectedStatus } : {};
  const { data: branchesResponse, isLoading, isError, error, refetch } = useBranchesQuery(queryParams);
  const createMutation = useCreateBranchMutation();
  const updateMutation = useUpdateBranchMutation();
  const deleteMutation = useDeleteBranchMutation();

  const branchesList = branchesResponse?.items || branchesResponse || [];

  // Client-side Search Filtering
  const filteredBranches = branchesList.filter((branch) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const nameMatch = branch.name?.toLowerCase().includes(query);
    const codeMatch = branch.code?.toLowerCase().includes(query);
    return nameMatch || codeMatch;
  });

  const handleCreateBranch = async (data) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdateBranch = async (data) => {
    await updateMutation.mutateAsync({ id: editingBranch.id, payload: data });
    setEditingBranch(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBranch || deletingBranch.isMain) return;
    await deleteMutation.mutateAsync(deletingBranch.id);
    setDeletingBranch(null);
  };

  const columns = [
    {
      header: 'كود الفرع',
      accessorKey: 'code',
      width: '100px',
      render: (row) => <span className="font-mono font-bold text-txt-primary">{row.code}</span>,
    },
    {
      header: 'اسم الفرع',
      accessorKey: 'name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-brand-primary shrink-0" />
          <span className="font-bold text-txt-primary">{row.name}</span>
          {row.isMain && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              الفرع الرئيسي
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'الهاتف',
      accessorKey: 'phone',
      render: (row) => (
        <span className="text-txt-muted dir-ltr inline-block">
          {row.phone ? `${row.phone}` : '—'}
        </span>
      ),
    },
    {
      header: 'العنوان',
      accessorKey: 'address',
      render: (row) => (
        <span className="text-txt-muted truncate max-w-[200px] inline-block">
          {row.address || '—'}
        </span>
      ),
    },
    {
      header: 'الحالة',
      accessorKey: 'status',
      render: (row) => {
        const isAct = row.status === 'ACTIVE';
        return (
          <StatusPill status={isAct ? 'success' : 'neutral'}>
            {isAct ? 'نشط' : row.status === 'SUSPENDED' ? 'موقوف' : 'معطل'}
          </StatusPill>
        );
      },
    },
    {
      header: 'الإجراءات',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/settings/branches/${row.id}`)}
            icon={Settings}
            title="إعدادات الفرع"
          >
            الإعدادات
          </Button>

          <PermissionGate permission="branches.manage">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingBranch(row)}
              icon={Edit}
              title="تعديل البيانات"
            />

            {/* Defensive check: Disable / Hide delete for isMain branch */}
            {!row.isMain && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDeletingBranch(row)}
                icon={Trash2}
                className="text-status-danger hover:bg-status-danger-bg"
                title="تعطيل الفرع (Soft Delete)"
              />
            )}
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
            <Building2 className="w-6 h-6 text-brand-primary" />
            <span>إدارة الفروع والمواقع</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            إضافة وتعديل بيانات الفروع ومواعيد العمل وإعدادات التشغيل
          </p>
        </div>

        <PermissionGate permission="branches.manage">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            إضافة فرع جديد
          </Button>
        </PermissionGate>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={filteredBranches}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="ابحث باسم الفرع أو الكود..."
        emptyTitle="لا توجد فروع"
        emptyDescription="لم يتم إضافة أي فروع تطابق الفلترة المحددة."
        filters={
          <div className="w-40">
            <Select
              options={STATUS_FILTER_OPTIONS}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="فلترة بالحالة"
            />
          </div>
        }
        mobileCardRender={(branch) => (
          <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-primary" />
                <span className="font-bold text-txt-primary text-sm">{branch.name}</span>
              </div>
              <StatusPill status={branch.status === 'ACTIVE' ? 'success' : 'neutral'}>
                {branch.status === 'ACTIVE' ? 'نشط' : 'معطل'}
              </StatusPill>
            </div>

            <div className="text-xs text-txt-muted space-y-1">
              <p className="font-mono">الكود: {branch.code}</p>
              {branch.phone && (
                <p className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-txt-muted" />
                  <span>{branch.phone}</span>
                </p>
              )}
              {branch.address && (
                <p className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-txt-muted" />
                  <span>{branch.address}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/settings/branches/${branch.id}`)}
                icon={Settings}
              >
                الإعدادات
              </Button>
              <PermissionGate permission="branches.manage">
                <Button size="sm" variant="ghost" onClick={() => setEditingBranch(branch)} icon={Edit} />
                {!branch.isMain && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeletingBranch(branch)}
                    icon={Trash2}
                    className="text-status-danger"
                  />
                )}
              </PermissionGate>
            </div>
          </div>
        )}
      />

      {/* Create Branch Modal */}
      <BranchFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBranch}
        isLoading={createMutation.isPending}
      />

      {/* Edit Branch Modal */}
      <BranchFormModal
        isOpen={Boolean(editingBranch)}
        onClose={() => setEditingBranch(null)}
        initialValues={editingBranch}
        onSubmit={handleUpdateBranch}
        isLoading={updateMutation.isPending}
      />

      {/* Soft Delete Confirm Modal */}
      <Modal
        isOpen={Boolean(deletingBranch)}
        onClose={() => setDeletingBranch(null)}
        title="تأكيد تعطيل الفرع"
        description="سيتم تغيير حالة الفرع إلى معطل (INACTIVE). يمكن إعادة تفعيله لاحقاً."
      >
        <div className="space-y-4 text-right">
          <div className="flex items-center gap-3 p-3 bg-status-danger-bg border border-status-danger/20 rounded-md text-status-danger text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>هل أنت تأكد من تعطيل فرع ({deletingBranch?.name})؟</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeletingBranch(null)}>
              إلغاء
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={handleDeleteConfirm}
              className="bg-status-danger hover:bg-status-danger/90 text-white"
            >
              تعطيل الفرع
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
