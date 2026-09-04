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
  createTemplateApi: vi.fn(),
  deleteTemplateApi: vi.fn(),
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
      isUserCreated: false,
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
      isUserCreated: false,
    },
    {
      key: 'CUSTOM_DELAY',
      category: 'INBOX_SUPPORT',
      categoryLabel: 'خدمة العملاء والدعم',
      title: 'اعتذار عن تأخير الطلب',
      description: 'قالب إشعار التأخير المخصص',
      allowedVariables: ['customerName'],
      defaultText: 'نعتذر عن التأخير يا {{customerName}}',
      activeText: 'نعتذر عن التأخير يا {{customerName}}',
      isCustom: true,
      isUserCreated: true,
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
    templatesApi.createTemplateApi.mockResolvedValue({
      success: true,
      data: { key: 'CUSTOM_NEW' },
    });
    templatesApi.deleteTemplateApi.mockResolvedValue({
      success: true,
      data: [],
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

  it('renders custom badge for user-created template and allows deleting it', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('اعتذار عن تأخير الطلب')).toBeInTheDocument();
    });

    // Check user-created badge
    expect(screen.getByText('قالب مخصص لك')).toBeInTheDocument();

    // Click 'حذف القالب'
    const deleteButton = screen.getByRole('button', { name: /حذف القالب/i });
    fireEvent.click(deleteButton);

    // Confirm dialog appears
    await waitFor(() => {
      expect(
        screen.getByText('هل أنت متأكد من حذف قالب "اعتذار عن تأخير الطلب" نهائياً؟ لن تتمكن من استعادته.')
      ).toBeInTheDocument();
    });

    const confirmDeleteBtn = screen.getByRole('button', { name: /حذف نهائي/i });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(templatesApi.deleteTemplateApi).toHaveBeenCalledWith('CUSTOM_DELAY');
    });
  });

  it('opens CreateTemplateModal and calls createTemplateApi on submit', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('رسالة الترحيب الرئيسية')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /إضافة قالب جديد/i });
    fireEvent.click(addBtn);

    // Modal opens
    await waitFor(() => {
      expect(screen.getByText('إضافة قالب رسالة جديد')).toBeInTheDocument();
    });

    // Fill form
    const titleInput = screen.getByPlaceholderText('مثال: اعتذار عن تأخر تحضير الطلب');
    const textInput = screen.getByPlaceholderText(/اكتب نص الرسالة هنا/i);

    fireEvent.change(titleInput, { target: { value: 'عرض خاص جديد' } });
    fireEvent.change(textInput, { target: { value: 'أهلاً بك {{customerName}} في عرضنا الخاص!' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /إنشاء القالب/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(templatesApi.createTemplateApi).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'عرض خاص جديد',
          text: 'أهلاً بك {{customerName}} في عرضنا الخاص!',
          category: 'INBOX_SUPPORT',
        })
      );
    });
  });

  it('returns null and does not query templates if user lacks manage permission', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'emp_2', role: 'STAFF' },
      hasPermission: () => false,
    });

    const { container } = renderComponent();
    expect(container).toBeEmptyDOMElement();
    expect(templatesApi.getTemplatesApi).not.toHaveBeenCalled();
  });
});

