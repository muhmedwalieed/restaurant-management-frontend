import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PermissionGate } from '../../src/shared/components/PermissionGate.jsx';
import * as AuthContextModule from '../../src/modules/auth/context/AuthContext.jsx';

describe('PermissionGate UI Unit Tests', () => {
  it('should render children when user has required permission', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { role: 'CASHIER', permissions: ['orders.create'] },
      hasPermission: (key) => key === 'orders.create',
    });

    render(
      <PermissionGate permission="orders.create">
        <button>إنشاء طلب</button>
      </PermissionGate>
    );

    expect(screen.getByRole('button', { name: /إنشاء طلب/i })).toBeInTheDocument();
  });

  it('should hide children when user does not have permission', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { role: 'CASHIER', permissions: ['orders.create'] },
      hasPermission: () => false,
    });

    render(
      <PermissionGate permission="employees.manage">
        <button>حذف موظف</button>
      </PermissionGate>
    );

    expect(screen.queryByRole('button', { name: /حذف موظف/i })).not.toBeInTheDocument();
  });

  it('should disable children when disableOnly prop is true and user lacks permission', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { role: 'CASHIER', permissions: [] },
      hasPermission: () => false,
    });

    render(
      <PermissionGate permission="employees.manage" disableOnly>
        <button>حذف موظف</button>
      </PermissionGate>
    );

    const btn = screen.getByRole('button', { name: /حذف موظف/i });
    expect(btn).toBeDisabled();
  });
});
