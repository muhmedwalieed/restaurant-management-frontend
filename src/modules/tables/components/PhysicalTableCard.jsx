import React from 'react';
import { Users, KeyRound, QrCode, Bell, Receipt, Utensils, CheckCircle2 } from 'lucide-react';
import { TABLE_STATUS_LABELS } from '../schemas/table.schema.js';

export const PhysicalTableCard = ({
  table,
  onSelect,
  onStartSession,
  isStarting = false,
}) => {
  const hasSession = Boolean(table.session);
  const waiterCall = table.session?.waiterCall;
  const isBillCall = waiterCall?.status === 'PENDING' && waiterCall?.type === 'BILL';
  const isHelpCall = waiterCall?.status === 'PENDING' && waiterCall?.type !== 'BILL';
  const isAwaitingConfirmation = table.session?.status === 'AWAITING_CONFIRMATION';
  const members = table.session?.members || [];
  const memberCount = members.length;
  const capacity = Math.max(2, Math.min(12, Number(table.capacity) || 4));

  // Determine visual tone (Clean, calm, zero neon slop)
  let toneBorder = 'border-border-default hover:border-brand-primary/40';
  let statusBadgeColor = 'bg-status-success-bg text-status-success border-status-success/30';
  let statusText = TABLE_STATUS_LABELS[table.status] || 'متاحة';

  if (isBillCall) {
    toneBorder = 'border-status-warning/60 ring-1 ring-status-warning/20';
    statusBadgeColor = 'bg-status-warning-bg text-status-warning border-status-warning/40';
    statusText = 'طلب حساب وفاتورة';
  } else if (isHelpCall) {
    toneBorder = 'border-status-danger/60 ring-1 ring-status-danger/20';
    statusBadgeColor = 'bg-status-danger-bg text-status-danger border-status-danger/40';
    statusText = 'استدعاء ويتر';
  } else if (isAwaitingConfirmation) {
    toneBorder = 'border-brand-primary/60 ring-1 ring-brand-primary/20';
    statusBadgeColor = 'bg-brand-primary/10 text-brand-primary border-brand-primary/30';
    statusText = 'أوردر بانتظار التأكيد';
  } else if (hasSession) {
    toneBorder = 'border-brand-primary/30 hover:border-brand-primary/60';
    statusBadgeColor = 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
    statusText = `جلسة نشطة (${memberCount})`;
  } else if (table.status === 'OCCUPIED') {
    toneBorder = 'border-status-danger/30 hover:border-status-danger/50';
    statusBadgeColor = 'bg-status-danger-bg text-status-danger border-status-danger/30';
    statusText = 'مشغولة';
  } else if (table.status === 'RESERVED') {
    toneBorder = 'border-status-warning/30 hover:border-status-warning/50';
    statusBadgeColor = 'bg-status-warning-bg text-status-warning border-status-warning/30';
    statusText = 'محجوزة';
  }

  // Calculate chair layout around table
  const topChairsCount = Math.ceil(capacity / 2);
  const bottomChairsCount = Math.floor(capacity / 2);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(table)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect(table);
      }}
      className={`group relative cursor-pointer select-none rounded-xl bg-bg-surface p-4 border transition-all duration-200 hover:shadow-sm flex flex-col justify-between overflow-hidden ${toneBorder}`}
    >
      {/* Top Header: Table Name & Live Status Badge */}
      <div className="flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-txt-primary text-base tracking-tight">
            #{table.label}
          </span>
          <span className="text-[11px] font-semibold text-txt-muted flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-txt-dim" />
            <span>{table.capacity}</span>
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadgeColor}`}
        >
          {isBillCall ? (
            <Receipt className="w-3 h-3 text-status-warning" />
          ) : isHelpCall ? (
            <Bell className="w-3 h-3 text-status-danger" />
          ) : isAwaitingConfirmation ? (
            <CheckCircle2 className="w-3 h-3 text-brand-primary" />
          ) : (
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                hasSession
                  ? 'bg-brand-primary'
                  : table.status === 'AVAILABLE'
                  ? 'bg-status-success'
                  : 'bg-status-danger'
              }`}
            />
          )}
          <span>{statusText}</span>
        </span>
      </div>

      {/* Realistic Physical Table & Seats Graphic (Clean & Restrained) */}
      <div className="relative my-4 py-2 flex flex-col items-center justify-center min-h-[90px]">
        {/* Top Seats Array */}
        <div className="flex items-center justify-center gap-2 z-10 -mb-1.5">
          {Array.from({ length: topChairsCount }).map((_, i) => {
            const isOccupied = i < memberCount;
            return (
              <div
                key={`top-seat-${i}`}
                title={isOccupied ? `عضو: ${members[i]?.name || 'عميل'}` : 'مقعد متاح'}
                className={`w-4 h-2.5 rounded-t-md transition-colors border ${
                  isOccupied
                    ? 'bg-brand-primary/80 border-brand-primary'
                    : 'bg-bg-surface-elevated border-border-default group-hover:border-border-default/80'
                }`}
              />
            );
          })}
        </div>

        {/* Central Tabletop Surface */}
        <div
          className={`relative w-full max-w-[190px] h-[54px] rounded-lg bg-bg-surface-elevated border flex items-center justify-between px-3.5 transition-colors ${
            hasSession
              ? 'border-brand-primary/40 bg-brand-primary/[0.04]'
              : 'border-border-default'
          }`}
        >
          {/* Table Interior Info */}
          <div className="flex items-center gap-2 min-w-0 z-10">
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
                hasSession
                  ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                  : 'bg-bg-surface border-border-subtle text-txt-muted'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 text-right">
              <p className="text-xs font-bold text-txt-primary truncate">طاولة {table.label}</p>
              <p className="text-[10px] text-txt-muted font-medium truncate">
                {hasSession
                  ? `${memberCount} جالس الآن`
                  : table.status === 'AVAILABLE'
                  ? 'جاهزة للاستقبال'
                  : 'غير متاحة'}
              </p>
            </div>
          </div>

          {/* PIN Badge on Table Surface if Session Active */}
          {table.session?.pin && (
            <div className="z-10 text-left shrink-0 pl-1">
              <span className="text-[9px] block text-txt-dim leading-none font-semibold">PIN</span>
              <span className="font-mono text-xs font-bold text-brand-primary tracking-wider" dir="ltr">
                {table.session.pin}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Seats Array */}
        <div className="flex items-center justify-center gap-2 z-10 -mt-1.5">
          {Array.from({ length: bottomChairsCount }).map((_, i) => {
            const memberIdx = topChairsCount + i;
            const isOccupied = memberIdx < memberCount;
            return (
              <div
                key={`bot-seat-${i}`}
                title={isOccupied ? `عضو: ${members[memberIdx]?.name || 'عميل'}` : 'مقعد متاح'}
                className={`w-4 h-2.5 rounded-b-md transition-colors border ${
                  isOccupied
                    ? 'bg-brand-primary/80 border-brand-primary'
                    : 'bg-bg-surface-elevated border-border-default group-hover:border-border-default/80'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-border-subtle z-10">
        <button
          type="button"
          onClick={(e) => onStartSession(e, table)}
          disabled={isStarting}
          className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-colors disabled:opacity-50 ${
            hasSession
              ? 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 border border-brand-primary/20'
              : 'bg-bg-surface-elevated text-txt-primary hover:bg-brand-primary hover:text-txt-inverted border border-border-default'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 shrink-0" />
          <span>{isStarting ? 'جارٍ البدء...' : hasSession ? 'عرض الـ PIN' : 'بدء جلسة QR'}</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(table);
          }}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold bg-bg-base text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated border border-border-default transition-colors"
        >
          <QrCode className="w-3.5 h-3.5 shrink-0" />
          <span>التفاصيل</span>
        </button>
      </div>
    </div>
  );
};

export default PhysicalTableCard;
