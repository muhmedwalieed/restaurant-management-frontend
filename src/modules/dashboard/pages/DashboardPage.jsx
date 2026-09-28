import { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Calendar,
  XCircle,
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
import { Select } from '../../../shared/components/Select.jsx';

import { DashboardStatsCards } from '../components/DashboardStatsCards.jsx';
import { DashboardSalesChart } from '../components/DashboardSalesChart.jsx';
import { DashboardChannelDistribution } from '../components/DashboardChannelDistribution.jsx';
import { DashboardRecentOrders } from '../components/DashboardRecentOrders.jsx';
import { DashboardTopProducts } from '../components/DashboardTopProducts.jsx';
import { DashboardBranchComparison } from '../components/DashboardBranchComparison.jsx';

const calcGrowth = (current, previous) => {
  const c = Number(current || 0);
  const p = Number(previous || 0);
  if (p === 0) return null;
  return ((c - p) / p) * 100;
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
  const rawComparison = comparisonQuery.data;
  const recentOrders = recentOrdersQuery.data?.items || [];

  // No hardcoded name filtering - display all actual branches from backend
  const comparison = useMemo(
    () => (rawComparison || []).filter((b) => Boolean(b && b.branchName)),
    [rawComparison]
  );

  const totalWeeklyRevenue = trend.reduce((sum, t) => sum + Number(t.revenue || 0), 0);
  const maxRevenue = Math.max(...trend.map((t) => Number(t.revenue || 0)), 1);
  const totalChannelsOrders = channels.reduce((sum, c) => sum + Number(c.orders || 0), 0);
  const canViewReports = hasPermission('dashboard.view');

  const topProducts = summary?.topProducts || [];
  const maxSold = Math.max(...topProducts.map((p) => Number(p.quantitySold || 0)), 1);
  const activeOrdersCount = summary?.activeOrders ?? 0;

  const growthStats = useMemo(() => {
    if (trend.length < 2) return { ordersToday: null, revenueToday: null, weeklyRevenue: null, avgOrderValue: null };

    const today = trend[trend.length - 1];
    const yesterday = trend[trend.length - 2];

    const ordersToday = calcGrowth(
      today?.orders ?? summary?.ordersToday,
      yesterday?.orders
    );

    const revenueToday = calcGrowth(
      today?.revenue ?? summary?.revenueToday,
      yesterday?.revenue
    );

    const last3Rev = trend.slice(-3).reduce((s, d) => s + Number(d.revenue || 0), 0);
    const prev3Rev = trend.slice(-6, -3).reduce((s, d) => s + Number(d.revenue || 0), 0);
    const weeklyRevenue = calcGrowth(last3Rev, prev3Rev);

    const todayAvg = today?.orders > 0 ? Number(today.revenue || 0) / Number(today.orders) : null;
    const yestAvg = yesterday?.orders > 0 ? Number(yesterday.revenue || 0) / Number(yesterday.orders) : null;
    const avgOrderValue = todayAvg !== null && yestAvg !== null ? calcGrowth(todayAvg, yestAvg) : null;

    return { ordersToday, revenueToday, weeklyRevenue, avgOrderValue };
  }, [trend, summary]);

  const chartPoints = useMemo(() => {
    return trend.map((day, i) => {
      const rev = Number(day.revenue || 0);
      const x = 65 + (i * 435) / 6;
      const y = 130 - (rev / maxRevenue) * 105;
      return { ...day, x, y, rev, dayLabel: formatDayLabel(day.date) };
    });
  }, [trend, maxRevenue]);

  const { linePath, areaPath } = useMemo(
    () => generateSvgPaths(chartPoints, 130),
    [chartPoints]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
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

      {/* 1. KPIs Section */}
      <DashboardStatsCards
        isLoading={summaryQuery.isLoading}
        summary={summary}
        growthStats={growthStats}
        activeOrdersCount={activeOrdersCount}
      />

      {/* 2. Charts & Channel Distribution */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <DashboardSalesChart
          isLoading={trendQuery.isLoading}
          trend={trend}
          totalWeeklyRevenue={totalWeeklyRevenue}
          maxRevenue={maxRevenue}
          growthStats={growthStats}
          chartPoints={chartPoints}
          linePath={linePath}
          areaPath={areaPath}
        />
        <DashboardChannelDistribution
          isLoading={channelsQuery.isLoading}
          channels={channels}
          totalChannelsOrders={totalChannelsOrders}
        />
      </section>

      {/* 3. Recent Orders & Top Products */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <DashboardRecentOrders
          isLoading={recentOrdersQuery.isLoading}
          recentOrders={recentOrders}
        />
        <DashboardTopProducts
          topProducts={topProducts}
          maxSold={maxSold}
        />
      </section>

      {/* 4. Branch Comparison (All real branches from backend) */}
      <DashboardBranchComparison comparison={comparison} />

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
