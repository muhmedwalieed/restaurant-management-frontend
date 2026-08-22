import { z } from 'zod';

export const couponFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, 'كود الكوبون لا يقل عن 3 أحرف')
      .max(50, 'كود الكوبون لا يزيد عن 50 حرف')
      .regex(/^[A-Za-z0-9_-]+$/, 'الكود مسموح فيه أحرف وأرقام و - و _ فقط'),
    type: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
    value: z.coerce.number({ invalid_type_error: 'أدخل قيمة صحيحة' }).positive('القيمة يجب أن تكون أكبر من 0'),
    minSubtotal: z.coerce.number({ invalid_type_error: 'أدخل رقم صحيح' }).min(0, 'الحد الأدنى لا يكون بالسالب').default(0),
    maxDiscount: z.coerce.number().positive().optional().nullable(),
    usageLimit: z.coerce.number().int().positive().optional().nullable(),
    startsAt: z.string().optional().nullable(),
    expiresAt: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'PERCENTAGE' && data.value > 100) {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'نسبة الخصم لا تزيد عن 100%' });
    }
  });

export const couponQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isActive: z.enum(['true', 'false']).optional(),
  type: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  q: z.string().optional(),
});