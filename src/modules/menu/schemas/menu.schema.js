import { z } from 'zod';

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, 'اسم التصنيف يجب أن يكون حرفين على الأقل'),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0, 'ترتيب العرض يجب أن يكون رقمًا موجبًا').default(0),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const productFormSchema = z.object({
  categoryId: z.string().min(1, 'يرجى اختيار التصنيف الخاص بالمنتج'),
  name: z.string().trim().min(2, 'اسم المنتج يجب أن يكون حرفين على الأقل'),
  description: z.string().optional(),
  price: z.coerce.number({ invalid_type_error: 'يرجى إدخال سعر صحيح' }).positive('سعر المنتج يجب أن يكون أكبر من 0'),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: 'يرجى إدخال رابط صورة صحيح (URL)',
    }),
  isAvailable: z.boolean().default(true),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const modifierFormSchema = z.object({
  name: z.string().trim().min(2, 'اسم الإضافة يجب أن يكون حرفين على الأقل'),
  priceDelta: z.coerce.number({ invalid_type_error: 'يرجى إدخال رقم صحيح' }).min(0, 'سعر الإضافة لا يمكن أن يكون بالسالب').default(0),
  isRequired: z.boolean().default(false),
});
