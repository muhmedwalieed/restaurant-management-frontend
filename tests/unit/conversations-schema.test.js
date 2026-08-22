import { describe, it, expect } from 'vitest';
import {
  conversationQuerySchema,
  CONVERSATION_STATUS_LABELS,
  CONVERSATION_STATE_LABELS,
} from '../../src/modules/whatsapp/schemas/conversation.schema.js';

describe('Module 10 Conversations Schema', () => {
  it('should accept a valid query', () => {
    expect(conversationQuerySchema.safeParse({ page: 1, limit: 20, status: 'ACTIVE' }).success).toBe(true);
  });

  it('should reject invalid status', () => {
    expect(conversationQuerySchema.safeParse({ status: 'BROKEN' }).success).toBe(false);
  });

  it('should map conversation statuses to Arabic', () => {
    expect(CONVERSATION_STATUS_LABELS.ACTIVE).toBe('نشطة');
    expect(CONVERSATION_STATUS_LABELS.WAITING_AGENT).toBe('بانتظار موظف');
    expect(CONVERSATION_STATUS_LABELS.CLOSED).toBe('مغلقة');
  });

  it('should map flow states to Arabic', () => {
    expect(CONVERSATION_STATE_LABELS.WELCOME).toBe('ترحيب');
    expect(CONVERSATION_STATE_LABELS.CONFIRM_ORDER).toBe('تأكيد الطلب');
    expect(CONVERSATION_STATE_LABELS.HUMAN_HANDOFF).toBe('تحويل لموظف');
  });
});