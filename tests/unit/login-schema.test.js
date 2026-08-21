import { describe, it, expect } from 'vitest';
import { loginSchema } from '../../src/modules/auth/pages/LoginPage.jsx';

describe('Login Zod Validation Schema Unit Tests', () => {
  it('should validate valid email and password correctly', () => {
    const validData = {
      email: 'admin@restaurant.com',
      password: 'password123',
    };
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email format', () => {
    const invalidData = {
      email: 'invalid-email-string',
      password: 'password123',
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('صيغة البريد الإلكتروني غير صحيحة');
    }
  });

  it('should reject short password under 6 characters', () => {
    const invalidData = {
      email: 'admin@restaurant.com',
      password: '123',
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('كلمة المرور يجب أن لا تقل عن 6 أحرف');
    }
  });

  it('should reject empty required fields', () => {
    const invalidData = {
      email: '',
      password: '',
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
