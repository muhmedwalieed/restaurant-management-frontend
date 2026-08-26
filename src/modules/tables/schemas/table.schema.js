import { z } from 'zod';

export const tableFormSchema = z.object({
  label: z.string().trim().min(1, 'اسم/رقم الترابيزة مطلوب'),
  capacity: z.coerce.number().int().min(1, 'السعة يجب أن تكون رقمًا موجبًا').default(2),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE']).default('AVAILABLE'),
});

export const TABLE_STATUS_LABELS = {
  AVAILABLE: 'متاحة',
  OCCUPIED: 'مشغولة',
  RESERVED: 'محجوزة',
  MAINTENANCE: 'صيانة',
};

export const TABLE_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'متاحة' },
  { value: 'OCCUPIED', label: 'مشغولة' },
  { value: 'RESERVED', label: 'محجوزة' },
  { value: 'MAINTENANCE', label: 'صيانة' },
];
