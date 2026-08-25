import { describe, it, expect } from 'vitest';
import { tableFormSchema, TABLE_STATUS_LABELS } from '../../src/modules/tables/schemas/table.schema.js';

describe('Module 5 Tables Schema', () => {
  it('should accept a valid table payload', () => {
    const result = tableFormSchema.safeParse({ label: 'T1', capacity: 4, status: 'AVAILABLE' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.label).toBe('T1');
      expect(result.data.capacity).toBe(4);
      expect(result.data.status).toBe('AVAILABLE');
    }
  });

  it('should coerce capacity string to number and default status to AVAILABLE', () => {
    const result = tableFormSchema.safeParse({ label: 'Table 2', capacity: '6' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.capacity).toBe(6);
      expect(result.data.status).toBe('AVAILABLE');
    }
  });

  it('should reject missing label', () => {
    const result = tableFormSchema.safeParse({ capacity: 2 });
    expect(result.success).toBe(false);
  });

  it('should reject invalid status', () => {
    const result = tableFormSchema.safeParse({ label: 'T1', status: 'BROKEN' });
    expect(result.success).toBe(false);
  });

  it('should reject capacity below 1', () => {
    const result = tableFormSchema.safeParse({ label: 'T1', capacity: 0 });
    expect(result.success).toBe(false);
  });

  it('should map all table statuses to Arabic labels', () => {
    expect(TABLE_STATUS_LABELS.AVAILABLE).toBe('متاحة');
    expect(TABLE_STATUS_LABELS.OCCUPIED).toBe('مشغولة');
    expect(TABLE_STATUS_LABELS.RESERVED).toBe('محجوزة');
    expect(TABLE_STATUS_LABELS.MAINTENANCE).toBe('صيانة');
  });
});
