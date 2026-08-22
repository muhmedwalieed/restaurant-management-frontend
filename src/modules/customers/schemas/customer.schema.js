import { z } from 'zod';

export const customerFormSchema = z.object({
  name: z.string().trim().min(2, 'اسم العميل يجب أن يكون حرفين على الأقل'),
  phone: z.string().trim().min(3, 'رقم الهاتف مطلوب'),
  email: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'يرجى إدخال بريد إلكتروني صحيح',
    }),
  notes: z.string().optional(),
});

export const addressFormSchema = z.object({
  label: z.enum(['HOME', 'WORK', 'OTHER']).default('HOME'),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const ADDRESS_LABEL_OPTIONS = [
  { value: 'HOME', label: 'المنزل' },
  { value: 'WORK', label: 'العمل' },
  { value: 'OTHER', label: 'أخرى' },
];

export const ADDRESS_LABELS = {
  HOME: 'المنزل',
  WORK: 'العمل',
  OTHER: 'أخرى',
};