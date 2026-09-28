import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { formatMoney } from './DashboardStatsCards.jsx';

const CHANNEL_LABELS = {
  CASHIER: 'الكاشير',
  WEBSITE: 'الموقع الإلكتروني',
  WHATSAPP: 'الواتساب',
  PHONE: 'طلب هاتف',
  QR_TABLE: 'الترابيزات (QR)',
};

export const DashboardChannelDistribution = ({
  isLoading,
  channels = [],
  totalChannelsOrders = 0,
}) => {
  return (
    <div className="lg:col-span-5 bg-bg-surface border border-border-default rounded-lg p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border-default pb-3">
        <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2.5">
          <ShoppingBag className="w-4 h-4 text-slate-400" />
          <span>القنوات والمصادر</span>
        </h2>
        <span className="text-xs text-txt-muted">{totalChannelsOrders} طلب كلي</span>
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
            const label = CHANNEL_LABELS[c.source] || c.source;
            return (
              <div key={c.source} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-txt-primary">
                    <span>{label}</span>
                    <span className="text-txt-muted font-mono font-normal">({percent}%)</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-left">
                    <span className="font-bold text-txt-primary">{formatMoney(c.revenue)}</span>
                    <span className="text-txt-muted">·</span>
                    <span className="text-txt-muted font-medium">{count} طلب</span>
                  </div>
                </div>
                <div className="w-full bg-bg-base rounded-full h-1.5 overflow-hidden border border-border-default/40 mt-2">
                  <div
                    className="bg-brand-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(percent, 3)}%` }}
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
