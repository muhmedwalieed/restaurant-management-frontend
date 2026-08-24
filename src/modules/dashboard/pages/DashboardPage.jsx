import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  XCircle,
  Store,
  Award,
  ArrowUpRight,
  Clock,
  ChevronLeft,
  Calendar,
} from 'lucide-react';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import {
  useDashboardSummaryQuery,
  useChannelStatsQuery,
  useSalesTrendQuery,
  useBranchComparisonQuery,
} from '../hooks/useDashboard.js';
import { useOrdersQuery } from '../../orders/hooks/useOrders.js';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { ORDER_STATUS_LABELS, ORDER_TYPE_LABELS, orderStatusPill } from '../../orders/schemas/order.schema.js';

const formatMoney = (v) => {
  const n = Number(v || 0);
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`;
};

const formatCompactMoney = (v) => {
  const n = Number(v || 0);
  if (n >= 1000) {
    const k = (n / 1000).toFixed(1);
    return `${k.endsWith('.0') ? Math.round(n / 1000) : k}k`;
  }
  return `${Math.round(n)}`;
};

const CHANNEL_LABELS = {
  CASHIER: 'الكاشير',
  WEBSITE: 'الموقع الإلكتروني',
  WHATSAPP: 'الواتساب',
  PHONE: 'طلب هاتف',
  QR_TABLE: 'الترابيزات (QR)',
};

const TYPE_BADGES = {
  DINE_IN: { label: 'صالة' },
  TAKEAWAY: { label: 'استلام' },
  DELIVERY: { label: 'توصيل' },
  DRIVE_THRU: { label: 'استلام' },
};

const fill7DaysTrend = (rawTrend) => {
  const result = [];
  const trendMap = new Map((rawTrend || []).map((t) => [t.date, t]));

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    const existing = trendMap.get(dateKey);
    result.push({
      date: dateKey,
      orders: existing ? Number(existing.orders || 0) : 0,
      revenue: existing ? Number(existing.revenue || 0) : 0,
    });
  }
  return result;
};

const formatDayLabel = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('ar-EG', { weekday: 'short' });
};

const generateSvgPaths = (pts, baselineY = 130) => {
  if (!pts || pts.length === 0) return { linePath: '', areaPath: '' };

  let linePath = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cpx1 = p0.x + (p1.x - p0.x) / 2;
    const cpy1 = p0.y;
    const cpx2 = p0.x + (p1.x - p0.x) / 2;
    const cpy2 = p1.y;
    linePath += ` C ${cpx1},${cpy1} ${cpx2},${cpy2} ${p1.x},${p1.y}`;
  }

  const areaPath = `${linePath} L ${pts[pts.length - 1].x},${baselineY} L ${pts[0].x},${baselineY} Z`;
  return { linePath, areaPath };
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { activeBranchId } = useBranch();
  const { hasPermission } = useAuth();
  const [dateRange, setDateRange] = useState('TODAY');

  const summaryQuery = useDashboardSummaryQuery(activeBranchId);
  const channelsQuery = useChannelStatsQuery(activeBranchId);
  const trendQuery = useSalesTrendQuery(activeBranchId, 7);
  const comparisonQuery = useBranchComparisonQuery();
  const recentOrdersQuery = useOrdersQuery(activeBranchId, { page: 1, limit: 5 });

  const summary = summaryQuery.data;
  const channels = channelsQuery.data || [];
  const rawTrend = trendQuery.data || [];
  const trend = fill7DaysTrend(rawTrend);
  const rawComparison = comparisonQuery.data || [];
  const recentOrders = recentOrdersQuery.data?.items || [];

  const comparison = rawComparison.filter(
    (b) => b.branchName && !b.branchName.toLowerCase().includes('muhmed') && !b.branchName.toLowerCase().includes('walied')
  );

  const totalWeeklyRevenue = trend.reduce((sum, t) => sum + Number(t.revenue || 0), 0);
  const maxRevenue = Math.max(...trend.map((t) => Number(t.revenue || 0)), 1);
  const totalChannelsOrders = channels.reduce((sum, c) => sum + Number(c.orders || 0), 0);
  const canViewReports = hasPermission('dashboard.view');

  const topProducts = summary?.topProducts || [];
  const maxSold = Math.max(...topProducts.map((p) => Number(p.quantitySold || 0)), 1);
  const activeOrdersCount = summary?.activeOrders ?? 0;

  const chartPoints = trend.map((day, i) => {
    const rev = Number(day.revenue || 0);
    const x = 65 + (i * 435) / 6;
    const y = 130 - (rev / maxRevenue) * 105;
    return { ...day, x, y, rev, dayLabel: formatDayLabel(day.date) };
  });

  const { linePath, areaPath } = generateSvgPaths(chartPoints, 130);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between w-full mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2.5">
            <LayoutDashboard className="w-5 h-5 text-slate-400" />
            <span>لوحة التحكم والتحليلات</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">نظرة تشغيلية حية على مبيعات وأداء الفرع الحالي</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="w-36">
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              options={[
                { value: 'TODAY', label: 'اليوم' },
                { value: 'THIS_WEEK', label: 'هذا الأسبوع' },
                { value: 'THIS_MONTH', label: 'هذا الشهر' },
              ]}
              aria-label="النطاق الزمني"
            />
          </div>
        </div>
      </div>

      {!canViewReports && (
        <div className="bg-bg-surface border border-border-default rounded-lg p-4 text-xs text-txt-muted">
          صلاحية <code className="text-brand-primary">dashboard.view</code> غير مفعّلة لحسابك. لوحة التحكم الكاملة والتحليلات مخصصة للمديرين فقط.
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} height={104} />)
        ) : (
          <>
            <div className="bg-bg-surface border border-border-default rounded-lg p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-txt-muted">طلبات اليوم</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <ArrowUpRight className="w-3 h-3" /> +12.4%
                </span>
              </div>
              <div className="text-2xl font-mono font-bold tabular-nums text-white">
                {summary?.ordersToday ?? 0}
              </div>
              <p className="text-[11px] text-txt-muted border-t border-border-subtle/50 pt-2.5">
                إجمالي الطلبات الكلي: <span className="font-mono font-semibold text-txt-primary">{summary?.totalOrders ?? 0}</span>
              </p>
            </div>

            <div className="bg-bg-surface border border-border-default rounded-lg p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-txt-muted">مبيعات اليوم</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <ArrowUpRight className="w-3 h-3" /> +8.5%
                </span>
              </div>
              <div className="text-2xl font-mono font-bold tabular-nums text-white">
                {formatMoney(summary?.revenueToday)}
              </div>
              <p className="text-[11px] text-txt-muted border-t border-border-subtle/50 pt-2.5">
                إجمالي المبيعات: <span className="font-mono font-semibold text-txt-primary">{formatMoney(summary?.revenue)}</span>
              </p>
            </div>

            <div className="bg-bg-surface border border-border-default rounded-lg p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-txt-muted flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      activeOrdersCount > 0
                        ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50'
                        : 'bg-slate-600/50'
                    }`}
                  />
                  <span>طلبات نشطة الآن</span>
                </span>
              </div>
              <div className="text-2xl font-mono font-bold tabular-nums text-amber-400">
                {activeOrdersCount}
              </div>
              <p className="text-[11px] text-txt-muted border-t border-border-subtle/50 pt-2.5">
                ترابيزات مشغولة: <span className="font-mono font-semibold text-txt-primary">{summary?.occupiedTables ?? 0}</span>
              </p>
            </div>

            <div className="bg-bg-surface border border-border-default rounded-lg p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-txt-muted">متوسط قيمة الطلب</span>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  مستقر
                </span>
              </div>
              <div className="text-2xl font-mono font-bold tabular-nums text-white">
                {formatMoney(summary?.averageOrderValue)}
              </div>
              <p className="text-[11px] text-txt-muted border-t border-border-subtle/50 pt-2.5">
                مدفوع المؤكد: <span className="font-mono font-semibold text-emerald-400">{formatMoney(summary?.paidRevenue)}</span>
              </p>
            </div>
          </>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Analytics Card (Commercial SaaS UI Composition) */}
        <div className="lg:col-span-7 bg-bg-surface border border-border-default/70 rounded-xl p-5 md:p-6 space-y-5 shadow-sm">
          {/* Header & Metric Hierarchy */}
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
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <ArrowUpRight className="w-3 h-3" /> +12.5%
                </span>
              </div>
            </div>
          </div>

          {/* Chart Content & Empty Data Handling */}
          {trendQuery.isLoading ? (
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

                  {/* Subtlest Grid Reference Lines & Y-Axis Scale */}
                  <g className="opacity-30">
                    <line x1="65" y1="20" x2="505" y2="20" stroke="currentColor" className="text-white" strokeDasharray="3 3" strokeWidth="0.7" />
                    <text x="10" y="20" dominantBaseline="middle" className="fill-slate-400 text-[10px] font-mono font-semibold">{formatCompactMoney(maxRevenue)}</text>

                    <line x1="65" y1="75" x2="505" y2="75" stroke="currentColor" className="text-white" strokeDasharray="3 3" strokeWidth="0.7" />
                    <text x="10" y="75" dominantBaseline="middle" className="fill-slate-400 text-[10px] font-mono font-semibold">{formatCompactMoney(maxRevenue / 2)}</text>

                    <line x1="65" y1="130" x2="505" y2="130" stroke="currentColor" className="text-white" strokeWidth="0.9" />
                    <text x="10" y="130" dominantBaseline="middle" className="fill-slate-400 text-[10px] font-mono font-semibold">0</text>
                  </g>

                  {/* Soft Gradient Area Fill */}
                  <path d={areaPath} fill="url(#salesTrendGradient)" />

                  {/* Crisp 2px Curved Line */}
                  <path d={linePath} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Touch Triggers & Hover Active Dots */}
                  {chartPoints.map((pt) => {
                    return (
                      <g key={pt.date} className="group cursor-pointer">
                        <rect
                          x={pt.x - 18}
                          y="10"
                          width="36"
                          height="125"
                          fill="transparent"
                        />
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
                    );
                  })}
                </svg>

                {/* Hover-Only Dark Glassmorphism Tooltips */}
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

              {/* X-Axis Arabic Day Labels */}
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

        <div className="lg:col-span-5 bg-bg-surface border border-border-default rounded-lg p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border-default pb-3">
            <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-slate-400" />
              <span>القنوات والمصادر</span>
            </h2>
            <span className="text-xs text-txt-muted">{totalChannelsOrders} طلب كلي</span>
          </div>

          {channelsQuery.isLoading ? (
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
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-bg-surface border border-border-default rounded-lg p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border-default pb-3">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-txt-primary">أحدث الطلبات المباشرة</h2>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-bg-surface-elevated text-txt-muted border border-border-subtle">
                {recentOrders.length}
              </span>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="text-xs text-brand-primary hover:underline font-bold flex items-center gap-1 transition-colors"
            >
              <span>عرض كل الطلبات</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrdersQuery.isLoading ? (
            <LoadingSkeleton height={150} />
          ) : recentOrders.length === 0 ? (
            <div className="py-8 text-center space-y-1">
              <Clock className="w-6 h-6 text-txt-muted mx-auto opacity-50" />
              <p className="text-xs font-bold text-txt-primary">لا توجد طلبات حديثة اليوم</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-bg-base border-b border-border-default text-txt-muted font-bold">
                  <tr>
                    <th className="p-3">رقم الطلب</th>
                    <th className="p-3">العميل / النوع</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3 text-left">المبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {recentOrders.map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => navigate(`/orders/${o.id}`)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                    >
                      <td className="p-3 font-mono font-bold text-brand-primary group-hover:underline">
                        #{o.orderNumber}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col text-xs leading-snug">
                          <span className="font-medium text-slate-100">
                            {o.customer?.name || (o.table ? `طاولة ${o.table.label}` : 'عميل مباشر')}
                          </span>
                          <span className="text-[11px] text-txt-muted">
                            {TYPE_BADGES[o.type]?.label || ORDER_TYPE_LABELS[o.type] || o.type}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <StatusPill status={orderStatusPill(o.status)}>
                          {ORDER_STATUS_LABELS[o.status] || o.status}
                        </StatusPill>
                      </td>
                      <td className="p-3 font-mono font-bold tabular-nums text-left text-txt-primary">
                        {formatMoney(o.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-bg-surface border border-border-default rounded-lg p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border-default pb-3">
            <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2.5">
              <Award className="w-4 h-4 text-slate-400" />
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
                          className={`w-6 h-6 rounded-full text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                            i === 0
                              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold'
                              : i === 1
                              ? 'bg-slate-400/20 border border-slate-400/40 text-slate-300 font-bold'
                              : i === 2
                              ? 'bg-amber-700/20 border border-amber-700/40 text-amber-500 font-bold'
                              : 'bg-bg-surface text-txt-muted border border-border-default'
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
                          <span className="font-mono font-bold text-emerald-400 text-[11px]">
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
      </section>

      {comparison.length > 1 && (
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
      )}

      {!canViewReports && (
        <div className="flex items-center gap-2 text-xs text-txt-muted pt-2">
          <XCircle className="w-4 h-4" />
          ملاحظة: بعض التقارير المتقدمة مخصصة للمديرين والمالك فقط.
        </div>
      )}
    </div>
  );
};

export default DashboardPage;