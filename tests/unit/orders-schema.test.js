import { describe, it, expect } from 'vitest';
import {
  orderFormSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  nextStatuses,
  ORDER_STATUS_LABELS,
} from '../../src/modules/orders/schemas/order.schema.js';

describe('Module 6 Orders Schema', () => {
  it('should accept a valid order payload with items', () => {
    const result = orderFormSchema.safeParse({
      type: 'DINE_IN',
      items: [{ productId: 'p1', quantity: 2 }],
    });
    expect(result.success).toBe(true);
  });

  it('should reject an order with no items', () => {
    const result = orderFormSchema.safeParse({ type: 'DELIVERY', items: [] });
    expect(result.success).toBe(false);
  });

  it('should require customer name and phone for DELIVERY orders', () => {
    const missing = orderFormSchema.safeParse({ type: 'DELIVERY', items: [{ productId: 'p1', quantity: 1 }] });
    expect(missing.success).toBe(false);
    const withNameOnly = orderFormSchema.safeParse({
      type: 'DELIVERY',
      customerName: 'عميل',
      items: [{ productId: 'p1', quantity: 1 }],
    });
    expect(withNameOnly.success).toBe(false);
    const valid = orderFormSchema.safeParse({
      type: 'DELIVERY',
      customerName: 'عميل',
      customerPhone: '0100',
      address: 'شارع الرئيسي',
      items: [{ productId: 'p1', quantity: 1 }],
    });
    expect(valid.success).toBe(true);
  });

  it('should coerce quantity and default type to DINE_IN', () => {
    const result = orderFormSchema.safeParse({ items: [{ productId: 'p1', quantity: '3' }] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('DINE_IN');
      expect(result.data.items[0].quantity).toBe(3);
    }
  });

  it('should validate updateOrderStatusSchema expectedVersion', () => {
    expect(updateOrderStatusSchema.safeParse({ newStatus: 'READY', expectedVersion: 2 }).success).toBe(true);
    expect(updateOrderStatusSchema.safeParse({ newStatus: 'READY' }).success).toBe(false);
  });

  it('should require a reason for cancel', () => {
    expect(cancelOrderSchema.safeParse({ expectedVersion: 1, reason: '' }).success).toBe(false);
    expect(cancelOrderSchema.safeParse({ expectedVersion: 1, reason: 'x' }).success).toBe(true);
  });

  it('should compute next statuses for the state machine', () => {
    expect(nextStatuses('PENDING', 'DINE_IN')).toEqual(['CONFIRMED']);
    expect(nextStatuses('PREPARING', 'DINE_IN')).toEqual(['READY']);
    expect(nextStatuses('READY', 'DINE_IN')).toEqual(['DELIVERED']);
    expect(nextStatuses('READY', 'DELIVERY')).toEqual(['OUT_FOR_DELIVERY']);
    expect(nextStatuses('OUT_FOR_DELIVERY', 'DELIVERY')).toEqual(['DELIVERED']);
    expect(nextStatuses('DELIVERED', 'DINE_IN')).toEqual([]);
    expect(nextStatuses('CANCELLED', 'DINE_IN')).toEqual([]);
  });

  it('should map all statuses to Arabic labels', () => {
    expect(ORDER_STATUS_LABELS.PENDING).toBe('قيد الانتظار');
    expect(ORDER_STATUS_LABELS.DELIVERED).toBe('تم التسليم');
    expect(ORDER_STATUS_LABELS.CANCELLED).toBe('ملغي');
  });
});