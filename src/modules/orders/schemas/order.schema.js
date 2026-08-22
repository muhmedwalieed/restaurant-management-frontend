import { z } from 'zod';

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'اختر منتجًا'),
  quantity: z.coerce.number().int().min(1, 'الكمية يجب أن تكون 1 على الأقل').default(1),
});

export const orderFormSchema = z.object({
  type: z.enum(['DINE_IN', 'DELIVERY', 'PICKUP']).default('DINE_IN'),
  tableId: z.string().optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'أضف صنفًا واحدًا على الأقل'),
});

export const updateOrderStatusSchema = z.object({
  newStatus: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED']),
  expectedVersion: z.coerce.number().int().min(1, 'expectedVersion مطلوب'),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(1, 'سبب الإلغاء مطلوب'),
  expectedVersion: z.coerce.number().int().min(1, 'expectedVersion مطلوب'),
});

export const ORDER_STATUS_LABELS = {
  PENDING: 'قيد الانتظار',
  CONFIRMED: 'مؤكد',
  PREPARING: 'قيد التحضير',
  READY: 'جاهز',
  OUT_FOR_DELIVERY: 'في الطريق',
  DELIVERED: 'تم التسليم',
  CANCELLED: 'ملغي',
};

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const ORDER_TYPE_LABELS = {
  DINE_IN: 'داخل المطعم',
  DELIVERY: 'توصيل',
  PICKUP: 'استلام',
};

export const ORDER_TYPE_OPTIONS = Object.entries(ORDER_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const ORDER_SOURCE_LABELS = {
  WHATSAPP: 'واتساب',
  QR: 'QR',
  WEBSITE: 'موقع',
  CASHIER: 'كاشير',
  PHONE: 'هاتف',
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

/**
 * Valid next statuses per the backend state machine (Section 25.1)
 * DINE_IN / PICKUP: PENDING→CONFIRMED→PREPARING→READY→DELIVERED
 * DELIVERY: READY→OUT_FOR_DELIVERY→DELIVERED
 */
export function nextStatuses(currentStatus, orderType) {
  if (currentStatus === 'PENDING') return ['CONFIRMED'];
  if (currentStatus === 'CONFIRMED') return ['PREPARING'];
  if (currentStatus === 'PREPARING') return ['READY'];
  if (currentStatus === 'READY') {
    return orderType === 'DELIVERY' ? ['OUT_FOR_DELIVERY'] : ['DELIVERED'];
  }
  if (currentStatus === 'OUT_FOR_DELIVERY') return ['DELIVERED'];
  return [];
}