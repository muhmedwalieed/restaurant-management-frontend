import { describe, it, expect } from 'vitest';
import { phoneOrderSchema, phoneLookupSchema } from '../../src/modules/phone-order/schemas/phone-order.schema.js';

describe('Module 14 Phone Order Schema', () => {
  it('should accept a valid phone order', () => {
    expect(phoneOrderSchema.safeParse({ type: 'DELIVERY', customerPhone: '+2010', items: [{ productId: 'p1', quantity: 1 }] }).success).toBe(true);
  });

  it('should reject missing customerPhone', () => {
    expect(phoneOrderSchema.safeParse({ type: 'DELIVERY', items: [{ productId: 'p1', quantity: 1 }] }).success).toBe(false);
  });

  it('should reject an order with no items', () => {
    expect(phoneOrderSchema.safeParse({ type: 'PICKUP', customerPhone: '+2010', items: [] }).success).toBe(false);
  });

  it('should validate lookup phone', () => {
    expect(phoneLookupSchema.safeParse({ phone: '+2010' }).success).toBe(true);
    expect(phoneLookupSchema.safeParse({ phone: '' }).success).toBe(false);
  });
});