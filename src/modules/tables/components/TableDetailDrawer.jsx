import { Users, Grid3x3, X, ArrowUpRight } from 'lucide-react';
import { Button } from '../../../shared/components/Button.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { TableQrPanel } from './TableQrPanel.jsx';
import { TableSessionPanel } from './TableSessionPanel.jsx';
import { TABLE_STATUS_LABELS } from '../schemas/table.schema.js';

const statusPill = (status) => {
  const map = {
    AVAILABLE: 'success',
    OCCUPIED: 'danger',
    RESERVED: 'warning',
    MAINTENANCE: 'neutral',
  };
  return map[status] || 'neutral';
};

export const TableDetailDrawer = ({ isOpen, onClose, table, branchName }) => {
  if (!isOpen || !table) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-bg-surface border-l border-white/[0.07] shadow-2xl flex flex-col animate-slide-in-right">
        <div className="p-4 border-b border-border-default flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary shrink-0">
              <Grid3x3 className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-txt-primary">طاولة {table.label}</h2>
              <p className="text-[11px] text-txt-muted truncate">{branchName || 'الفرع الحالي'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusPill status={statusPill(table.status)}>{TABLE_STATUS_LABELS[table.status] || table.status}</StatusPill>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-md text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-5">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-bg-base/40 border border-border-subtle rounded-lg p-2.5 text-center">
              <p className="text-[10px] font-semibold text-txt-muted">رقم الطاولة</p>
              <p className="text-sm font-bold text-txt-primary font-mono mt-0.5">{table.label}</p>
            </div>
            <div className="bg-bg-base/40 border border-border-subtle rounded-lg p-2.5 text-center">
              <p className="text-[10px] font-semibold text-txt-muted flex items-center justify-center gap-1">
                <Users className="w-3 h-3" />
                السعة
              </p>
              <p className="text-sm font-bold text-txt-primary mt-0.5">{table.capacity} أفراد</p>
            </div>
            <div className="bg-bg-base/40 border border-border-subtle rounded-lg p-2.5 text-center">
              <p className="text-[10px] font-semibold text-txt-muted">الحالة</p>
              <div className="mt-0.5">
                <StatusPill status={statusPill(table.status)}>{TABLE_STATUS_LABELS[table.status] || table.status}</StatusPill>
              </div>
            </div>
          </div>

          {table.qrUrl && (
            <a href={table.qrUrl} target="_blank" rel="noreferrer" className="block">
              <Button size="sm" variant="outline" icon={ArrowUpRight} className="w-full border-white/10 text-xs">
                معاينة القائمة الرقمية
              </Button>
            </a>
          )}

          <TableQrPanel table={table} branchName={branchName} />

          {table.id && <TableSessionPanel tableId={table.id} />}
        </div>
      </div>
    </div>
  );
};

export default TableDetailDrawer;