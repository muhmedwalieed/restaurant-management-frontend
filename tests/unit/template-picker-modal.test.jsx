import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TemplatePickerModal } from '../../src/modules/whatsapp/components/TemplatePickerModal.jsx';
import * as templatesApi from '../../src/lib/api/templates.api.js';
import * as AuthContextModule from '../../src/modules/auth/context/AuthContext.jsx';

vi.mock('../../src/lib/api/templates.api.js', () => ({
  getTemplatesApi: vi.fn(),
}));

describe('TemplatePickerModal Component Unit Tests', () => {
  let queryClient;

  const mockTemplates = [
    {
      key: 'INBOX_GREETING',
      category: 'INBOX_SUPPORT',
      title: 'ترحيب خدمة العملاء',
      activeText: 'أهلاً بك يا {{customerName}}، معك {{agentName}} بخصوص تذكرة رقم #{{ticketNumber}}.',
      isCustom: false,
    },
    {
      key: 'CUSTOM_ORDER_READY',
      category: 'QUICK_REPLY',
      title: 'طلبك جاهز للاستلام',
      activeText: 'طلبك رقم #{{orderNumber}} أصبح جاهزاً للاستلام الآن!',
      isCustom: true,
      isUserCreated: true,
    },
  ];

  const mockTicket = {
    id: 'tkt_1',
    ticketNumber: '105',
    customerName: 'طارق عبد الله',
    customerPhone: '+201012345678',
    orderNumber: '990',
    subject: 'استفسار عن موعد الوصول',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'emp_1', name: 'أحمد شريف', role: 'SUPPORT_AGENT' },
      hasPermission: () => true,
    });

    templatesApi.getTemplatesApi.mockResolvedValue({
      data: mockTemplates,
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TemplatePickerModal
          isOpen={true}
          onClose={vi.fn()}
          onSelect={vi.fn()}
          ticket={mockTicket}
          {...props}
        />
      </QueryClientProvider>
    );
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = renderComponent({ isOpen: false });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders templates list with ticket variables interpolated correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('ترحيب خدمة العملاء')).toBeInTheDocument();
      expect(screen.getByText('طلبك جاهز للاستلام')).toBeInTheDocument();
    });

    // Check that {{customerName}}, {{agentName}}, {{ticketNumber}} were replaced with real ticket data
    expect(
      screen.getByText(/أهلاً بك يا طارق عبد الله، معك أحمد شريف بخصوص تذكرة رقم #105\./i)
    ).toBeInTheDocument();

    // Check orderNumber interpolated
    expect(
      screen.getByText(/طلبك رقم #990 أصبح جاهزاً للاستلام الآن!/i)
    ).toBeInTheDocument();
  });

  it('filters templates when typing in search input', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('ترحيب خدمة العملاء')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('ابحث في القوالب بالاسم أو النص...');
    fireEvent.change(searchInput, { target: { value: 'جاهز' } });

    expect(screen.getByText('طلبك جاهز للاستلام')).toBeInTheDocument();
    expect(screen.queryByText('ترحيب خدمة العملاء')).not.toBeInTheDocument();
  });

  it('calls onSelect with interpolated text and closes when clicking "استخدام هذا القالب"', async () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    renderComponent({ onSelect: handleSelect, onClose: handleClose });

    await waitFor(() => {
      expect(screen.getByText('ترحيب خدمة العملاء')).toBeInTheDocument();
    });

    const useButtons = screen.getAllByRole('button', { name: /استخدام هذا القالب/i });
    fireEvent.click(useButtons[0]);

    expect(handleSelect).toHaveBeenCalledWith(
      'أهلاً بك يا طارق عبد الله، معك أحمد شريف بخصوص تذكرة رقم #105.'
    );
    expect(handleClose).toHaveBeenCalled();
  });
});
