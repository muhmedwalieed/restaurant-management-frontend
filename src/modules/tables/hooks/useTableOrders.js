import { useQuery } from '@tanstack/react-query';
import { getOrdersApi } from '../../../lib/api/orders.api.js';

export const useTableActiveOrdersQuery = (branchId, tableId) => {
  return useQuery({
    queryKey: ['table-orders', branchId, tableId],
    queryFn: async () => {
      const res = await getOrdersApi(branchId, {
        page: 1,
        limit: 20,
        tableId,
      });
      const all = res?.items || [];
      const activeStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'];
      return all.filter((o) => activeStatuses.includes(o.status));
    },
    enabled: Boolean(branchId && tableId),
  });
};

export const ORDER_STATUS_LABELS = {
  PENDING: 'قيد الانتظار',
  CONFIRMED: 'مؤكد',
  PREPARING: 'قيد التحضير',
  READY: 'جاهز',
  OUT_FOR_DELIVERY: 'في الطريق',
  DELIVERED: 'تم التسليم',
  CANCELLED: 'ملغي',
};

export const orderStatusPill = (status) => {
  const map = {
    PENDING: 'neutral',
    CONFIRMED: 'warning',
    PREPARING: 'warning',
    READY: 'success',
    OUT_FOR_DELIVERY: 'warning',
    DELIVERED: 'success',
    CANCELLED: 'danger',
  };
  return map[status] || 'neutral';
};
