import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SessionOrdersList } from '../../src/modules/tables/components/SessionOrdersList.jsx';

const sampleOrders = [
  {
    id: 'o1',
    orderNumber: 1,
    status: 'CONFIRMED',
    total: 125,
    items: [
      { id: 'i1', productName: 'Burger', quantity: 2, unitPrice: 50, total: 100, addedByName: 'أحمد' },
      { id: 'i2', productName: 'Fries', quantity: 1, unitPrice: 25, total: 25, addedByName: 'سارة' },
    ],
    byMember: [
      { name: 'أحمد', items: [{ productName: 'Burger', quantity: 2, unitPrice: 50, total: 100 }], subtotal: 100 },
      { name: 'سارة', items: [{ productName: 'Fries', quantity: 1, unitPrice: 25, total: 25 }], subtotal: 25 },
    ],
  },
  {
    id: 'o2',
    orderNumber: 2,
    status: 'AWAITING_CONFIRMATION',
    total: 50,
    items: [{ id: 'i3', productName: 'Burger', quantity: 1, unitPrice: 50, total: 50, addedByName: 'سارة' }],
    byMember: [{ name: 'سارة', items: [{ productName: 'Burger', quantity: 1, unitPrice: 50, total: 50 }], subtotal: 50 }],
  },
];

describe('SessionOrdersList (per-member bill + multiple rounds)', () => {
  it('renders member pills with aggregated totals across all rounds and the selected member itemized bill', () => {
    render(<SessionOrdersList orders={sampleOrders} currency="EGP" />);

    expect(screen.getByText('أوردراتك في الجلسة')).toBeInTheDocument();
    expect(screen.getByText('حساب كل شخص')).toBeInTheDocument();

    expect(screen.getByText(/· 100\.00/)).toBeInTheDocument();
    expect(screen.getByText(/· 75\.00/)).toBeInTheDocument();

    expect(screen.getByText('أحمد طلب:')).toBeInTheDocument();
    expect(screen.getByText('إجمالي أحمد:')).toBeInTheDocument();
    expect(screen.getAllByText('100.00')).toBeTruthy();

    expect(screen.getByText('أوردر #1')).toBeInTheDocument();
    expect(screen.getByText('أوردر #2')).toBeInTheDocument();
    expect(screen.getByText('تم التأكيد')).toBeInTheDocument();
    expect(screen.getByText('قيد المراجعة')).toBeInTheDocument();
  });

  it('switches the itemized bill to another member', () => {
    render(<SessionOrdersList orders={sampleOrders} currency="EGP" />);

    fireEvent.click(screen.getByRole('button', { name: /سارة/ }));

    expect(screen.getByText('سارة طلب:')).toBeInTheDocument();
    expect(screen.getByText('إجمالي سارة:')).toBeInTheDocument();
  });

  it('renders nothing when there are no orders', () => {
    const { container } = render(<SessionOrdersList orders={[]} currency="EGP" />);
    expect(container.firstChild).toBeNull();
  });
});
