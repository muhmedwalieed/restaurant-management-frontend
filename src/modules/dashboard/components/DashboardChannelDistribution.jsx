import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { formatMoney } from './DashboardStatsCards.jsx';

const CHANNEL_CONFIG = {
  CASHIER: { label: 'الكاشير', color: 'bg-txt-primary/75', dot: 'bg-txt-primary/75' },
  WEBSITE: { label: 'الموقع الإلكتروني', color: 'bg-txt-primary/60', dot: 'bg-txt-primary/60' },
  WHATSAPP: { label: 'الواتساب', color: 'bg-txt-primary/45', dot: 'bg-txt-primary/45' },
  PHONE: { label: 'طلب هاتف', color: 'bg-txt-primary/35', dot: 'bg-txt-primary/35' },
  QR_TABLE: { label: 'الترابيزات (QR)', color: 'bg-txt-primary/25', dot: 'bg-txt-primary/25' },
};

export const DashboardChannelDistribution = ({
  isLoading,
  channels = [],
  totalChannelsOrders = 0,
}) => {
  return (
    <div className="lg:col-span-5 bg-bg-surface border border-border-default rounded-lg p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border-default pb-3">
        <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-txt-muted" />
          <span>القنوات ومصادر المبيعات</span>
        </h2>
        <span className="text-xs text-txt-muted font-medium">{totalChannelsOrders} طلب كلي</span>
      </div>

      {isLoading ? (
        <LoadingSkeleton height={180} />
      ) : channels.length === 0 ? (
        <EmptyState title="لا توجد قنوات" description="ستظهر القنوات والمصادر فور وصول الطلبات." />
      ) : (
        <div className="space-y-3.5">
          {channels.map((c) => {
            const count = Number(c.orders || 0);
            const percent = Math.round((count / Math.max(totalChannelsOrders, 1)) * 100);
            const config = CHANNEL_CONFIG[c.source] || {
              label: c.source,
              color: 'bg-txt-primary/40',
              dot: 'bg-txt-primary/40',
            };

            return (
              <div key={c.source} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-txt-primary">
                    <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                    <span>{config.label}</span>
                    <span className="text-txt-muted font-mono font-normal">({percent}%)</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-left">
                    <span className="font-bold text-txt-primary">{formatMoney(c.revenue)}</span>
                    <span className="text-txt-muted">·</span>
                    <span className="text-txt-muted font-medium">{count} طلب</span>
                  </div>
                </div>
                <div className="w-full bg-bg-surface-elevated rounded-full h-2 overflow-hidden border border-border-default/40">
                  <div
                    className={`${config.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(percent, 2)}%` }}
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
