import { z } from 'zod';

export const CONVERSATION_STATUS_LABELS = {
  ACTIVE: 'نشطة',
  WAITING_AGENT: 'بانتظار موظف',
  CLOSED: 'مغلقة',
};

export const conversationStatusPill = (status) => {
  const map = { ACTIVE: 'success', WAITING_AGENT: 'warning', CLOSED: 'neutral' };
  return map[status] || 'neutral';
};

export const CONVERSATION_STATE_LABELS = {
  WELCOME: 'ترحيب',
  MAIN_MENU: 'القائمة الرئيسية',
  MENU_CATEGORY: 'اختيار فئة',
  PRODUCT_SELECT: 'اختيار منتج',
  CART: 'السلة',
  ADDRESS: 'إدخال العنوان',
  CONFIRM_ORDER: 'تأكيد الطلب',
  TRACKING: 'تتبع الطلب',
  FAQ: 'الأسئلة الشائعة',
  HUMAN_HANDOFF: 'تحويل لموظف',
};

export const CONVERSATION_STATUS_OPTIONS = Object.entries(CONVERSATION_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const conversationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['ACTIVE', 'WAITING_AGENT', 'CLOSED']).optional(),
});