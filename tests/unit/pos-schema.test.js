import { describe, it, expect } from 'vitest';
import {
  posOrderSchema,
  paymentSchema,
  refundSchema,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '../../src/modules/orders/schemas/order.schema.js';

describe('Module 8 POS & Payment Schema', () => {
  it('should accept a valid POS order', () => {
    expect(posOrderSchema.safeParse({ type: 'DINE_IN', items: [{ productId: 'p1', quantity: 1 }] }).success).toBe(true);
  });

  it('should reject a POS order with no items', () => {
    expect(posOrderSchema.safeParse({ type: 'DELIVERY', items: [] }).success).toBe(false);
  });

  it('should require customer name and phone for DELIVERY POS orders', () => {
    expect(
      posOrderSchema.safeParse({ type: 'DELIVERY', items: [{ productId: 'p1', quantity: 1 }] }).success
    ).toBe(false);
    expect(
      posOrderSchema.safeParse({
        type: 'DELIVERY',
        customerName: 'عميل',
        customerPhone: '0100',
        address: 'شارع الرئيسي',
        items: [{ productId: 'p1', quantity: 1 }],
      }).success
    ).toBe(true);
  });

  it('should validate payment schema', () => {
    expect(paymentSchema.safeParse({ paymentMethod: 'CASH', expectedVersion: 1 }).success).toBe(true);
    expect(paymentSchema.safeParse({ paymentMethod: 'CASH' }).success).toBe(false);
    expect(paymentSchema.safeParse({ paymentMethod: 'BITCOIN', expectedVersion: 1 }).success).toBe(false);
  });

  it('should require a reason for refund', () => {
    expect(refundSchema.safeParse({ expectedVersion: 1, reason: '' }).success).toBe(false);
    expect(refundSchema.safeParse({ expectedVersion: 1, reason: 'x' }).success).toBe(true);
  });

  it('should map payment methods and statuses to Arabic', () => {
    expect(PAYMENT_METHOD_LABELS.CASH).toBe('كاش');
    expect(PAYMENT_METHOD_LABELS.CARD).toBe('بطاقة');
    expect(PAYMENT_STATUS_LABELS.PAID).toBe('مدفوع');
    expect(PAYMENT_STATUS_LABELS.REFUNDED).toBe('مسترجع');
  });
});
