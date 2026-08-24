import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTablesQuery } from '../hooks/useTables.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { DataTable } from '../../../shared/components/DataTable.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { TableFormModal } from '../components/TableFormModal.jsx';
import { TABLE_STATUS_LABELS } from '../schemas/table.schema.js';
import { Grid3x3, Plus, Users, ArrowUpRight } from 'lucide-react';

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'جميع الحالات' },
  { value: 'AVAILABLE', label: 'متاحة' },
  { value: 'OCCUPIED', label: 'مشغولة' },
  { value: 'RESERVED', label: 'محجوزة' },
  { value: 'MAINTENANCE', label: 'صيانة' },
];

const statusPill = (status) => {
  const map = {
    AVAILABLE: 'success',
    OCCUPIED: 'danger',
    RESERVED: 'warning',
    MAINTENANCE: 'neutral',
  };
  return map[status] || 'neutral';
};

export const TablesListPage = () => {
  const navigate = useNavigate();
  const { activeBranchId } = useBranch();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryParams = {
    page,
    limit: 20,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  };
  const { data: tablesResponse, isLoading, isError, error, refetch } = useTablesQuery(activeBranchId, queryParams);

  const tablesList = tablesResponse?.items || [];

  // Client-side search by label
  const filteredTables = tablesList.filter((t) => {
    if (!searchQuery.trim()) return true;
    return t.label?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const columns = [
    {
      header: 'الطاولة',
      accessorKey: 'label',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Grid3x3 className={`w-4 h-4 shrink-0 ${row.status === 'MAINTENANCE' ? 'text-txt-muted' : 'text-brand-primary'}`} />
          <span className={`font-mono font-bold ${row.status === 'MAINTENANCE' ? 'text-txt-muted' : 'text-txt-primary'}`}>
            {row.label}
          </span>
        </div>
      ),
    },
    {
      header: 'السعة',
      accessorKey: 'capacity',
      width: '120px',
      render: (row) => (
        <span className={`flex items-center gap-1.5 ${row.status === 'MAINTENANCE' ? 'text-txt-muted' : 'text-txt-primary'}`}>
          <Users className="w-4 h-4 text-txt-muted" />
          <span className="font-semibold text-xs">{row.capacity} أفراد</span>
        </span>
      ),
    },
    {
      header: 'الحالة',
      accessorKey: 'status',
      width: '120px',
      render: (row) => (
        <StatusPill status={statusPill(row.status)}>{TABLE_STATUS_LABELS[row.status] || row.status}</StatusPill>
      ),
    },
    {
      header: 'الإجراءات',
      key: 'actions',
      width: '100px',
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/tables/${row.id}`)}
          icon={ArrowUpRight}
          className="border-white/10 hover:bg-white/[0.06] text-xs"
        >
          التفاصيل
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-brand-primary" />
            <span>إدارة الطاولات ورمز QR</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            إضافة الطاولات وتحديد سعتها وحالتها وإدارة رموز QR الخاصة بالطلب الذاتي.
          </p>
        </div>

        <PermissionGate permission="tables.manage">
          <Button
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-slate-950 font-medium hover:bg-slate-200 border-none shadow-sm text-xs"
          >
            إضافة طاولة
          </Button>
        </PermissionGate>
      </div>

      {!activeBranchId ? (
        <EmptyState
          title="لا يوجد فرع نشط"
          description="اختر فرعًا من القائمة لعرض وإدارة الطاولات الخاصة به."
          icon={Grid3x3}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredTables}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="ابحث باسم / رقم الطاولة..."
          emptyTitle="لا توجد طاولات مطابقة"
          emptyDescription="لم يتم إضافة أي طاولة لهذا الفرع بعد."
          pagination={{
            page,
            totalPages: tablesResponse?.pagination?.totalPages || 1,
            total: tablesResponse?.pagination?.total,
            onPageChange: setPage,
          }}
          filters={
            <div className="w-44">
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
          mobileCardRender={(t) => (
            <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Grid3x3 className={`w-4 h-4 shrink-0 ${t.status === 'MAINTENANCE' ? 'text-txt-muted' : 'text-brand-primary'}`} />
                  <span className={`font-mono font-bold text-sm ${t.status === 'MAINTENANCE' ? 'text-txt-muted' : 'text-txt-primary'}`}>
                    {t.label}
                  </span>
                </div>
                <StatusPill status={statusPill(t.status)}>{TABLE_STATUS_LABELS[t.status] || t.status}</StatusPill>
              </div>

              <div className="flex items-center gap-1 text-xs text-txt-muted">
                <Users className="w-4 h-4" />
                <span>
                  السعة: <strong className="text-txt-primary">{t.capacity}</strong> أفراد
                </span>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-border-default">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/tables/${t.id}`)}
                  icon={ArrowUpRight}
                  className="border-white/10 hover:bg-white/[0.06] text-xs"
                >
                  التفاصيل
                </Button>
              </div>
            </div>
          )}
        />
      )}

      <TableFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        branchId={activeBranchId}
      />
    </div>
  );
};