import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useKdsOrdersQuery, useUpdateKdsStatusMutation } from '../hooks/useOrders.js';
import { Button } from '../../../shared/components/Button.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { ORDER_SOURCE_LABELS } from '../schemas/order.schema.js';
import { ChefHat, Clock, Timer, ArrowLeftRight, Grid3x3 } from 'lucide-react';

const elapsedColor = (minutes) => {
  if (minutes < 10) return 'text-status-success';
  if (minutes < 20) return 'text-status-warning';
  return 'text-status-danger';
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

  const buttonLabel = (status) => (status === 'CONFIRMED' ? 'بدء التحضير' : 'جاهز');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-brand-primary" />
            <span>شاشة المطبخ (KDS)</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            الأوردرات النشطة للمطبخ — {activeBranch?.name || ''} (يتحدث تلقائيًا)
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
        <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30">
          {errorMsg}
        </div>
      )}

      {/* Status filter */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        {['ALL', 'CONFIRMED', 'PREPARING'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full font-bold transition-colors ${
              filter === s ? 'bg-brand-primary text-white' : 'bg-bg-surface border border-border-default text-txt-muted'
            }`}
          >
            {s === 'ALL' ? 'الكل' : s === 'CONFIRMED' ? 'جديد (مؤكد)' : 'قيد التحضير'}
          </button>
        ))}
      </div>

      {!activeBranchId ? (
        <EmptyState title="لا يوجد فرع نشط" description="اختر فرعًا لعرض أوردرات المطبخ." icon={ChefHat} />
      ) : isLoading ? (
        <p className="text-sm text-txt-muted">جاري تحميل الأوردرات...</p>
      ) : isError ? (
        <div className="p-4 bg-status-danger/10 border border-status-danger/30 rounded-md text-xs text-status-danger text-center">
          تعذر تحميل أوردرات المطبخ.
          <Button size="sm" variant="outline" className="mr-2" onClick={() => refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <EmptyState title="لا توجد أوردرات نشطة" description="مطبخك نضيف — الأوردرات المؤكدة/قيد التحضير هيظهر هنا." icon={ChefHat} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`bg-bg-surface border rounded-xl p-4 space-y-3 ${
                order.status === 'PREPARING' ? 'border-status-warning/50' : 'border-border-default'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-txt-primary text-sm">#{order.orderNumber}</span>
                  <StatusPill status={order.status === 'CONFIRMED' ? 'neutral' : 'warning'}>
                    {order.status === 'CONFIRMED' ? 'جديد' : 'قيد التحضير'}
                  </StatusPill>
                </div>
                <span className={`flex items-center gap-1 text-sm font-bold ${elapsedColor(order.elapsedMinutes)}`}>
                  <Timer className="w-4 h-4" />
                  {order.elapsedMinutes} د
                </span>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 text-[11px] text-txt-muted">
                {order.tableLabel && (
                  <span className="flex items-center gap-1">
                    <Grid3x3 className="w-3.5 h-3.5 text-brand-primary" />
                    ترابيزة {order.tableLabel}
                  </span>
                )}
                <span>{ORDER_SOURCE_LABELS[order.source] || order.source}</span>
                <span>{order.type === 'DINE_IN' ? 'داخل المطعم' : order.type === 'DELIVERY' ? 'توصيل' : 'استلام'}</span>
              </div>

              {/* Items */}
              <div className="space-y-1.5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 bg-bg-base border border-border-subtle rounded-lg px-3 py-1.5">
                    <span className="text-xs font-semibold text-txt-primary">
                      <span className="font-mono font-bold text-brand-primary">{item.quantity}x</span> {item.productName}
                    </span>
                    {item.notes && <span className="text-[10px] text-txt-muted truncate max-w-[120px]">({item.notes})</span>}
                  </div>
                ))}
              </div>

              {order.notes && (
                <p className="text-[11px] text-txt-muted bg-bg-base border border-border-subtle rounded-md px-2 py-1">📝 {order.notes}</p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-subtle">
                <span className="flex items-center gap-1 text-[11px] text-txt-muted">
                  <Clock className="w-3 h-3" />
                  {new Date(order.createdAt).toLocaleTimeString('ar-EG')}
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
          ))}
        </div>
      )}
    </div>
  );
};