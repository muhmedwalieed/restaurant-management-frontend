import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranchesQuery, useCreateBranchMutation } from '../hooks/useBranches.js';
import { DataTable } from '../../../shared/components/DataTable.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { BranchFormModal } from '../components/BranchFormModal.jsx';
import { Building2, Plus, Settings, Phone, MapPin, AlertTriangle } from 'lucide-react';

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'جميع الحالات' },
  { value: 'ACTIVE', label: 'نشط فقط' },
  { value: 'INACTIVE', label: 'معطل فقط' },
];

export const BranchesListPage = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const queryParams = selectedStatus !== 'ALL' ? { status: selectedStatus } : {};
  const { data: branchesResponse, isLoading, isError, error, refetch } = useBranchesQuery(queryParams);
  const createMutation = useCreateBranchMutation();

  const branchesList = branchesResponse?.items || branchesResponse || [];

  const filteredBranches = branchesList.filter((branch) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const nameMatch = branch.name?.toLowerCase().includes(query);
    const codeMatch = branch.code?.toLowerCase().includes(query);
    return nameMatch || codeMatch;
  });

  const runBranchMutation = async (fn) => {
    setErrorMessage(null);
    try {
      await fn();
      return true;
    } catch (err) {
      setErrorMessage(err?.message || 'حدث خطأ أثناء تنفيذ العملية.');
      return false;
    }
  };

  const handleCreateBranch = async (data) => {
    const ok = await runBranchMutation(() => createMutation.mutateAsync(data));
    if (ok) setIsCreateModalOpen(false);
  };

  const columns = [
    {
      header: 'كود الفرع',
      accessorKey: 'code',
      width: '100px',
      render: (row) => (
        <span
          className={`font-mono font-bold ${
            row.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-txt-primary'
          }`}
        >
          {row.code}
        </span>
      ),
    },
    {
      header: 'اسم الفرع',
      accessorKey: 'name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Building2
            className={`w-4 h-4 shrink-0 ${
              row.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-brand-primary'
            }`}
          />
          <span className={`font-bold ${row.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-txt-primary'}`}>
            {row.name}
          </span>
        </div>
      ),
    },
    {
      header: 'الهاتف',
      accessorKey: 'phone',
      render: (row) => (
        <span
          className={`dir-ltr inline-block ${
            row.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-txt-primary'
          }`}
        >
          {row.phone ? `${row.phone}` : 'غير محدد'}
        </span>
      ),
    },
    {
      header: 'العنوان',
      accessorKey: 'address',
      render: (row) => (
        <span
          className={`truncate max-w-[200px] inline-block ${
            row.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-txt-primary'
          }`}
        >
          {row.address || 'غير محدد'}
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
          onClick={() => navigate(`/settings/branches/${row.id}`)}
          icon={Settings}
          className="text-txt-primary hover:text-brand-primary hover:bg-bg-surface-elevated"
          title="الإعدادات ومواعيد العمل"
        >
          الإعدادات
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-primary" />
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

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-status-danger-bg text-status-danger border border-status-danger/30 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {}
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
            <div className="flex items-center gap-2">
              <Building2
                className={`w-4 h-4 shrink-0 ${
                  branch.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-brand-primary'
                }`}
              />
              <span
                className={`font-bold text-sm ${
                  branch.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-txt-primary'
                }`}
              >
                {branch.name}
              </span>
            </div>

            <div className="text-xs text-txt-muted space-y-1">
              <p className="font-mono">الكود: {branch.code}</p>
              {branch.phone && (
                <p className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-txt-muted" />
                  <span>{branch.phone}</span>
                </p>
              )}
              {branch.address && (
                <p className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-txt-muted" />
                  <span>{branch.address}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-border-subtle">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate(`/settings/branches/${branch.id}`)}
                icon={Settings}
                className="text-txt-primary hover:text-brand-primary"
                title="الإعدادات ومواعيد العمل"
              >
                الإعدادات
              </Button>
            </div>
          </div>
        )}
      />

      {}
      <BranchFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBranch}
        isLoading={createMutation.isPending}
      />
    </div>
  );
};
