import React from 'react';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { GrowthBadge, formatMoney } from './DashboardStatsCards.jsx';

export const formatCompactMoney = (v) => {
  const n = Number(v || 0);
  if (n >= 1000) {
    const k = (n / 1000).toFixed(1);
    return `${k.endsWith('.0') ? Math.round(n / 1000) : k}k`;
  }
  return `${Math.round(n)}`;
};

export const DashboardSalesChart = ({
  isLoading,
  trend = [],
  totalWeeklyRevenue = 0,
  maxRevenue = 1,
  growthStats,
  chartPoints = [],
  linePath = '',
  areaPath = '',
}) => {
  return (
    <div className="lg:col-span-7 bg-bg-surface border border-border-default/70 rounded-xl p-5 md:p-6 space-y-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-3 border-b border-border-subtle/40 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-txt-primary tracking-tight">اتجاه المبيعات</h2>
            <span className="text-[11px] font-semibold text-txt-muted bg-bg-base px-2 py-0.5 rounded-full border border-border-default">
              آخر 7 أيام
            </span>
          </div>
          <p className="text-xs text-txt-muted">نظرة عامة على القيمة الإجمالية للمبيعات وتطورها اليومي</p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1">
          <span className="text-[11px] font-medium text-txt-muted">إجمالي الفترة</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-mono font-bold tracking-tight text-white">
              {formatMoney(totalWeeklyRevenue)}
            </span>
            <GrowthBadge growth={growthStats?.weeklyRevenue} />
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton height={190} />
      ) : totalWeeklyRevenue === 0 && trend.every((t) => Number(t.revenue || 0) === 0) ? (
        <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-border-subtle/40 rounded-lg bg-bg-base/30">
          <p className="text-xs font-semibold text-txt-muted">لا توجد مبيعات مسجلة خلال آخر 7 أيام</p>
          <p className="text-[11px] text-txt-muted/70 mt-1">ستظهر المنحنيات والتحليلات البيانية فور إنشاء الطلبات</p>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          <div className="relative w-full h-44">
            <svg viewBox="0 0 520 150" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="salesTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              <g className="opacity-30">
                <line x1="65" y1="20" x2="505" y2="20" stroke="currentColor" className="text-white" strokeDasharray="3 3" strokeWidth="0.7" />
                <text x="10" y="20" dominantBaseline="middle" className="fill-slate-400 text-[10px] font-mono font-semibold">{formatCompactMoney(maxRevenue)}</text>

                <line x1="65" y1="75" x2="505" y2="75" stroke="currentColor" className="text-white" strokeDasharray="3 3" strokeWidth="0.7" />
                <text x="10" y="75" dominantBaseline="middle" className="fill-slate-400 text-[10px] font-mono font-semibold">{formatCompactMoney(maxRevenue / 2)}</text>

                <line x1="65" y1="130" x2="505" y2="130" stroke="currentColor" className="text-white" strokeWidth="0.9" />
                <text x="10" y="130" dominantBaseline="middle" className="fill-slate-400 text-[10px] font-mono font-semibold">0</text>
              </g>

              <path d={areaPath} fill="url(#salesTrendGradient)" />
              <path d={linePath} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

              {chartPoints.map((pt) => (
                <g key={pt.date} className="group cursor-pointer">
                  <rect x={pt.x - 18} y="10" width="36" height="125" fill="transparent" />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill="#38bdf8"
                    stroke="#0F172A"
                    strokeWidth="2"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-md"
                  />
                </g>
              ))}
            </svg>

            <div className="absolute inset-0 pointer-events-none">
              {chartPoints.map((pt) => {
                const leftPercent = (pt.x / 520) * 100;
                return (
                  <div
                    key={pt.date}
                    className="group absolute"
                    style={{ left: `${leftPercent}%`, top: `${(pt.y / 150) * 100}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 absolute bottom-3 -translate-x-1/2 left-1/2 bg-slate-900/95 border border-slate-700/80 rounded-md px-2.5 py-1.5 text-[11px] font-mono text-white whitespace-nowrap shadow-xl z-30 pointer-events-none">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sky-400">{pt.dayLabel}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-300">{pt.orders} طلب</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-emerald-400 font-bold">{formatMoney(pt.rev)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between text-center text-xs text-slate-400 font-medium pr-3 pl-[55px] pt-2 border-t border-border-subtle/30">
            {chartPoints.map((pt, idx) => {
              const isToday = idx === chartPoints.length - 1;
              return (
                <div
                  key={pt.date}
                  className={`truncate font-medium transition-colors ${
                    isToday ? 'text-brand-primary font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={pt.date}
                >
                  {pt.dayLabel}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
