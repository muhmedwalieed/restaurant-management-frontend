import { describe, it, expect } from 'vitest';
import { employeeFormSchema } from '../../src/modules/employees/components/EmployeeFormModal.jsx';
import { changePasswordSchema } from '../../src/modules/employees/components/ChangePasswordModal.jsx';
import { roleFormSchema } from '../../src/modules/roles/components/RoleFormModal.jsx';

describe('Module 2 Zod Schemas Unit Tests', () => {
  it('employeeFormSchema should validate valid employee creation data', () => {
    const validData = {
      name: 'محمود حسن',
      email: 'mahmoud@restaurant.com',
      phone: '01012345678',
      roleId: 'role-1',
      branchId: 'br-1',
      password: 'password123',
    };
    const res = employeeFormSchema.safeParse(validData);
    expect(res.success).toBe(true);
  });

  it('employeeFormSchema should reject invalid email or short name', () => {
    const invalidData = {
      name: 'أ',
      email: 'not-an-email',
      roleId: 'role-1',
      branchId: 'br-1',
      status: 'ACTIVE',
    };
    const res = employeeFormSchema.safeParse(invalidData);
    expect(res.success).toBe(false);
  });

  it('changePasswordSchema should pass when passwords match', () => {
    const validData = {
      newPassword: 'secretPassword123',
      confirmPassword: 'secretPassword123',
    };
    const res = changePasswordSchema.safeParse(validData);
    expect(res.success).toBe(true);
  });

  it('changePasswordSchema should reject when passwords do not match', () => {
    const invalidData = {
      newPassword: 'secretPassword123',
      confirmPassword: 'differentPassword123',
    };
    const res = changePasswordSchema.safeParse(invalidData);
    expect(res.success).toBe(false);
  });

  it('roleFormSchema should validate role name and description', () => {
    const validRole = {
      name: 'مشرف جودة',
      description: 'مسؤول عن الجودة',
    };
    const res = roleFormSchema.safeParse(validRole);
    expect(res.success).toBe(true);
  });
});
