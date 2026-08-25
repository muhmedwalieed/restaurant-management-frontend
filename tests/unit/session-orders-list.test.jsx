import React from 'react';
import { render, screen } from '@testing-library/react';
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
      { name: 'أحمد', subtotal: 100 },
      { name: 'سارة', subtotal: 25 },
    ],
  },
  {
    id: 'o2',
    orderNumber: 2,
    status: 'AWAITING_CONFIRMATION',
    total: 50,
    items: [{ id: 'i3', productName: 'Burger', quantity: 1, unitPrice: 50, total: 50, addedByName: 'سارة' }],
    byMember: [{ name: 'سارة', subtotal: 50 }],
  },
];

describe('SessionOrdersList (per-member bill + multiple rounds)', () => {
  it('renders order rounds and aggregates each member\'s total bill', () => {
    render(<SessionOrdersList orders={sampleOrders} currency="EGP" />);

    expect(screen.getByText('أوردراتك في الجلسة')).toBeInTheDocument();
    expect(screen.getByText('حساب كل شخص')).toBeInTheDocument();

    // Per-person aggregated bills across both rounds
    expect(screen.getByText('أحمد')).toBeInTheDocument();
    expect(screen.getByText('سارة')).toBeInTheDocument();
    expect(screen.getByText('100.00 EGP')).toBeInTheDocument(); // أحمد total (only round 1)
    expect(screen.getByText('75.00 EGP')).toBeInTheDocument(); // سارة total (25 + 50)

    // Both rounds shown with status labels
    expect(screen.getByText('أوردر #1')).toBeInTheDocument();
    expect(screen.getByText('أوردر #2')).toBeInTheDocument();
    expect(screen.getByText('تم التأكيد')).toBeInTheDocument();
    expect(screen.getByText('قيد المراجعة')).toBeInTheDocument();
  });

  it('renders nothing when there are no orders', () => {
    const { container } = render(<SessionOrdersList orders={[]} currency="EGP" />);
    expect(container.firstChild).toBeNull();
  });
});