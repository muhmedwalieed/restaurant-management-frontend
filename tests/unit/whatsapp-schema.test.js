import { describe, it, expect } from 'vitest';
import {
  connectConnectionSchema,
  sendMessageSchema,
  CONNECTION_STATUS_LABELS,
  MESSAGE_STATUS_LABELS,
} from '../../src/modules/whatsapp/schemas/whatsapp.schema.js';

describe('Module 9 WhatsApp Schema', () => {
  it('should accept a valid connection payload', () => {
    expect(
      connectConnectionSchema.safeParse({ provider: 'MOCK', providerAccountId: 'waba1', providerPhoneNumberId: '+201' }).success
    ).toBe(true);
  });

  it('should reject missing account/phone ids', () => {
    expect(connectConnectionSchema.safeParse({ provider: 'MOCK' }).success).toBe(false);
  });

  it('should reject short webhook secret', () => {
    expect(
      connectConnectionSchema.safeParse({ providerAccountId: 'waba1', providerPhoneNumberId: '+201', webhookSecret: 'short' }).success
    ).toBe(false);
  });

  it('should validate send message schema', () => {
    expect(sendMessageSchema.safeParse({ to: '+2010', text: 'Hi' }).success).toBe(true);
    expect(sendMessageSchema.safeParse({ to: '+2010', text: '' }).success).toBe(false);
    expect(sendMessageSchema.safeParse({ to: '', text: 'Hi' }).success).toBe(false);
  });

  it('should map statuses to Arabic', () => {
    expect(CONNECTION_STATUS_LABELS.ACTIVE).toBe('متصل');
    expect(MESSAGE_STATUS_LABELS.READ).toBe('مقروءة');
    expect(MESSAGE_STATUS_LABELS.FAILED).toBe('فشل');
  });
});
