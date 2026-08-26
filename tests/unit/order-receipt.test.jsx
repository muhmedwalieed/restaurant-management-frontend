import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ReceiptPrintTemplate } from '../../src/modules/orders/components/ReceiptPrintTemplate.jsx';

describe('ReceiptPrintTemplate Unit Tests (RTL & BiDi Compliance)', () => {
  const mockOrder = {
    id: 'o1',
    orderNumber: 1010,
    type: 'DINE_IN',
    source: 'CASHIER',
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    paymentMethod: 'CASH',
    createdAt: '2026-08-25T08:42:00.000Z',
    table: { id: 't1', label: '1' },
    customer: { name: 'محمد علي', phone: '01012345678' },
    subtotal: 650,
    tax: 0,
    discount: 0,
    total: 650,
    items: [
      { id: 'i1', productName: 'Margherita Pizza', quantity: 1, unitPrice: 300, subtotal: 300 },
      { id: 'i2', productName: 'Double Beef Burger', quantity: 1, unitPrice: 350, subtotal: 350 },
    ],
    branch: { name: 'الفرع الرئيسي' },
  };

  it('renders receipt details correctly with RTL/BiDi isolation', () => {
    render(<ReceiptPrintTemplate order={mockOrder} activeBranch={{ name: 'الفرع الرئيسي' }} />);

    expect(screen.getByText(/#1010/)).toBeInTheDocument();
    expect(screen.getByText('مطاعم برايم')).toBeInTheDocument();
    expect(screen.getByText('الفرع الرئيسي')).toBeInTheDocument();
    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    expect(screen.getByText('Double Beef Burger')).toBeInTheDocument();
    expect(screen.getByText('الإجمالي النهائي:')).toBeInTheDocument();
    expect(screen.getByText('رقم الطلب:')).toBeInTheDocument();
    expect(screen.getByText('التاريخ والوقت:')).toBeInTheDocument();
    expect(screen.getByText('نوع الطلب:')).toBeInTheDocument();
    expect(screen.getByText('المصدر:')).toBeInTheDocument();
    expect(screen.getByText('العميل:')).toBeInTheDocument();

    const totals = screen.getAllByText(/650.00/);
    expect(totals.length).toBeGreaterThan(0);
  });

  it('returns null if order is missing', () => {
    const { container } = render(<ReceiptPrintTemplate order={null} />);
    expect(container.firstChild).toBeNull();
  });
});
