import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CartDrawer } from '../../src/modules/tables/components/CartDrawer.jsx';
import { FloatingCartBar } from '../../src/modules/tables/components/FloatingCartBar.jsx';

describe('CartDrawer Component (2-Tab Segmented Mobile Drawer)', () => {
  const sampleSessionWithDuplicates = {
    id: 's1',
    status: 'OPEN',
    members: [{ name: 'أحمد' }, { name: 'سارة' }],
    items: [
      { id: 'i1', productId: 'p1', productName: 'Double Beef Burger', quantity: 1, unitPrice: 350, total: 350, addedByName: 'أحمد' },
      { id: 'i2', productId: 'p2', productName: 'Chicken Pizza', quantity: 1, unitPrice: 350, total: 350, addedByName: 'أحمد' },
      { id: 'i3', productId: 'p3', productName: 'Margherita Pizza', quantity: 1, unitPrice: 300, total: 300, addedByName: 'أحمد' },
      { id: 'i4', productId: 'p2', productName: 'Chicken Pizza', quantity: 1, unitPrice: 350, total: 350, addedByName: 'أحمد' },
    ],
    orders: [
      {
        id: 'o1',
        orderNumber: 1,
        status: 'CONFIRMED',
        total: 1160,
        items: [{ id: 'oi1', productName: 'Cheese Burger', quantity: 2, unitPrice: 280, total: 560, addedByName: 'غني' }],
        byMember: [{ name: 'غني', subtotal: 1160, items: [{ productName: 'Cheese Burger', quantity: 2, unitPrice: 280, total: 560 }] }],
      },
    ],
    total: 1350,
  };

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <CartDrawer isOpen={false} onClose={vi.fn()} session={sampleSessionWithDuplicates} restaurant={{ currency: 'EGP' }} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders 2-tab segmented control and consolidates draft cart items on Tab 1', () => {
    render(
      <CartDrawer
        isOpen={true}
        onClose={vi.fn()}
        session={sampleSessionWithDuplicates}
        restaurant={{ currency: 'EGP' }}
        onUpdateQuantity={vi.fn()}
        onRemoveItem={vi.fn()}
        onCallWaiter={vi.fn()}
        onSubmitOrder={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /السلة الحالية \(4\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /أوردرات الجلسة/i })).toBeInTheDocument();

    expect(screen.getAllByText('Chicken Pizza')).toHaveLength(1);
    expect(screen.getByText('700.00 EGP')).toBeInTheDocument();
    expect(screen.getByText('(2 × 350.00 / قطعة)')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /إرسال الطلب للمطبخ \(1350.00 EGP\)/i })).toBeInTheDocument();
  });

  it('renders clean empty state with browse menu button when draft cart is empty', () => {
    const handleClose = vi.fn();
    render(
      <CartDrawer
        isOpen={true}
        onClose={handleClose}
        session={{
          id: 's1',
          status: 'OPEN',
          items: [],
          orders: [],
          total: 0,
        }}
        restaurant={{ currency: 'EGP' }}
        onUpdateQuantity={vi.fn()}
        onRemoveItem={vi.fn()}
        onCallWaiter={vi.fn()}
        onSubmitOrder={vi.fn()}
      />
    );

    expect(screen.getByText('السلة فاضية')).toBeInTheDocument();
    const browseBtns = screen.getAllByRole('button', { name: /تصفح القائمة/i });
    expect(browseBtns.length).toBeGreaterThan(0);

    fireEvent.click(browseBtns[0]);
    expect(handleClose).toHaveBeenCalled();
  });

  it('switches to Session Orders tab and renders confirmed orders & member breakdown', () => {
    render(
      <CartDrawer
        isOpen={true}
        onClose={vi.fn()}
        session={sampleSessionWithDuplicates}
        restaurant={{ currency: 'EGP' }}
        onUpdateQuantity={vi.fn()}
        onRemoveItem={vi.fn()}
        onCallWaiter={vi.fn()}
        onSubmitOrder={vi.fn()}
      />
    );

    const sessionTabBtn = screen.getByRole('button', { name: /أوردرات الجلسة/i });
    fireEvent.click(sessionTabBtn);

    expect(screen.getByText('أوردراتك في الجلسة')).toBeInTheDocument();
    expect(screen.getByText('حساب كل شخص')).toBeInTheDocument();
    expect(screen.getByText('أوردر #1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /طلب الفاتورة والحساب/i })).toBeInTheDocument();
  });
});

describe('FloatingCartBar Component', () => {
  it('renders sticky bar with total items, price and toggle button', () => {
    const handleToggle = vi.fn();

    render(
      <FloatingCartBar
        totalCartItems={4}
        cartTotalPrice="1350.00"
        currency="EGP"
        isCartOpen={false}
        onToggleCart={handleToggle}
      />
    );

    expect(screen.getByText('4 أصناف')).toBeInTheDocument();
    expect(screen.getByText('1350.00 EGP')).toBeInTheDocument();
    expect(screen.getByText('عرض السلة / اطلب')).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /عرض السلة \/ اطلب/i });
    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});
