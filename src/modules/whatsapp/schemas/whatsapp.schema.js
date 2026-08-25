import { z } from 'zod';

export const connectConnectionSchema = z.object({
  provider: z.enum(['META', 'MOCK']).default('META'),
  providerAccountId: z.string().min(1, 'Account ID مطلوب'),
  providerPhoneNumberId: z.string().min(1, 'Phone Number ID مطلوب'),
  displayName: z.string().optional(),
  webhookSecret: z.string().min(16, 'الـsecret يجب أن يكون 16 حرفًا على الأقل').optional(),
});

export const sendMessageSchema = z.object({
  to: z.string().min(3, 'رقم الهاتف مطلوب').max(30),
  text: z.string().min(1, 'نص الرسالة مطلوب').max(4096),
  type: z.enum(['TEXT', 'MEDIA']).default('TEXT'),
});

export const CONNECTION_STATUS_LABELS = {
  ACTIVE: 'متصل',
  DISCONNECTED: 'غير متصل',
  FAILED: 'فشل',
};

export const connectionStatusPill = (status) => {
  const map = { ACTIVE: 'success', DISCONNECTED: 'neutral', FAILED: 'danger' };
  return map[status] || 'neutral';
};

export const MESSAGE_STATUS_LABELS = {
  PENDING: 'قيد الإرسال',
  SENT: 'تم الإرسال',
  DELIVERED: 'تم التوصيل',
  READ: 'مقروءة',
  FAILED: 'فشل',
};

export const messageStatusPill = (status) => {
  const map = { PENDING: 'neutral', SENT: 'neutral', DELIVERED: 'success', READ: 'success', FAILED: 'danger' };
  return map[status] || 'neutral';
};

export const PROVIDER_LABELS = {
  META: 'Meta Cloud API',
  MOCK: 'Mock (اختباري)',
};
