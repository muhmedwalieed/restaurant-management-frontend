import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useKdsOrdersQuery, useUpdateKdsStatusMutation } from '../hooks/useOrders.js';
import { Button } from '../../../shared/components/Button.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import {
  ORDER_SOURCE_LABELS,
  ORDER_TYPE_LABELS,
  orderSourcePill,
} from '../schemas/order.schema.js';
import { ChefHat, Clock, Timer, ArrowLeftRight, Grid3x3, StickyNote } from 'lucide-react';

const getUrgencyClasses = (minutes = 0) => {
  if (minutes < 10) {
    return {
      text: 'text-status-success',
      badge: 'bg-status-success-bg text-status-success border-status-success/30',
      border: 'border-border-default hover:border-status-success/40',
    };
  }
  if (minutes < 20) {
    return {
      text: 'text-status-warning',
      badge: 'bg-status-warning-bg text-status-warning border-status-warning/40',
      border: 'border-status-warning/40',
    };
  }
  return {
    text: 'text-status-danger',
    badge: 'bg-status-danger-bg text-status-danger border-status-danger/50',
    border: 'border-status-danger/60 ring-1 ring-status-danger/30',
  };
};

export const KdsPage = () => {
  const navigate = useNavigate();
  const { activeBranchId, activeBranch } = useBranch();
  const [filter, setFilter] = useState('ALL');
  const { data: kdsResponse, isLoading, isError, refetch } = useKdsOrdersQuery(activeBranchId, {
    status: filter === 'ALL' ? undefined : filter,
  });
  const advanceMutation = useUpdateKdsStatusMutation();

  const orders = kdsResponse?.items || [];
  const [errorMsg, setErrorMsg] = useState(null);

  const handleAdvance = async (order) => {
    setErrorMsg(null);
    const newStatus = order.status === 'CONFIRMED' ? 'PREPARING' : 'READY';
    try {
      await advanceMutation.mutateAsync({
        branchId: activeBranchId,
        orderId: order.id,
        payload: { newStatus, expectedVersion: order.version },
      });
    } catch (err) {
      setErrorMsg(err?.message || 'حدث خطأ أثناء تحديث الحالة.');
    }
  };

  const buttonLabel = (status) => (status === 'CONFIRMED' ? 'بدء التحضير' : 'جاهز للتقديم');

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-brand-primary" />
            <span>شاشة المطبخ (KDS)</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            الطلبات النشطة للمطبخ، {activeBranch?.name || ''} (تحديث لحظي تلقائي)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={ArrowLeftRight} onClick={() => refetch()}>
            تحديث
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>
            كل الطلبات
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-md text-xs font-semibold bg-status-danger-bg text-status-danger border border-status-danger/30">
          {errorMsg}
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        {['ALL', 'CONFIRMED', 'PREPARING'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full font-bold transition-all text-xs cursor-pointer ${
              filter === s
                ? 'bg-brand-primary text-txt-inverted shadow-xs'
                : 'bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated'
            }`}
          >
            {s === 'ALL' ? 'كل الطلبات' : s === 'CONFIRMED' ? 'جديد (مؤكد)' : 'قيد التحضير'}
          </button>
        ))}
      </div>

      {!activeBranchId ? (
        <EmptyState title="لا يوجد فرع نشط" description="اختر فرعًا لعرض طلبات المطبخ." icon={ChefHat} />
      ) : isLoading ? (
        <p className="text-sm text-txt-muted">جاري تحميل الطلبات...</p>
      ) : isError ? (
        <div className="p-4 bg-status-danger-bg border border-status-danger/30 rounded-md text-xs text-status-danger text-center">
          تعذر تحميل طلبات المطبخ.
          <Button size="sm" variant="outline" className="mr-2" onClick={() => refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="لا توجد طلبات نشطة حالياً"
          description="المطبخ جاهز، ستظهر الطلبات المؤكدة والجديدة هنا لحظياً."
          icon={ChefHat}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => {
            const urgency = getUrgencyClasses(order.elapsedMinutes);

            return (
              <div
                key={order.id}
                className={`bg-bg-surface border rounded-lg p-4 space-y-3 transition-all duration-150 ${urgency.border}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-txt-primary text-sm">
                      #{order.orderNumber}
                    </span>
                    <StatusPill status={order.status === 'CONFIRMED' ? 'info' : 'warning'}>
                      {order.status === 'CONFIRMED' ? 'جديد' : 'قيد التحضير'}
                    </StatusPill>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border ${urgency.badge}`}
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span>{order.elapsedMinutes || 0} د</span>
                  </span>
                </div>

                {/* Metadata / Channel */}
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  {order.tableLabel && (
                    <span className="flex items-center gap-1 font-bold text-txt-primary">
                      <Grid3x3 className="w-3.5 h-3.5 text-brand-primary" />
                      طاولة {order.tableLabel}
                    </span>
                  )}
                  <StatusPill status={orderSourcePill(order.source)}>
                    {ORDER_SOURCE_LABELS[order.source] || order.source}
                  </StatusPill>
                  <span className="text-txt-muted text-[11px] font-medium">
                    {ORDER_TYPE_LABELS[order.type] || order.type}
                  </span>
                </div>

                {/* Items list */}
                <div className="space-y-1.5">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 bg-bg-surface-elevated border border-border-default rounded-md px-3 py-2"
                    >
                      <span className="text-xs font-semibold text-txt-primary">
                        <span className="font-mono font-bold text-brand-primary">
                          {item.quantity}x
                        </span>{' '}
                        {item.productName}
                      </span>
                      {item.notes && (
                        <span className="text-xs text-txt-muted truncate max-w-[120px]">
                          ({item.notes})
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <p className="text-xs text-txt-muted bg-bg-surface-elevated border border-border-default rounded-md px-2.5 py-1.5 flex items-center gap-1.5">
                    <StickyNote className="w-3.5 h-3.5 shrink-0 text-status-warning" />
                    <span>{order.notes}</span>
                  </p>
                )}

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-default">
                  <span className="flex items-center gap-1 text-xs text-txt-muted font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleTimeString('ar-EG', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <PermissionGate permission="orders.update">
                    <Button
                      variant={order.status === 'CONFIRMED' ? 'primary' : 'success'}
                      size="sm"
                      isLoading={advanceMutation.isPending}
                      onClick={() => handleAdvance(order)}
                    >
                      {buttonLabel(order.status)}
                    </Button>
                  </PermissionGate>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
