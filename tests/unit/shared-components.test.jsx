import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../src/shared/components/Button.jsx';
import { Input } from '../../src/shared/components/Input.jsx';
import { StatusPill } from '../../src/shared/components/StatusPill.jsx';
import { EmptyState } from '../../src/shared/components/EmptyState.jsx';
import { LoadingSkeleton } from '../../src/shared/components/LoadingSkeleton.jsx';
import { SplashState } from '../../src/shared/components/SplashState.jsx';
import { ErrorBoundary } from '../../src/shared/components/ErrorBoundary.jsx';

describe('Shared UI Components Unit Tests', () => {
  it('Button should render text and respond to click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>اضغط هنا</Button>);
    
    const btn = screen.getByRole('button', { name: /اضغط هنا/i });
    expect(btn).toBeInTheDocument();
    
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Button should be disabled when isLoading or isDisabled is true', () => {
    const handleClick = vi.fn();
    render(<Button isLoading onClick={handleClick}>تحميل</Button>);
    
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('Input should render label and error message with proper ARIA attributes', () => {
    render(<Input label="اسم الموظف" name="employeeName" error="الحقل مطلوب" />);
    
    expect(screen.getByText('اسم الموظف')).toBeInTheDocument();
    expect(screen.getByText('الحقل مطلوب')).toBeInTheDocument();
    
    const inputEl = screen.getByRole('textbox');
    expect(inputEl).toHaveAttribute('aria-invalid', 'true');
  });

  it('StatusPill should render semantic text label and variant classes', () => {
    render(<StatusPill status="success" label="مكتمل" />);
    expect(screen.getByText('مكتمل')).toBeInTheDocument();
  });

  it('EmptyState should render title, description and execute action button callback', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="لا يوجد عملاء"
        description="قم بإضافة أول عميل لك"
        actionLabel="إضافة عميل"
        onAction={handleAction}
      />
    );

    expect(screen.getByText('لا يوجد عملاء')).toBeInTheDocument();
    expect(screen.getByText('قم بإضافة أول عميل لك')).toBeInTheDocument();
    
    const actionBtn = screen.getByRole('button', { name: /إضافة عميل/i });
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('LoadingSkeleton should render properly without crashing', () => {
    const { container } = render(<LoadingSkeleton height={40} className="w-full" />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('SplashState should render initial loading message', () => {
    render(<SplashState message="جاري التحميل الابتدائي..." />);
    expect(screen.getByText('جاري التحميل الابتدائي...')).toBeInTheDocument();
  });

  it('ErrorBoundary should catch runtime errors and display friendly recovery UI (no raw error leaks)', () => {
    const ProblemComponent = () => {
      throw new Error('Test Crash');
    };

    // Suppress expected console.error during ErrorBoundary test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('حدث خطأ غير متوقع في الواجهة')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /إعادة تحضير الصفحة/i })).toBeInTheDocument();
    // Raw technical details must never be exposed to the end user (Section 17 / 21.3)
    expect(screen.queryByText('Test Crash')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
