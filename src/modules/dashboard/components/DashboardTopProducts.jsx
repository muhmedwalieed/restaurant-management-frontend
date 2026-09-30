import React from 'react';
import { Award } from 'lucide-react';
import { formatMoney } from './DashboardStatsCards.jsx';

export const DashboardTopProducts = ({ topProducts = [], maxSold = 1 }) => {
  return (
    <div className="lg:col-span-5 bg-bg-surface border border-border-default rounded-lg p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border-default pb-3">
        <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2.5">
          <Award className="w-4 h-4 text-txt-muted" />
          <span>أعلى الأصناف مبيعًا</span>
        </h2>
      </div>

      {topProducts.length === 0 ? (
        <p className="text-xs text-txt-muted text-center py-6">لا توجد مبيعات للأصناف بعد.</p>
      ) : (
        <div className="space-y-3">
          {topProducts.map((p, i) => {
            const qty = Number(p.quantitySold || 0);
            const percent = Math.round((qty / maxSold) * 100);
            return (
              <div
                key={p.productName}
                className="bg-bg-base border border-border-default rounded-lg p-3 space-y-2.5 transition-colors hover:border-border-subtle"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-mono flex items-center justify-center shrink-0 ${
                        i === 0
                          ? 'bg-brand-primary text-txt-inverted font-bold'
                          : i === 1
                          ? 'bg-bg-surface-elevated border border-border-default text-txt-primary font-bold'
                          : 'bg-bg-surface text-txt-muted border border-border-default font-medium'
                      }`}
                    >
                      #{i + 1}
                    </span>
                    <span className="font-bold text-txt-primary truncate text-xs sm:text-sm">{p.productName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs shrink-0">
                    <span className="text-txt-muted flex items-center gap-1 font-sans">
                      <span className="font-mono font-bold text-txt-primary">{qty}</span>
                      <span>مبيعات</span>
                    </span>
                    {p.revenue && (
                      <span className="font-mono font-semibold text-txt-muted text-[11px]">
                        ({formatMoney(p.revenue)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full bg-bg-surface-elevated rounded-full h-2 overflow-hidden border border-border-default/50">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${Math.max(percent, 4)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
