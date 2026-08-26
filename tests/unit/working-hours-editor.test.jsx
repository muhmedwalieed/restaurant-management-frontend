import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WorkingHoursEditor } from '../../src/modules/branches/components/WorkingHoursEditor.jsx';
import * as AuthContextModule from '../../src/modules/auth/context/AuthContext.jsx';

describe('WorkingHoursEditor Component Unit Tests', () => {
  beforeEach(() => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { role: 'OWNER', permissions: ['branches.manage'] },
      hasPermission: () => true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('should render all 7 days (Saturday to Friday) with the table layout', () => {
    render(<WorkingHoursEditor onSave={vi.fn()} />);

    expect(screen.getByText('السبت')).toBeInTheDocument();
    expect(screen.getByText('الأحد')).toBeInTheDocument();
    expect(screen.getByText('الإثنين')).toBeInTheDocument();
    expect(screen.getByText('الثلاثاء')).toBeInTheDocument();
    expect(screen.getByText('الأربعاء')).toBeInTheDocument();
    expect(screen.getByText('الخميس')).toBeInTheDocument();
    expect(screen.getByText('الجمعة')).toBeInTheDocument();

    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBe(7);
  });

  it('should disable a day times when its activation toggle is off', () => {
    render(<WorkingHoursEditor onSave={vi.fn()} />);

    const switches = screen.getAllByRole('switch');

    fireEvent.click(switches[0]);
    expect(switches[0]).toHaveAttribute('aria-checked', 'false');

    const satStart = screen.getByLabelText('السبت، ساعة البداية');
    const satEnd = screen.getByLabelText('السبت، ساعة النهاية');
    expect(satStart).toBeDisabled();
    expect(satEnd).toBeDisabled();
  });

  it('should trigger onSave callback with schedule payload (Saturday first)', async () => {
    const handleSave = vi.fn().mockResolvedValueOnce();
    render(<WorkingHoursEditor onSave={handleSave} />);

    const saveButton = screen.getByRole('button', { name: /حفظ/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(handleSave).toHaveBeenCalledTimes(1);
    const payload = handleSave.mock.calls[0][0];
    expect(payload.length).toBe(7);
    expect(payload[0].day).toBe('SAT');
  });
});
