import React from 'react';
import { StatusPill } from '../../../../shared/components/StatusPill.jsx';
import { TABLE_STATUS_LABELS } from '../../schemas/table.schema.js';
import { Users, QrCode, KeyRound, Receipt, Check } from 'lucide-react';

const statusPill = (status) => {
  const map = {
    AVAILABLE: 'success',
    OCCUPIED: 'danger',
    RESERVED: 'warning',
    MAINTENANCE: 'neutral',
  };
  return map[status] || 'neutral';
};

export const TableGridCard = ({
  table,
  onSelect,
  onStartSession,
  onCopyQr,
  copiedTableId,
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(table)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect(table);
      }}
      className={`cursor-pointer text-right bg-bg-surface rounded-xl p-3.5 border flex flex-col gap-2.5 transition-all hover:shadow-md active:scale-[0.99] ${
        table.occupied
          ? 'border-red-500/30 hover:border-red-500/50'
          : 'border-border-default hover:border-brand-primary/40'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono font-bold text-txt-primary text-lg leading-none">#{table.label}</span>
        <StatusPill status={statusPill(table.status)}>{TABLE_STATUS_LABELS[table.status] || table.status}</StatusPill>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-txt-muted">
        <Users className="w-3.5 h-3.5" />
        <span>{table.capacity} أفراد</span>
        {table.session && (
          <span className="mr-auto inline-flex items-center gap-1 text-[10px] font-semibold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            {table.session.status === 'AWAITING_CONFIRMATION'
              ? 'بانتظار التأكيد'
              : `جلسة نشطة (${table.session.members?.length || 0})`}
          </span>
        )}
        {table.session?.waiterCall?.status === 'PENDING' && (
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              table.session?.waiterCall?.type === 'BILL'
                ? 'text-amber-300 bg-amber-500/20 border border-amber-500/30'
                : 'text-status-warning bg-status-warning/10'
            }`}
          >
            {table.session?.waiterCall?.type === 'BILL' ? (
              <Receipt className="w-3 h-3 animate-pulse text-amber-400" />
            ) : null}
            {table.session?.waiterCall?.type === 'BILL' ? 'طلب حساب' : 'نداء ويتر'}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06] text-xs">
        {table.session ? (
          <button
            type="button"
            onClick={(e) => onStartSession(e, table)}
            className="flex items-center gap-1 text-txt-primary hover:text-brand-primary font-mono text-[11px] font-semibold transition-colors"
            title="رمز الجلسة"
          >
            <KeyRound className="w-3 h-3 text-brand-primary" />
            <span>PIN: {table.session.pin || '••••'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => onStartSession(e, table)}
            className="flex items-center gap-1 text-txt-muted hover:text-brand-primary text-[11px] font-medium transition-colors"
          >
            <KeyRound className="w-3 h-3" />
            <span>بدء جلسة</span>
          </button>
        )}

        {table.qrUrl && (
          <button
            type="button"
            onClick={(e) => onCopyQr(e, table)}
            className="flex items-center gap-1 text-txt-muted hover:text-brand-primary text-[11px] font-medium transition-colors ml-auto"
            title="نسخ رابط الـ QR"
          >
            {copiedTableId === table.id ? (
              <>
                <Check className="w-3 h-3 text-status-success" />
                <span className="text-status-success">تم النسخ</span>
              </>
            ) : (
              <>
                <QrCode className="w-3 h-3" />
                <span>رابط QR</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
