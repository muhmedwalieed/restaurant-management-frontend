import { z } from 'zod';

export const TICKET_STATUS_LABELS = {
  WAITING: 'بانتظار موظف',
  ACTIVE: 'قيد المتابعة',
  PENDING: 'بانتظار العميل',
  RESOLVED: 'تم الحل',
  CLOSED: 'مغلقة',
};

export const ticketStatusPill = (status) => {
  switch (status) {
    case 'WAITING':
      return 'warning';
    case 'ACTIVE':
      return 'info';
    case 'PENDING':
      return 'neutral';
    case 'RESOLVED':
      return 'success';
    case 'CLOSED':
      return 'danger';
    default:
      return 'neutral';
  }
};

export const TICKET_TYPE_LABELS = {
  ORDER: 'طلب طعام',
  SUPPORT: 'دعم فني',
  COMPLAINT: 'شكوى أوردر',
  INQUIRY: 'استفسار عام',
};

export const ticketTypeBadgeClass = (type) => {
  switch (type) {
    case 'COMPLAINT':
      return 'bg-status-danger-bg text-status-danger border-status-danger/30';
    case 'SUPPORT':
      return 'bg-status-info-bg text-status-info border-status-info/30';
    case 'ORDER':
      return 'bg-brand-primary/10 text-brand-primary border-brand-primary/30';
    case 'INQUIRY':
      return 'bg-bg-surface-elevated text-txt-muted border-border-default';
    default:
      return 'bg-bg-base text-txt-muted border-border-default';
  }
};

export const RESOLUTION_STATUS_LABELS = {
  RESOLVED: 'تم الحل بنجاح',
  UNRESOLVED: 'لم يتم الحل / تعذر الوصول للعميل',
  CANCELLED: 'إلغاء التذكرة',
};

export const RESOLUTION_CATEGORY_LABELS = {
  LATE_DELIVERY: 'تأخر وقت التوصيل',
  FOOD_QUALITY: 'جودة الطعام والتحضير',
  WRONG_ITEM: 'طلب غير مكتمل / صنف خاطئ',
  PAYMENT_ISSUE: 'مشكلة في الدفع / الحساب',
  GENERAL_INQUIRY: 'استفسار عام / معلومات',
  OTHER: 'سبب آخر',
};

export const createTicketSchema = z.object({
  customerPhone: z
    .string()
    .min(3, 'رقم الهاتف مطلوب')
    .max(30, 'رقم الهاتف طويل جداً'),
  ticketType: z.enum(['SUPPORT', 'COMPLAINT', 'ORDER', 'INQUIRY']).default('SUPPORT'),
  subject: z.string().max(255, 'العنوان طويل جداً').optional(),
  initialMessage: z.string().optional(),
});

export const closeTicketFormSchema = z.object({
  resolutionStatus: z.enum(['RESOLVED', 'UNRESOLVED', 'CANCELLED']).default('RESOLVED'),
  resolutionCategory: z.enum([
    'LATE_DELIVERY',
    'FOOD_QUALITY',
    'WRONG_ITEM',
    'PAYMENT_ISSUE',
    'GENERAL_INQUIRY',
    'OTHER',
  ]).default('GENERAL_INQUIRY'),
  resolutionNotes: z.string().max(2000, 'الملاحظات طويلة جداً').optional(),
});
