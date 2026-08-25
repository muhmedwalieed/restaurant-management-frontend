import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CartDrawer } from '../../src/modules/tables/components/CartDrawer.jsx';
import { FloatingCartBar } from '../../src/modules/tables/components/FloatingCartBar.jsx';

describe('CartDrawer Component (Consolidated & Restructured Mobile Drawer)', () => {
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
    total: 1350,
  };

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <CartDrawer isOpen={false} onClose={vi.fn()} session={sampleSessionWithDuplicates} restaurant={{ currency: 'EGP' }} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('consolidates duplicate items added by the same user into a single row with aggregated quantity and breakdown', () => {
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

    // Consolidated Title Header: 3 unique items, 4 total pieces
    expect(screen.getByText(/الطلبات المشتركة \(3 أصناف • 4 قطع\)/i)).toBeInTheDocument();

    // Chicken Pizza should be consolidated to 1 row with Qty 2 and Total 700.00 EGP
    expect(screen.getAllByText('Chicken Pizza')).toHaveLength(1);
    expect(screen.getByText('700.00 EGP')).toBeInTheDocument();
    expect(screen.getByText('(2 × 350.00 / قطعة)')).toBeInTheDocument();

    // Submit button includes total price
    expect(screen.getByRole('button', { name: /اطلب الآن \(1350.00 EGP\)/i })).toBeInTheDocument();
  });

  it('triggers item removal when minus is clicked on a 1-unit item', () => {
    const handleRemove = vi.fn();
    render(
      <CartDrawer
        isOpen={true}
        onClose={vi.fn()}
        session={{
          id: 's1',
          status: 'OPEN',
          items: [{ id: 'i1', productId: 'p1', productName: 'Double Beef Burger', quantity: 1, unitPrice: 350, total: 350, addedByName: 'أحمد' }],
          total: 350,
        }}
        restaurant={{ currency: 'EGP' }}
        onUpdateQuantity={vi.fn()}
        onRemoveItem={handleRemove}
        onCallWaiter={vi.fn()}
        onSubmitOrder={vi.fn()}
      />
    );

    const minusBtn = screen.getByRole('button', { name: 'حذف الصنف' });
    fireEvent.click(minusBtn);
    expect(handleRemove).toHaveBeenCalledWith('i1');
  });
});

describe('FloatingCartBar Component', () => {
  it('renders sticky bar with waiter button, total items, price and toggle button', () => {
    const handleToggle = vi.fn();
    const handleCallWaiter = vi.fn();

    render(
      <FloatingCartBar
        totalCartItems={4}
        cartTotalPrice="1350.00"
        currency="EGP"
        isCartOpen={false}
        onToggleCart={handleToggle}
        onCallWaiter={handleCallWaiter}
      />
    );

    expect(screen.getByText('4 أصناف')).toBeInTheDocument();
    expect(screen.getByText('1350.00 EGP')).toBeInTheDocument();
    expect(screen.getByText('عرض السلة / اطلب')).toBeInTheDocument();

    const waiterBtn = screen.getByRole('button', { name: 'الويتر' });
    fireEvent.click(waiterBtn);
    expect(handleCallWaiter).toHaveBeenCalledTimes(1);

    const toggleBtn = screen.getByRole('button', { name: /عرض السلة \/ اطلب/i });
    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});
