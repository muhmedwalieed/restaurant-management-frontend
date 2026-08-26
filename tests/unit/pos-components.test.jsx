import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { OrderSourcePicker } from '../../src/modules/orders/components/OrderSourcePicker.jsx';
import { TableQuickPicker } from '../../src/modules/orders/components/TableQuickPicker.jsx';
import { ProductModifierModal } from '../../src/modules/orders/components/ProductModifierModal.jsx';

describe('POS Components Unit Tests', () => {
  describe('OrderSourcePicker', () => {
    it('renders all 4 source options and triggers onChange when clicked', () => {
      const onChange = vi.fn();
      render(<OrderSourcePicker value="CASHIER" onChange={onChange} />);

      expect(screen.getByText('كاشير')).toBeInTheDocument();
      expect(screen.getByText('هاتف')).toBeInTheDocument();
      expect(screen.getByText('واتساب')).toBeInTheDocument();
      expect(screen.getByText('أونلاين')).toBeInTheDocument();

      fireEvent.click(screen.getByText('هاتف'));
      expect(onChange).toHaveBeenCalledWith('PHONE');
    });
  });

  describe('TableQuickPicker', () => {
    const mockTables = [
      { id: 't1', label: '1', seats: 4 },
      { id: 't2', label: '2', seats: 2 },
    ];

    it('renders tables and highlights selected table', () => {
      const onChange = vi.fn();
      render(<TableQuickPicker tables={mockTables} value="t1" onChange={onChange} required />);

      const table1Elements = screen.getAllByText(/طاولة 1/);
      expect(table1Elements.length).toBeGreaterThan(0);
      expect(screen.getByText(/طاولة 2/)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /طاولة 2/ }));
      expect(onChange).toHaveBeenCalledWith('t2');
    });

    it('renders empty state when no tables are available', () => {
      render(<TableQuickPicker tables={[]} value="" onChange={() => {}} />);
      expect(screen.getByText('لا توجد طاولات متاحة')).toBeInTheDocument();
    });
  });

  describe('ProductModifierModal', () => {
    const mockProduct = {
      id: 'p1',
      name: 'Classic Burger',
      price: 250,
      modifiers: [
        { id: 'm1', name: 'Extra Cheese', priceDelta: 30, isRequired: false },
        { id: 'm2', name: 'Standard Sauce', priceDelta: 0, isRequired: true },
      ],
    };

    it('renders modifiers with required item pre-selected and toggles selection', () => {
      const onConfirm = vi.fn();
      const onClose = vi.fn();

      render(
        <ProductModifierModal
          isOpen={true}
          product={mockProduct}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );

      expect(screen.getByText('Classic Burger')).toBeInTheDocument();
      expect(screen.getByText('Extra Cheese')).toBeInTheDocument();
      expect(screen.getByText('Standard Sauce')).toBeInTheDocument();
      expect(screen.getByText('إجباري')).toBeInTheDocument();

      expect(screen.getAllByText('250.00 EGP').length).toBeGreaterThan(0);

      // Toggle the optional Extra Cheese modifier on
      fireEvent.click(screen.getByRole('button', { name: 'Extra Cheese' }));

      expect(screen.getAllByText('280.00 EGP').length).toBeGreaterThan(0);

      const addBtn = screen.getByRole('button', { name: /إضافة للسلة/i });
      fireEvent.click(addBtn);

      expect(onConfirm).toHaveBeenCalledWith({
        modifiers: expect.arrayContaining([
          { modifierId: 'm1', quantity: 1 },
          { modifierId: 'm2', quantity: 1 },
        ]),
        modifierNames: expect.arrayContaining(['Extra Cheese', 'Standard Sauce']),
        unitPrice: 280,
      });
    });

    it('supports QUANTITY modifiers with a stepper and sends the chosen quantity', () => {
      const onConfirm = vi.fn();
      render(
        <ProductModifierModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={onConfirm}
          product={{
            id: 'p2',
            name: 'Double Burger',
            price: 200,
            modifiers: [
              { id: 'q1', name: 'Extra Patty', priceDelta: 40, isRequired: false, quantityMode: 'QUANTITY', maxQuantity: 4 },
            ],
          }}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'زيادة Extra Patty' }));
      fireEvent.click(screen.getByRole('button', { name: 'زيادة Extra Patty' }));

      expect(screen.getAllByText('280.00 EGP').length).toBeGreaterThan(0); // 200 + 40*2

      fireEvent.click(screen.getByRole('button', { name: /إضافة للسلة/i }));
      expect(onConfirm).toHaveBeenCalledWith({
        modifiers: [{ modifierId: 'q1', quantity: 2 }],
        modifierNames: ['Extra Patty ×2'],
        unitPrice: 280,
      });
    });
  });
});
