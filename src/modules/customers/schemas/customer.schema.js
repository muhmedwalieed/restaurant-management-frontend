import { z } from 'zod';

export const customerFormSchema = z.object({
  firstName: z.string().trim().min(2, 'الاسم الأول يجب أن يكون حرفين على الأقل'),
  lastName: z.string().trim().optional(),
  phone: z.string().trim().min(3, 'رقم الهاتف مطلوب'),
  phones: z.array(z.string().trim()).optional(),
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