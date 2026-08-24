import { describe, it, expect } from 'vitest';
import { customerFormSchema, addressFormSchema, ADDRESS_LABELS } from '../../src/modules/customers/schemas/customer.schema.js';

describe('Module 7 Customers Schema', () => {
  it('should accept a valid customer payload (firstName + phone)', () => {
    const result = customerFormSchema.safeParse({ firstName: 'Ali', phone: '+2010' });
    expect(result.success).toBe(true);
  });

  it('should accept firstName + lastName + extra phones', () => {
    const result = customerFormSchema.safeParse({
      firstName: 'Ali',
      lastName: 'Hassan',
      phone: '+2010',
      phones: ['+2011'],
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing firstName or phone', () => {
    expect(customerFormSchema.safeParse({ phone: '+2010' }).success).toBe(false);
    expect(customerFormSchema.safeParse({ firstName: 'Ali' }).success).toBe(false);
  });

  it('should accept a valid address with default label HOME', () => {
    const result = addressFormSchema.safeParse({ street: 'St', city: 'Cairo' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.label).toBe('HOME');
  });

  it('should reject invalid address label', () => {
    expect(addressFormSchema.safeParse({ label: 'BAD' }).success).toBe(false);
  });

  it('should map address labels to Arabic', () => {
    expect(ADDRESS_LABELS.HOME).toBe('المنزل');
    expect(ADDRESS_LABELS.WORK).toBe('العمل');
    expect(ADDRESS_LABELS.OTHER).toBe('أخرى');
  });
});