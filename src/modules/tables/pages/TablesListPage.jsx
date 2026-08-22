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
import { Grid3x3, Plus, Users, Eye } from 'lucide-react';

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
  const { activeBranchId, activeBranch } = useBranch();
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
      header: 'الترابيزة',
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
      width: '100px',
      render: (row) => (
        <span className={`flex items-center gap-1 ${row.status === 'MAINTENANCE' ? 'text-txt-muted' : 'text-txt-primary'}`}>
          <Users className="w-3.5 h-3.5 text-txt-muted" />
          <span className="font-semibold">{row.capacity}</span>
        </span>
      ),
    },
    {
      header: 'الحالة',
      accessorKey: 'status',
      render: (row) => (
        <StatusPill status={statusPill(row.status)}>{TABLE_STATUS_LABELS[row.status] || row.status}</StatusPill>
      ),
    },
    {
      header: 'التفاصيل',
      key: 'actions',
      render: (row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate(`/tables/${row.id}`)}
          icon={Eye}
          className="text-txt-primary hover:text-brand-primary hover:bg-bg-surface-elevated"
          title="عرض تفاصيل الترابيزة"
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
            <Grid3x3 className="w-6 h-6 text-brand-primary" />
            <span>إدارة الترابيزات ورمز QR</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            إضافة الترابيزات وتحديد سعتها وحالتها ورموز QR الخاصة بكل ترابيزة
          </p>
        </div>

        <PermissionGate permission="tables.manage">
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            إضافة ترابيزة
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
          description="اختر فرعًا من القائمة لعرض وإدارة الترابيزات الخاصة به."
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
          searchPlaceholder="ابحث باسم / رقم الترابيزة..."
          emptyTitle="لا توجد ترابيزات مطابقة"
          emptyDescription="لم يتم إضافة أي ترابيزة لهذا الفرع بعد."
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
                <Users className="w-3.5 h-3.5" />
                <span>
                  السعة: <strong className="text-txt-primary">{t.capacity}</strong> أفراد
                </span>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-border-default">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/tables/${t.id}`)}
                  icon={Eye}
                  className="text-txt-primary hover:text-brand-primary"
                  title="عرض تفاصيل الترابيزة"
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