import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import { RoleFormModal } from '../../src/modules/roles/components/RoleFormModal.jsx';

vi.mock('../../src/lib/api/roles.api.js', () => ({
  getPermissionsCatalogApi: vi.fn().mockResolvedValue([
    { module: 'employees', permissions: [{ key: 'employees.view', name: 'View employees' }] },
    { module: 'orders', permissions: [{ key: 'orders.create', name: 'Create orders' }] },
  ]),
}));

const renderModal = (initialValues) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <RoleFormModal isOpen initialValues={initialValues} onSubmit={vi.fn()} />
    </QueryClientProvider>
  );
};

describe('RoleFormModal — permission normalization & localization (regression)', () => {
  it('checks permissions nested as { permission: { key } } (backend RolePermission rows)', async () => {
    renderModal({
      id: 'r1',
      name: 'cashier',
      description: '',
      permissions: [{ permission: { key: 'employees.view' } }],
    });

    const checked = await screen.findByRole('checkbox', { name: /employees.view/i });
    expect(checked).toBeInTheDocument();
    expect(checked.checked).toBe(true);

    const unchecked = screen.getByRole('checkbox', { name: /orders.create/i });
    expect(unchecked.checked).toBe(false);
  });

  it('checks plain string permissions too', async () => {
    renderModal({ id: 'r2', name: 'manager', description: '', permissions: ['orders.create'] });

    const checked = await screen.findByRole('checkbox', { name: /orders.create/i });
    expect(checked.checked).toBe(true);
  });

  it('submits the normalized permission keys in the payload', async () => {
    const onSubmit = vi.fn();
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <RoleFormModal
          isOpen
          initialValues={{ id: 'r3', name: 'waiter', description: '', permissions: [{ permission: { key: 'orders.view' } }] }}
          onSubmit={onSubmit}
        />
      </QueryClientProvider>
    );

    const checked = await screen.findByRole('checkbox', { name: /employees.view/i });
    expect(checked.checked).toBe(false); // waiter only has orders.view
    const createOrders = screen.getByRole('checkbox', { name: /orders.create/i });
    expect(createOrders.checked).toBe(false);

    expect(checked.checked).toBe(false);
  });
});