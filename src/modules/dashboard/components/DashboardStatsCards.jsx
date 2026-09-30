import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';

export const formatMoney = (v) => {
  const n = Number(v || 0);
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`;
};

export const GrowthBadge = ({ growth }) => {
  if (growth === null || growth === undefined) return null;
  const abs = Math.abs(growth).toFixed(1);
  if (growth > 0.5) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-success bg-status-success-bg px-1.5 py-0.5 rounded border border-status-success/20">
        <ArrowUpRight className="w-3 h-3" /> +{abs}%
      </span>
    );
  }
  if (growth < -0.5) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-danger bg-status-danger-bg px-1.5 py-0.5 rounded border border-status-danger/20">
        <ArrowDownRight className="w-3 h-3" /> -{abs}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-txt-muted bg-bg-surface-elevated px-1.5 py-0.5 rounded border border-border-default">
      <Minus className="w-3 h-3" /> مستقر
    </span>
  );
};

export const DashboardStatsCards = ({ isLoading, summary, growthStats, activeOrdersCount }) => {
  if (isLoading) {
    return (
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingSkeleton key={i} height={104} />
        ))}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. طلبات اليوم */}
      <div className="bg-bg-surface border border-border-default rounded-lg p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-txt-muted">طلبات اليوم</span>
          <GrowthBadge growth={growthStats?.ordersToday} />
        </div>
        <div className="text-2xl font-mono font-bold tabular-nums text-txt-primary">
          {summary?.ordersToday ?? 0}
        </div>
        <p className="text-[11px] text-txt-muted border-t border-border-subtle/50 pt-2.5">
          إجمالي الطلبات الكلي: <span className="font-mono font-semibold text-txt-primary">{summary?.totalOrders ?? 0}</span>
        </p>
      </div>

      {/* 2. مبيعات اليوم */}
      <div className="bg-bg-surface border border-border-default rounded-lg p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-txt-muted">مبيعات اليوم</span>
          <GrowthBadge growth={growthStats?.revenueToday} />
        </div>
        <div className="text-2xl font-mono font-bold tabular-nums text-txt-primary">
          {formatMoney(summary?.revenueToday)}
        </div>
        <p className="text-[11px] text-txt-muted border-t border-border-subtle/50 pt-2.5">
          إجمالي المبيعات: <span className="font-mono font-semibold text-txt-primary">{formatMoney(summary?.revenue)}</span>
        </p>
      </div>

      {/* 3. طلبات نشطة الآن */}
      <div className="bg-bg-surface border border-border-default rounded-lg p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-txt-muted flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                activeOrdersCount > 0
                  ? 'bg-status-success animate-pulse'
                  : 'bg-txt-dim'
              }`}
            />
            <span>طلبات نشطة الآن</span>
          </span>
        </div>
        <div className="text-2xl font-mono font-bold tabular-nums text-txt-primary">
          {activeOrdersCount}
        </div>
        <p className="text-[11px] text-txt-muted border-t border-border-subtle/50 pt-2.5">
          ترابيزات مشغولة: <span className="font-mono font-semibold text-txt-primary">{summary?.occupiedTables ?? 0}</span>
        </p>
      </div>

      {/* 4. متوسط قيمة الطلب */}
      <div className="bg-bg-surface border border-border-default rounded-lg p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-txt-muted">متوسط قيمة الطلب</span>
          <GrowthBadge growth={growthStats?.avgOrderValue} />
        </div>
        <div className="text-2xl font-mono font-bold tabular-nums text-txt-primary">
          {formatMoney(summary?.averageOrderValue)}
        </div>
        <p className="text-[11px] text-txt-muted border-t border-border-subtle/50 pt-2.5">
          مدفوع المؤكد: <span className="font-mono font-semibold text-txt-primary">{formatMoney(summary?.paidRevenue)}</span>
        </p>
      </div>
    </section>
  );
};
