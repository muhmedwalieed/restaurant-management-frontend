import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTableQuery } from '../hooks/useTables.js';
import { useTableActiveOrdersQuery } from '../hooks/useTableOrders.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { TABLE_STATUS_LABELS } from '../schemas/table.schema.js';
import { formatTableLabel } from '../utils/tableLabel.js';
import { Button } from '../../../shared/components/Button.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { TableSessionPanel } from '../components/TableSessionPanel.jsx';
import { TableQrCard } from '../components/detail/TableQrCard.jsx';
import { TableActiveOrdersCard } from '../components/detail/TableActiveOrdersCard.jsx';
import {
  Grid3x3,
  ChevronRight,
  Users,
  AlertCircle,
} from 'lucide-react';

const statusPill = (status) => {
  const map = {
    AVAILABLE: 'success',
    OCCUPIED: 'danger',
    RESERVED: 'warning',
    MAINTENANCE: 'neutral',
  };
  return map[status] || 'neutral';
};

export const TableDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeBranchId, activeBranch } = useBranch();

  const { data: table, isLoading, isError, error, refetch } = useTableQuery(activeBranchId, id);
  const {
    data: activeOrders,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    refetch: refetchOrders,
  } = useTableActiveOrdersQuery(activeBranchId, id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton height={48} className="w-1/3" />
        <LoadingSkeleton height={120} className="w-full" />
        <LoadingSkeleton height={220} className="w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-status-danger-bg border border-status-danger/30 rounded-lg p-6 text-center space-y-3">
        <AlertCircle className="w-6 h-6 text-status-danger mx-auto" />
        <h3 className="text-base font-bold text-txt-primary">فشل في تحميل تفاصيل الطاولة</h3>
        <p className="text-xs text-txt-muted">{error?.message || 'تعذر التواصل مع الخادم.'}</p>
        <Button size="sm" variant="outline" onClick={refetch}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/tables')}
            icon={ChevronRight}
            className="border-white/10 text-xs"
          >
            العودة للطاولات
          </Button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
              <Grid3x3 className="w-5 h-5 text-brand-primary" />
              <span>{formatTableLabel(table?.label)}</span>
            </h1>
            <StatusPill status={statusPill(table?.status)}>
              {TABLE_STATUS_LABELS[table?.status] || table?.status}
            </StatusPill>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7 space-y-5">
          {/* Table Data Card */}
          <div className="bg-bg-surface border border-border-default rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Grid3x3 className="w-4 h-4 text-brand-primary" />
                <h3 className="text-xs font-bold text-txt-primary">بيانات الطاولة</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-bg-base/40 border border-border-subtle rounded-lg p-3 space-y-1">
                <p className="text-[11px] font-semibold text-txt-muted">رقم الطاولة</p>
                <p className="text-sm font-bold text-txt-primary font-mono">{table?.label || '—'}</p>
              </div>
              <div className="bg-bg-base/40 border border-border-subtle rounded-lg p-3 space-y-1">
                <p className="text-[11px] font-semibold text-txt-muted flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  السعة
                </p>
                <p className="text-sm font-bold text-txt-primary">{table?.capacity ?? '—'} أفراد</p>
              </div>
              <div className="bg-bg-base/40 border border-border-subtle rounded-lg p-3 space-y-1">
                <p className="text-[11px] font-semibold text-txt-muted">حالة الطاولة</p>
                <StatusPill status={statusPill(table?.status)}>
                  {TABLE_STATUS_LABELS[table?.status] || table?.status}
                </StatusPill>
              </div>
            </div>
          </div>

          {/* Active Orders Card */}
          <TableActiveOrdersCard
            activeOrders={activeOrders}
            isLoading={isOrdersLoading}
            isError={isOrdersError}
            onRetry={refetchOrders}
          />

          {/* Table Session Panel */}
          <TableSessionPanel tableId={id} />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <TableQrCard table={table} branchName={activeBranch?.name} />
        </div>
      </div>
    </div>
  );
};
