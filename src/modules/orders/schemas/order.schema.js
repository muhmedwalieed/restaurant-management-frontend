import { z } from 'zod';

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'اختر منتجًا'),
  quantity: z.coerce.number().int().min(1, 'الكمية يجب أن تكون 1 على الأقل').default(1),
});

export const orderFormSchema = z
  .object({
    type: z.enum(['DINE_IN', 'DELIVERY', 'PICKUP']).default('DINE_IN'),
    tableId: z.string().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(orderItemSchema).min(1, 'أضف صنفًا واحدًا على الأقل'),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'DELIVERY') {
      if (!data.customerName?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['customerName'], message: 'اسم العميل مطلوب للتوصيل' });
      }
      if (!data.customerPhone?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['customerPhone'], message: 'رقم هاتف العميل مطلوب للتوصيل' });
      }
      if (!data.address?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['address'], message: 'عنوان التوصيل مطلوب' });
      }
    }
  });

export const updateOrderStatusSchema = z.object({
  newStatus: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED']),
  expectedVersion: z.coerce.number().int().min(1, 'expectedVersion مطلوب'),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(1, 'سبب الإلغاء مطلوب'),
  expectedVersion: z.coerce.number().int().min(1, 'expectedVersion مطلوب'),
});

export const posOrderSchema = z
  .object({
    type: z.enum(['DINE_IN', 'DELIVERY', 'PICKUP']).default('DINE_IN'),
    tableId: z.string().optional(),
    customerPhone: z.string().optional(),
    customerName: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(orderItemSchema).min(1, 'أضف صنفًا واحدًا على الأقل'),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'DELIVERY') {
      if (!data.customerName?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['customerName'], message: 'اسم العميل مطلوب للتوصيل' });
      }
      if (!data.customerPhone?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['customerPhone'], message: 'رقم هاتف العميل مطلوب للتوصيل' });
      }
      if (!data.address?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['address'], message: 'عنوان التوصيل مطلوب' });
      }
    }
  });

export const paymentSchema = z.object({
  paymentMethod: z.enum(['CASH', 'CARD', 'ONLINE']),
  amount: z.coerce.number().positive('المبلغ يجب أن يكون موجبًا').optional(),
  expectedVersion: z.coerce.number().int().min(1, 'expectedVersion مطلوب'),
});

export const refundSchema = z.object({
  reason: z.string().min(1, 'سبب الاسترداد مطلوب'),
  expectedVersion: z.coerce.number().int().min(1, 'expectedVersion مطلوب'),
});

export const PAYMENT_METHOD_LABELS = {
  CASH: 'كاش',
  CARD: 'بطاقة',
  ONLINE: 'أونلاين',
};

export const PAYMENT_METHOD_OPTIONS = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const PAYMENT_STATUS_LABELS = {
  PENDING: 'قيد الانتظار',
  PAID: 'مدفوع',
  FAILED: 'فشل',
  REFUNDED: 'مسترجع',
};

export const paymentStatusPill = (status) => {
  const map = { PENDING: 'neutral', PAID: 'success', FAILED: 'danger', REFUNDED: 'warning' };
  return map[status] || 'neutral';
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
    CONFIRMED: 'info',
    PREPARING: 'warning',
    READY: 'success',
    OUT_FOR_DELIVERY: 'info',
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