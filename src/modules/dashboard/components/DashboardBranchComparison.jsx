import React from 'react';
import { Store } from 'lucide-react';
import { formatMoney } from './DashboardStatsCards.jsx';

export const DashboardBranchComparison = ({ comparison = [] }) => {
  if (comparison.length <= 1) return null;

  return (
    <section className="bg-bg-surface border border-border-default rounded-lg p-5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-border-default pb-3">
        <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2.5">
          <Store className="w-4 h-4 text-slate-400" />
          <span>مقارنة الفروع والأداء المالي</span>
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="text-txt-muted border-b border-border-default font-bold">
              <th className="text-right py-2.5 px-3">الفرع</th>
              <th className="text-left py-2.5 px-3">الطلبات</th>
              <th className="text-left py-2.5 px-3">إجمالي الإيراد</th>
              <th className="text-left py-2.5 px-3">المبلغ المدفوع</th>
              <th className="text-left py-2.5 px-3">متوسط الطلب</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {comparison.map((b) => (
              <tr key={b.branchId} className="hover:bg-bg-surface-elevated/40 transition-colors">
                <td className="py-3 px-3 font-bold text-txt-primary text-right">
                  {b.branchName}
                  {b.isMain && (
                    <span className="mr-2 text-[10px] px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-bold">
                      الرئيسي
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 text-left font-mono tabular-nums text-txt-muted">
                  {b.orders}
                </td>
                <td className="py-3 px-3 text-left font-mono font-bold tabular-nums text-txt-primary">
                  {formatMoney(b.revenue)}
                </td>
                <td className="py-3 px-3 text-left font-mono font-semibold tabular-nums text-emerald-400">
                  {formatMoney(b.paidRevenue)}
                </td>
                <td className="py-3 px-3 text-left font-mono tabular-nums text-txt-muted">
                  {formatMoney(b.averageOrderValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
