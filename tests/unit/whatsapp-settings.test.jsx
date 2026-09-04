import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WhatsAppSettingsModal } from '../../src/modules/whatsapp/components/WhatsAppSettingsModal.jsx';

describe('WhatsAppSettingsModal Unit Tests', () => {
  const mockConnection = {
    id: 'conn_1',
    provider: 'META',
    providerAccountId: '1105591915343508',
    providerPhoneNumberId: '1233113343227409',
    displayName: 'فرع المعادي',
    status: 'ACTIVE',
    hasApiToken: true,
    hasWebhookSecret: true,
    hasVerifyToken: true,
    verifyToken: 'PrimeRestaurantVerify2026_8xK',
  };

  it('renders modal with connection details prefilled', () => {
    render(
      <WhatsAppSettingsModal
        isOpen={true}
        onClose={vi.fn()}
        connection={mockConnection}
        onUpdate={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.getByText('تعديل إعدادات الواتساب')).toBeInTheDocument();
    expect(screen.getByDisplayValue('فرع المعادي')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1233113343227409')).toBeInTheDocument();
    expect(screen.getByText('يوجد توكن محفوظ ومشفّر')).toBeInTheDocument();
    expect(screen.getByText('يوجد Secret محفوظ ومشفّر')).toBeInTheDocument();
  });

  it('submits updated values when form is submitted', async () => {
    const handleUpdate = vi.fn().mockResolvedValue(true);
    const handleClose = vi.fn();

    render(
      <WhatsAppSettingsModal
        isOpen={true}
        onClose={handleClose}
        connection={mockConnection}
        onUpdate={handleUpdate}
        isLoading={false}
      />
    );

    const nameInput = screen.getByDisplayValue('فرع المعادي');
    fireEvent.change(nameInput, { target: { value: 'فرع التجمع' } });

    const submitBtn = screen.getByRole('button', { name: /حفظ التغييرات/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleUpdate).toHaveBeenCalledTimes(1);
    });

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: 'فرع التجمع',
        provider: 'META',
        providerPhoneNumberId: '1233113343227409',
        status: 'ACTIVE',
      })
    );
  });
});
