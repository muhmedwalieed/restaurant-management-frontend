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

  // Determine visual tone
  let toneBorder = 'border-border-default hover:border-brand-primary/50';
  let toneGlow = 'from-brand-primary/5 to-transparent';
  let statusBadgeColor = 'bg-status-success/15 text-status-success border-status-success/30';
  let statusText = TABLE_STATUS_LABELS[table.status] || 'متاحة';

  if (isBillCall) {
    toneBorder = 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40';
    toneGlow = 'from-amber-500/15 to-transparent';
    statusBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    statusText = 'طلب حساب وفاتورة';
  } else if (isHelpCall) {
    toneBorder = 'border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/40';
    toneGlow = 'from-rose-500/15 to-transparent';
    statusBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    statusText = 'استدعاء ويتر';
  } else if (isAwaitingConfirmation) {
    toneBorder = 'border-brand-primary/60 shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-brand-primary/40';
    toneGlow = 'from-brand-primary/15 to-transparent';
    statusBadgeColor = 'bg-brand-primary/20 text-brand-primary border-brand-primary/40';
    statusText = 'أوردر بانتظار التأكيد';
  } else if (hasSession) {
    toneBorder = 'border-brand-primary/40 hover:border-brand-primary/70';
    toneGlow = 'from-brand-primary/10 to-transparent';
    statusBadgeColor = 'bg-brand-primary/15 text-brand-primary border-brand-primary/30';
    statusText = `جلسة نشطة (${memberCount})`;
  } else if (table.status === 'OCCUPIED') {
    toneBorder = 'border-rose-500/30 hover:border-rose-500/50';
    toneGlow = 'from-rose-500/5 to-transparent';
    statusBadgeColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    statusText = 'مشغولة';
  } else if (table.status === 'RESERVED') {
    toneBorder = 'border-amber-500/30 hover:border-amber-500/50';
    toneGlow = 'from-amber-500/5 to-transparent';
    statusBadgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
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
      className={`group relative cursor-pointer select-none rounded-2xl bg-bg-surface p-4 border transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden ${toneBorder}`}
    >
      {/* Top Header: Table Name & Live Status Badge */}
      <div className="flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-txt-primary text-base tracking-tight">
            #{table.label}
          </span>
          <span className="text-[11px] font-semibold text-txt-muted flex items-center gap-1">
            <Users className="w-3 h-3 text-txt-muted" />
            <span>{table.capacity}</span>
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadgeColor}`}
        >
          {isBillCall ? (
            <Receipt className="w-3 h-3 animate-pulse text-amber-400" />
          ) : isHelpCall ? (
            <Bell className="w-3 h-3 animate-pulse text-rose-400" />
          ) : isAwaitingConfirmation ? (
            <CheckCircle2 className="w-3 h-3 animate-pulse text-brand-primary" />
          ) : (
            <span
              className={`w-1.5 h-1.5 rounded-full ${hasSession
                  ? 'bg-brand-primary animate-pulse'
                  : table.status === 'AVAILABLE'
                    ? 'bg-emerald-400'
                    : 'bg-rose-400'
                }`}
            />
          )}
          <span>{statusText}</span>
        </span>
      </div>

      {/* Realistic Physical Table & Seats Graphic */}
      <div className="relative my-4 py-2 flex flex-col items-center justify-center min-h-[96px]">
        {/* Top Seats Array */}
        <div className="flex items-center justify-center gap-2 z-10 -mb-1.5">
          {Array.from({ length: topChairsCount }).map((_, i) => {
            const isOccupied = i < memberCount;
            return (
              <div
                key={`top-seat-${i}`}
                title={isOccupied ? `عضو: ${members[i]?.name || 'عميل'}` : 'مقعد متاح'}
                className={`w-4 h-2.5 rounded-t-md transition-all duration-300 border ${isOccupied
                    ? 'bg-brand-primary border-brand-primary shadow-[0_0_8px_rgba(234,179,8,0.5)]'
                    : 'bg-bg-surface-elevated/80 border-border-default group-hover:border-border-default/80'
                  }`}
              />
            );
          })}
        </div>

        {/* Central Tabletop Surface */}
        <div
          className={`relative w-full max-w-[190px] h-[58px] rounded-xl bg-gradient-to-b from-bg-surface-elevated to-bg-base border flex items-center justify-between px-3.5 shadow-inner transition-all duration-300 ${hasSession
              ? 'border-brand-primary/40 bg-brand-primary/[0.04]'
              : 'border-border-default/70'
            }`}
        >
          {/* Subtle Tabletop Center Line & Ambient Glow */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none" />

          {/* Table Interior Info */}
          <div className="flex items-center gap-2 min-w-0 z-10">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${hasSession
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
              <span className="text-[9px] block text-txt-muted leading-none font-semibold">PIN</span>
              <span className="font-mono text-xs font-black text-brand-primary tracking-wider" dir="ltr">
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
                className={`w-4 h-2.5 rounded-b-md transition-all duration-300 border ${isOccupied
                    ? 'bg-brand-primary border-brand-primary shadow-[0_0_8px_rgba(234,179,8,0.5)]'
                    : 'bg-bg-surface-elevated/80 border-border-default group-hover:border-border-default/80'
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
          className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50 ${hasSession
              ? 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 border border-brand-primary/20'
              : 'bg-bg-surface-elevated text-txt-primary hover:bg-brand-primary hover:text-slate-950 border border-border-subtle'
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
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold bg-bg-base text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated border border-border-subtle transition-all"
        >
          <QrCode className="w-3.5 h-3.5 shrink-0" />
          <span>التفاصيل</span>
        </button>
      </div>
    </div>
  );
};

export default PhysicalTableCard;
