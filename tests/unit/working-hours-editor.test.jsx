import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WorkingHoursEditor } from '../../src/modules/branches/components/WorkingHoursEditor.jsx';

describe('WorkingHoursEditor Component Unit Tests', () => {
  it('should render all 7 Egyptian week days starting with Saturday', () => {
    render(<WorkingHoursEditor onSave={vi.fn()} />);

    expect(screen.getByText('السبت')).toBeInTheDocument();
    expect(screen.getByText('الأحد')).toBeInTheDocument();
    expect(screen.getByText('الإثنين')).toBeInTheDocument();
    expect(screen.getByText('الثلاثاء')).toBeInTheDocument();
    expect(screen.getByText('الأربعاء')).toBeInTheDocument();
    expect(screen.getByText('الخميس')).toBeInTheDocument();
    expect(screen.getByText('الجمعة')).toBeInTheDocument();
  });

  it('should allow toggling a day to closed status', () => {
    render(<WorkingHoursEditor onSave={vi.fn()} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(7);

    // Toggle Saturday
    fireEvent.click(checkboxes[0]);
    expect(screen.getByText('عطلة أسبوعية / مغلق طوال اليوم')).toBeInTheDocument();
  });

  it('should trigger onSave callback with schedule payload', async () => {
    const handleSave = vi.fn().mockResolvedValueOnce();
    render(<WorkingHoursEditor onSave={handleSave} />);

    const saveButton = screen.getByRole('button', { name: /حفظ الجدول/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(handleSave).toHaveBeenCalledTimes(1);
    const payload = handleSave.mock.calls[0][0];
    expect(payload.length).toBe(7);
    expect(payload[0].day).toBe('SAT');
  });
});
