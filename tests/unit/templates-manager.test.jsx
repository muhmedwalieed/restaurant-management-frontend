import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TemplatesManager } from '../../src/modules/templates/components/TemplatesManager.jsx';
import * as templatesApi from '../../src/lib/api/templates.api.js';
import * as AuthContextModule from '../../src/modules/auth/context/AuthContext.jsx';

vi.mock('../../src/lib/api/templates.api.js', () => ({
  getTemplatesApi: vi.fn(),
  updateTemplatesApi: vi.fn(),
  resetTemplatesApi: vi.fn(),
}));

describe('TemplatesManager Component Unit Tests', () => {
  let queryClient;

  const mockTemplatesData = [
    {
      key: 'WHATSAPP_WELCOME',
      category: 'WHATSAPP_BOT',
      categoryLabel: 'بوت الواتساب التفاعلي',
      title: 'رسالة الترحيب الرئيسية',
      description: 'الرسالة التي يستلمها العميل عند بدء المحادثة مع البوت',
      allowedVariables: ['restaurantName'],
      defaultText: 'أهلاً بك في مطعمنا! كيف يمكننا مساعدتك اليوم؟',
      activeText: 'أهلاً بك في مطعمنا! كيف يمكننا مساعدتك اليوم؟',
      isCustom: false,
    },
    {
      key: 'ORDER_STATUS_CONFIRMED',
      category: 'ORDER_STATUS',
      categoryLabel: 'إشعارات حالات الطلب',
      title: 'إشعار تأكيد وبدء تجهيز الطلب',
      description: 'يُرسل عبر الواتساب فور تأكيد الطلب',
      allowedVariables: ['orderNumber', 'customerName'],
      defaultText: 'تحديث طلبك #{{orderNumber}}: تم تأكيد طلبك بنجاح!',
      activeText: 'تحديث طلبك #{{orderNumber}}: تم تأكيد طلبك بنجاح وبدأ الطهي!',
      isCustom: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'emp_1', role: 'OWNER' },
      hasPermission: () => true,
    });

    templatesApi.getTemplatesApi.mockResolvedValue({
      data: mockTemplatesData,
    });
    templatesApi.updateTemplatesApi.mockResolvedValue({
      data: { message: 'Updated' },
    });
    templatesApi.resetTemplatesApi.mockResolvedValue({
      data: { message: 'Reset' },
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TemplatesManager />
      </QueryClientProvider>
    );
  };

  it('renders templates list with title, description, allowed variables, and live preview', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('رسالة الترحيب الرئيسية')).toBeInTheDocument();
      expect(screen.getByText('إشعار تأكيد وبدء تجهيز الطلب')).toBeInTheDocument();
    });

    expect(screen.getByText('WHATSAPP_WELCOME')).toBeInTheDocument();
    expect(screen.getByText('ORDER_STATUS_CONFIRMED')).toBeInTheDocument();
    expect(screen.getByText('{{restaurantName}}')).toBeInTheDocument();
    expect(screen.getByText('{{orderNumber}}')).toBeInTheDocument();

    // Check Live Preview with replaced mock data for ORDER_STATUS_CONFIRMED (orderNumber -> 1042)
    expect(screen.getByText(/تحديث طلبك #1042: تم تأكيد طلبك بنجاح وبدأ الطهي!/i)).toBeInTheDocument();
  });

  it('filters templates when clicking a category tab', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('رسالة الترحيب الرئيسية')).toBeInTheDocument();
    });

    // Click on 'إشعارات حالات الطلب' category tab
    const orderStatusTab = screen.getByRole('button', { name: /إشعارات حالات الطلب/i });
    fireEvent.click(orderStatusTab);

    expect(screen.getByText('إشعار تأكيد وبدء تجهيز الطلب')).toBeInTheDocument();
    expect(screen.queryByText('رسالة الترحيب الرئيسية')).not.toBeInTheDocument();
  });

  it('clicking variable button appends variable into the textarea', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('رسالة الترحيب الرئيسية')).toBeInTheDocument();
    });

    const varBtn = screen.getByText('{{restaurantName}}');
    fireEvent.click(varBtn);

    const textareas = screen.getAllByPlaceholderText('اكتب نص القالب هنا...');
    expect(textareas[0].value).toContain('{{restaurantName}}');
  });

  it('allows editing text and saves changes via updateTemplatesApi', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('رسالة الترحيب الرئيسية')).toBeInTheDocument();
    });

    const textareas = screen.getAllByPlaceholderText('اكتب نص القالب هنا...');
    fireEvent.change(textareas[0], {
      target: { value: 'أهلاً بك في الفرع السعيد الجديد!' },
    });

    const saveButtons = screen.getAllByRole('button', { name: /حفظ التعديل/i });
    expect(saveButtons[0]).not.toBeDisabled();

    fireEvent.click(saveButtons[0]);

    await waitFor(() => {
      expect(templatesApi.updateTemplatesApi).toHaveBeenCalledWith({
        templates: {
          WHATSAPP_WELCOME: 'أهلاً بك في الفرع السعيد الجديد!',
        },
      });
    });
  });

  it('allows resetting a customized template back to default', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('إشعار تأكيد وبدء تجهيز الطلب')).toBeInTheDocument();
    });

    // ORDER_STATUS_CONFIRMED isCustom=true, so it has 'استعادة الافتراضي'
    const resetButtons = screen.getAllByRole('button', { name: /استعادة الافتراضي/i });
    fireEvent.click(resetButtons[0]);

    // Confirmation dialog should open
    await waitFor(() => {
      expect(
        screen.getByText(
          'هل أنت متأكد من استعادة النص الافتراضي لقالب "إشعار تأكيد وبدء تجهيز الطلب"؟ سيتم إلغاء التعديلات الخاصة بمطعمك.'
        )
      ).toBeInTheDocument();
    });

    // The modal now has another 'استعادة الافتراضي' button as confirmLabel
    const allResetButtons = screen.getAllByRole('button', { name: /استعادة الافتراضي/i });
    fireEvent.click(allResetButtons[allResetButtons.length - 1]);

    await waitFor(() => {
      expect(templatesApi.resetTemplatesApi).toHaveBeenCalledWith({
        key: 'ORDER_STATUS_CONFIRMED',
      });
    });
  });
});
