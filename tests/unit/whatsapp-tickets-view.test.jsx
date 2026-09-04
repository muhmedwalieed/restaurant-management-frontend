import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WhatsAppTicketsView } from '../../src/modules/whatsapp/components/WhatsAppTicketsView.jsx';
import * as inboxApi from '../../src/lib/api/inbox.api.js';
import * as AuthContextModule from '../../src/modules/auth/context/AuthContext.jsx';

vi.mock('../../src/lib/api/inbox.api.js', () => ({
  getTicketsApi: vi.fn().mockResolvedValue({
    items: [
      {
        id: 'ticket_1',
        ticketNumber: 101,
        ticketType: 'COMPLAINT',
        status: 'ACTIVE',
        assignedAgentId: 'emp_1',
        subject: 'شكوى بخصوص أوردر #15',
        customerPhone: '+201011112222',
        customer: { name: 'أحمد محمود' },
        relatedOrder: { id: 'ord_15', orderNumber: 15, total: 350, status: 'DELIVERED' },
        lastMessageAt: '2026-08-30T19:00:00.000Z',
      },
    ],
    pagination: { total: 1, totalPages: 1 },
  }),
  getTicketApi: vi.fn().mockResolvedValue({
    id: 'ticket_1',
    ticketNumber: 101,
    ticketType: 'COMPLAINT',
    status: 'ACTIVE',
    assignedAgentId: 'emp_1',
    subject: 'شكوى بخصوص أوردر #15',
    customerPhone: '+201011112222',
    customer: { name: 'أحمد محمود' },
    relatedOrder: { id: 'ord_15', orderNumber: 15, total: 350, status: 'DELIVERED' },
    messages: [
      {
        id: 'msg_1',
        senderType: 'CUSTOMER',
        content: 'الأوردر وصل بارد والطلب ناقص',
        isInternal: false,
        createdAt: '2026-08-30T19:00:00.000Z',
      },
    ],
    logs: [
      {
        id: 'log_1',
        action: 'CREATED',
        actorType: 'CUSTOMER',
        createdAt: '2026-08-30T19:00:00.000Z',
      },
    ],
  }),
  createTicketApi: vi.fn().mockResolvedValue({
    id: 'ticket_2',
    ticketNumber: 102,
    ticketType: 'SUPPORT',
  }),
  replyTicketApi: vi.fn().mockResolvedValue({}),
  addTicketNoteApi: vi.fn().mockResolvedValue({}),
  assignTicketApi: vi.fn().mockResolvedValue({}),
  resolveTicketApi: vi.fn().mockResolvedValue({}),
  closeTicketApi: vi.fn().mockResolvedValue({}),
  submitFeedbackApi: vi.fn().mockResolvedValue({}),
}));

const renderWithProviders = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('WhatsAppTicketsView Component Unit Tests', () => {
  beforeEach(() => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'emp_1', name: 'موظف الدعم', role: 'OWNER', permissions: ['chats.view', 'chats.reply', 'chats.assign', 'chats.close', 'chats.takeover'] },
      hasPermission: () => true,
    });
  });

  it('renders tickets list with ticket number, type badge, linked order, and isolated messages', async () => {
    renderWithProviders(<WhatsAppTicketsView />);

    await waitFor(() => {
      expect(screen.getByText('قائمة التذاكر (1)')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('الأوردر وصل بارد والطلب ناقص')).toBeInTheDocument();
    });

    expect(screen.getAllByText('شكوى أوردر').length).toBeGreaterThan(0);
    expect(screen.getAllByText('شكوى بخصوص أوردر #15').length).toBeGreaterThan(0);
    expect(screen.getAllByText('أوردر #15').length).toBeGreaterThan(0);
  });

  it('allows agent to send reply to the ticket', async () => {
    renderWithProviders(<WhatsAppTicketsView />);

    await waitFor(() => {
      expect(screen.getByText('الأوردر وصل بارد والطلب ناقص')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('اكتب رسالة واتساب للعميل في هذه التذكرة...');
    fireEvent.change(input, { target: { value: 'نعتذر منك، سنقوم بإرسال طلب بديل فوراً' } });

    const sendBtn = screen.getByRole('button', { name: /إرسال/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(inboxApi.replyTicketApi).toHaveBeenCalledWith('ticket_1', {
        content: 'نعتذر منك، سنقوم بإرسال طلب بديل فوراً',
      });
    });
  });

  it('opens Resolution Modal on close and submits resolution form', async () => {
    renderWithProviders(<WhatsAppTicketsView />);

    await waitFor(() => {
      expect(screen.getByText('الأوردر وصل بارد والطلب ناقص')).toBeInTheDocument();
    });

    const closeBtn = screen.getByRole('button', { name: /إغلاق التذكرة/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.getByText('نموذج إغلاق التذكرة وتوثيق الحل')).toBeInTheDocument();
    });

    const notesInput = screen.getByPlaceholderText(/اكتب الإجراء الذي تم اتخاذه/i);
    fireEvent.change(notesInput, { target: { value: 'تم تعويض العميل بوجبة بديلة مجاناً' } });

    const submitCloseBtn = screen.getByRole('button', { name: /تأكيد الإغلاق وإرسال التقييم/i });
    fireEvent.click(submitCloseBtn);

    await waitFor(() => {
      expect(inboxApi.closeTicketApi).toHaveBeenCalledWith('ticket_1', expect.objectContaining({
        resolutionStatus: 'RESOLVED',
        resolutionNotes: 'تم تعويض العميل بوجبة بديلة مجاناً',
      }));
    });
  });

  it('switches to Activity Logs tab and displays ticket history', async () => {
    renderWithProviders(<WhatsAppTicketsView />);

    await waitFor(() => {
      expect(screen.getByText(/سجل الأحداث/i)).toBeInTheDocument();
    });

    const logsTabBtn = screen.getByRole('button', { name: /سجل الأحداث/i });
    fireEvent.click(logsTabBtn);

    await waitFor(() => {
      expect(screen.getByText('سجل النشاط والأحداث للتذكرة')).toBeInTheDocument();
      expect(screen.getByText('تم فتح التذكرة')).toBeInTheDocument();
    });
  });
});
