import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { RoleEditPage } from '../../src/modules/roles/pages/RoleEditPage.jsx';

vi.mock('../../src/lib/api/roles.api.js', () => ({
  getRolesApi: vi.fn().mockResolvedValue({
    items: [
      {
        id: 'r1',
        name: 'كاشير',
        description: 'مسؤول الكاشير والطلبات',
        isSystem: false,
        permissions: ['orders.create', 'orders.view'],
      },
    ],
  }),
  getPermissionsCatalogApi: vi.fn().mockResolvedValue([
    {
      module: 'orders',
      permissions: [
        { key: 'orders.view', name: 'View orders' },
        { key: 'orders.create', name: 'Create orders' },
      ],
    },
    {
      module: 'employees',
      permissions: [{ key: 'employees.view', name: 'View employees' }],
    },
  ]),
  createRoleApi: vi.fn().mockResolvedValue({ id: 'r2' }),
  updateRoleApi: vi.fn().mockResolvedValue({ id: 'r1' }),
}));

const renderRoleEditPage = (initialRoute = '/settings/roles/new') => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/settings/roles/new" element={<RoleEditPage />} />
          <Route path="/settings/roles/:id/edit" element={<RoleEditPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('RoleEditPage Unit Tests', () => {
  it('renders creation page with basic inputs and permission catalog', async () => {
    renderRoleEditPage('/settings/roles/new');

    const title = await screen.findByText('إنشاء دور وظيفي جديد');
    expect(title).toBeInTheDocument();
    expect(screen.getByLabelText(/اسم الدور الوظيفي/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ابحث في الصلاحيات/i)).toBeInTheDocument();

    const ordersElements = screen.getAllByText(/إدارة الطلبات/i);
    expect(ordersElements.length).toBeGreaterThan(0);
  });

  it('renders edit mode with pre-populated values for role r1', async () => {
    renderRoleEditPage('/settings/roles/r1/edit');

    const nameInput = await screen.findByDisplayValue('كاشير');
    expect(nameInput).toBeInTheDocument();
    expect(screen.getByDisplayValue('مسؤول الكاشير والطلبات')).toBeInTheDocument();
  });
});
