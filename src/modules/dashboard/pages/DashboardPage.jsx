import { LayoutDashboard, TrendingUp, ShoppingBag, CheckCircle2, XCircle, Store, ChefHat } from 'lucide-react';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import {
  useDashboardSummaryQuery,
  useChannelStatsQuery,
  useSalesTrendQuery,
  useBranchComparisonQuery,
  useOrderStatusStatsQuery,
} from '../hooks/useDashboard.js';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';

const formatMoney = (v) => {
  const n = Number(v || 0);
  return `${n.toLocaleString('ar-EG')} ج.م`;
};

// Section 6.9 — status color per state (semantic, not decoration)
const STATUS_PILL = {
  DELIVERED: { status: 'success', label: 'تم التسليم' },
  OUT_FOR_DELIVERY: { status: 'info', label: 'في الطريق' },
  READY: { status: 'info', label: 'جاهز' },
  PREPARING: { status: 'warning', label: 'قيد التحضير' },
  CONFIRMED: { status: 'warning', label: 'مؤكد' },
  PENDING: { status: 'warning', label: 'قيد الانتظار' },
  CANCELLED: { status: 'danger', label: 'ملغي' },
};

const OPERATIONAL_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'];

export const DashboardPage = () => {
  const { activeBranchId } = useBranch();
  const { hasPermission } = useAuth();

  const summaryQuery = useDashboardSummaryQuery(activeBranchId);
  const channelsQuery = useChannelStatsQuery(activeBranchId);
  const trendQuery = useSalesTrendQuery(activeBranchId);
  const statusQuery = useOrderStatusStatsQuery(activeBranchId);
  const comparisonQuery = useBranchComparisonQuery();

  const summary = summaryQuery.data;
  const channels = channelsQuery.data || [];
  const trend = trendQuery.data || [];
  const statusStats = statusQuery.data;
  const comparison = comparisonQuery.data || [];

  // Operational issues first (Section 6.7): what needs attention right now.
  const byStatus = Object.fromEntries((statusStats?.byStatus || []).map((s) => [s.status, s.orders]));
  const activeByStatus = OPERATIONAL_STATUSES.map((status) => ({ status, count: byStatus[status] || 0 }));

  const maxRevenue = Math.max(...trend.map((t) => t.revenue), 1);
  const totalChannels = channels.reduce((sum, c) => sum + c.orders, 0);
  const canViewReports = hasPermission('dashboard.view');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-brand-primary" />
            <span>لوحة التحكم</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">نظرة تشغيلية على أداء الفرع الحالي — بتتحدث كل دقيقة</p>
        </div>
      </div>

      {!canViewReports && (
        <div className="bg-bg-surface border border-border-default rounded-lg p-4 text-sm text-txt-muted">
          مش عندك صلاحية dashboard.view — لوحة التحكم الكاملة متاحة للمديرين فقط.
        </div>
      )}

      {/* Section A — Today's operational state (real numbers, not decorative KPIs) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} height={88} />)
        ) : (
          <>
            <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-1">
              <span className="text-[11px] text-txt-muted">طلبات اليوم</span>
              <div className="text-2xl font-bold text-txt-primary">{summary?.ordersToday ?? 0}</div>
              <span className="text-[11px] text-status-success">إجمالي الطلبات: {summary?.totalOrders ?? 0}</span>
            </div>
            <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-1">
              <span className="text-[11px] text-txt-muted">مبيعات اليوم</span>
              <div className="text-2xl font-bold text-txt-primary">{formatMoney(summary?.revenueToday)}</div>
              <span className="text-[11px] text-txt-muted">إجمالي: {formatMoney(summary?.revenue)}</span>
            </div>
            <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-1">
              <span className="text-[11px] text-txt-muted">أوردرات نشطة</span>
              <div className="text-2xl font-bold text-status-warning">{summary?.activeOrders ?? 0}</div>
              <span className="text-[11px] text-txt-muted">ترابيزات مشغولة: {summary?.occupiedTables ?? 0}</span>
            </div>
            <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-1">
              <span className="text-[11px] text-txt-muted">متوسط قيمة الطلب</span>
              <div className="text-2xl font-bold text-txt-primary">{formatMoney(summary?.averageOrderValue)}</div>
              <span className="text-[11px] text-status-success">مدفوع: {formatMoney(summary?.paidRevenue)}</span>
            </div>
          </>
        )}
      </section>

      {/* Operational attention queue */}
      <section className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-brand-primary" />
          <span>الوضع التشغيلي — إيه اللي محتاج اهتمام دلوقتي</span>
        </h2>
        {statusQuery.isLoading ? (
          <LoadingSkeleton height={44} />
        ) : (
          <div className="flex flex-wrap gap-2">
            {activeByStatus.map(({ status, count }) => (
              <div key={status} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border-default">
                <StatusPill status={STATUS_PILL[status].status}>{STATUS_PILL[status].label}</StatusPill>
                <span className={`text-lg font-bold ${count > 0 ? 'text-status-warning' : 'text-txt-muted'}`}>{count}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section B — Sales trend (answers: is revenue growing?) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-primary" />
              <span>اتجاه المبيعات (آخر 7 أيام)</span>
            </h2>
          </div>
          {trendQuery.isLoading ? (
            <LoadingSkeleton height={180} />
          ) : trend.length === 0 ? (
            <EmptyState title="لا توجد بيانات مبيعات" description="هتظهر بيانات المبيعات هنا أول ما تبدأ تستقبل أوردرات." />
          ) : (
            <div className="flex items-end gap-2 h-44">
              {trend.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <span className="text-[10px] text-txt-muted truncate" title={formatMoney(day.revenue)}>
                    {formatMoney(day.revenue)}
                  </span>
                  <div
                    className="w-full bg-brand-primary/70 rounded-sm transition-all"
                    style={{ height: `${Math.max(4, (day.revenue / maxRevenue) * 120)}px` }}
                    title={`${day.date}: ${day.orders} طلب — ${formatMoney(day.revenue)}`}
                  />
                  <span className="text-[10px] text-txt-muted">{day.orders} طلب</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section C — Channel stats */}
        <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-primary" />
            <span>القنوات (المصادر)</span>
          </h2>
          {channelsQuery.isLoading ? (
            <LoadingSkeleton height={180} />
          ) : (
            <div className="space-y-2">
              {channels.map((c) => (
                <div key={c.source} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-txt-primary">{c.source}</span>
                    <span className="text-[10px] text-txt-muted">{Math.round((c.orders / Math.max(totalChannels, 1)) * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-txt-muted">{c.orders} طلب</span>
                    <span className="text-xs font-bold text-txt-primary">{formatMoney(c.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section D — Branch comparison */}
      {comparison.length > 1 && (
        <section className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2">
            <Store className="w-4 h-4 text-brand-primary" />
            <span>مقارنة الفروع</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-txt-muted border-b border-border-default">
                  <th className="text-right py-2 px-2 font-semibold">الفرع</th>
                  <th className="text-right py-2 px-2 font-semibold">الطلبات</th>
                  <th className="text-right py-2 px-2 font-semibold">الإيراد</th>
                  <th className="text-right py-2 px-2 font-semibold">المدفوع</th>
                  <th className="text-right py-2 px-2 font-semibold">متوسط الطلب</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((b) => (
                  <tr key={b.branchId} className="border-b border-border-subtle last:border-0">
                    <td className="py-2 px-2 font-semibold text-txt-primary">
                      {b.branchName}
                      {b.isMain && <span className="mr-2 text-[10px] text-brand-primary font-bold">رئيسي</span>}
                    </td>
                    <td className="py-2 px-2">{b.orders}</td>
                    <td className="py-2 px-2 font-bold">{formatMoney(b.revenue)}</td>
                    <td className="py-2 px-2">{formatMoney(b.paidRevenue)}</td>
                    <td className="py-2 px-2">{formatMoney(b.averageOrderValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Top products */}
      {summary?.topProducts?.length > 0 && (
        <section className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-primary" />
            <span>أعلى المنتجات مبيعًا</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {summary.topProducts.map((p, i) => (
              <div key={p.productName} className="flex items-center justify-between px-3 py-2 rounded-md border border-border-default">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-bold text-txt-muted w-4">{i + 1}</span>
                  <span className="text-xs font-semibold text-txt-primary truncate">{p.productName}</span>
                </div>
                <span className="text-xs text-txt-muted whitespace-nowrap">{p.quantitySold} ×</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {!canViewReports && (
        <div className="flex items-center gap-2 text-xs text-txt-muted">
          <XCircle className="w-4 h-4" />
          بعض المقاطع متاحة للمديرين فقط — تواصل مع المالك للصلاحيات الكاملة.
        </div>
      )}
    </div>
  );
};

export default DashboardPage;