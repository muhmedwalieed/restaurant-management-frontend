import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { PublicTableMenuPage } from '../../src/modules/tables/pages/PublicTableMenuPage.jsx';
import { useTableSessionQuery } from '../../src/modules/tables/hooks/useTableSessions.js';

vi.mock('../../src/lib/api/tables.api.js', () => ({
  getTableMenuApi: vi.fn().mockResolvedValue({
    restaurant: { name: 'مطعم الأكيل', currency: 'EGP' },
    table: { label: '1' },
    categories: [
      {
        id: 'c1',
        name: 'برجر',
        products: [
          { id: 'p1', name: 'كلاسيك برجر', price: 250, description: 'برجر لديد' },
        ],
      },
    ],
  }),
}));

vi.mock('../../src/modules/tables/hooks/useTableSessions.js', () => ({
  useJoinTableSession: vi.fn().mockReturnValue({ mutateAsync: vi.fn() }),
  useTableSessionQuery: vi.fn().mockReturnValue({
    data: {
      id: 's1',
      status: 'OPEN',
      members: [{ name: 'أحمد' }],
      items: [
        { id: 'i1', productName: 'كلاسيك برجر', quantity: 2, unitPrice: 250, total: 500, addedByName: 'أحمد' },
      ],
      total: 500,
    },
    isLoading: false,
  }),
  useAddSessionItem: vi.fn().mockReturnValue({ mutateAsync: vi.fn() }),
  useUpdateSessionItem: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useRemoveSessionItem: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useCallWaiter: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
  useSubmitDraft: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));

const renderPublicMenu = () => {
  localStorage.setItem('ts_session_tok123', 's1');
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/table-menu/tok123']}>
        <Routes>
          <Route path="/table-menu/:qrToken" element={<PublicTableMenuPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('PublicTableMenuPage Unit Tests (Mobile Dine-in UX)', () => {
  it('renders menu items and sticky bottom action bar with cart total', async () => {
    renderPublicMenu();

    const title = await screen.findByText('مطعم الأكيل');
    expect(title).toBeInTheDocument();

    const burgers = screen.getAllByText('كلاسيك برجر');
    expect(burgers.length).toBeGreaterThan(0);

    const bottomCartBtn = screen.getByRole('button', { name: /عرض السلة \/ اطلب/i });
    expect(bottomCartBtn).toBeInTheDocument();
    expect(screen.getByText(/2 أصناف/i)).toBeInTheDocument();

    expect(screen.getAllByText(/500\.00 EGP/i).length).toBeGreaterThan(0);
  });

  it('opens slide-up cart drawer when clicking sticky bottom bar', async () => {
    renderPublicMenu();

    const bottomCartBtn = await screen.findByRole('button', { name: /عرض السلة \/ اطلب/i });
    fireEvent.click(bottomCartBtn);

    const sharedCartTitle = screen.getByText(/السلة الحالية/i);
    expect(sharedCartTitle).toBeInTheDocument();
    expect(screen.getByText(/أضافها أحمد/i)).toBeInTheDocument();

    const orderNowBtns = screen.getAllByRole('button', { name: /اطلب الآن/i });
    expect(orderNowBtns.length).toBeGreaterThan(0);
  });

  it('asks for confirmation before calling the waiter', async () => {
    renderPublicMenu();

    const waiterBtn = await screen.findByRole('button', { name: /استدعاء الويتر/i });
    fireEvent.click(waiterBtn);

    expect(await screen.findByText(/هل تريد فعلاً استدعاء الويتر إلى طاولتك؟/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /نعم، استدعِ الويتر/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'إلغاء' })).toBeInTheDocument();
  });

  it('keeps a closed session open for viewing the bill and signs out on demand', async () => {
    vi.mocked(useTableSessionQuery).mockReturnValue({
      data: { id: 's1', status: 'CLOSED', members: [], items: [], orders: [], total: 0 },
      isLoading: false,
      error: undefined,
    });
    localStorage.setItem('ts_session_tok123', 's1');
    renderPublicMenu();

    expect(await screen.findByText(/الجلسة انتهت/i)).toBeInTheDocument();
    expect(localStorage.getItem('ts_session_tok123')).toBe('s1');

    fireEvent.click(screen.getByRole('button', { name: /تسجيل خروج/i }));
    expect(screen.getByRole('button', { name: /دخول الجلسة/i })).toBeInTheDocument();
    expect(localStorage.getItem('ts_session_tok123')).toBeNull();
  });
});
