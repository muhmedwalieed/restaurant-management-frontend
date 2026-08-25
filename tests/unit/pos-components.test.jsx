import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { OrderSourcePicker } from '../../src/modules/orders/components/OrderSourcePicker.jsx';
import { TableQuickPicker } from '../../src/modules/orders/components/TableQuickPicker.jsx';

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
});
