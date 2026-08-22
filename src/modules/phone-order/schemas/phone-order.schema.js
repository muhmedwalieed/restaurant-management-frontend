import { z } from 'zod';

export const phoneLookupSchema = z.object({
  phone: z.string().trim().min(3, 'رقم الهاتف مطلوب'),
});

export const phoneOrderItemSchema = z.object({
  productId: z.string().min(1, 'اختر منتجًا'),
  quantity: z.coerce.number().int().min(1, 'الكمية 1 على الأقل').default(1),
});

export const phoneOrderSchema = z.object({
  type: z.enum(['DELIVERY', 'PICKUP']).default('DELIVERY'),
  customerPhone: z.string().min(3, 'رقم هاتف العميل مطلوب'),
  customerName: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(phoneOrderItemSchema).min(1, 'أضف صنفًا واحدًا على الأقل'),
});