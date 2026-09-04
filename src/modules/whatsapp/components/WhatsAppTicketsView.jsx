import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import {
  useTicketsQuery,
  useTicketDetailQuery,
  useCreateTicketMutation,
  useReplyTicketMutation,
  useAddTicketNoteMutation,
  useAssignTicketMutation,
  useCloseTicketMutation,
  useTakeoverTicketMutation,
} from '../hooks/useInboxTickets.js';
import {
  TICKET_STATUS_LABELS,
  ticketStatusPill,
  TICKET_TYPE_LABELS,
  ticketTypeBadgeClass,
  RESOLUTION_STATUS_LABELS,
  RESOLUTION_CATEGORY_LABELS,
} from '../schemas/ticket.schema.js';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { Modal } from '../../../shared/components/Modal.jsx';
import {
  Search,
  Send,
  Phone,
  User,
  Headset,
  Lock,
  Plus,
  RefreshCw,
  Tag,
  FileText,
  ShoppingBag,
  MessageSquare,
  XCircle,
  Clock,
  Star,
  Activity,
  UserCheck,
  Shield,
  CheckCircle2,
} from 'lucide-react';

export const WhatsAppTicketsView = () => {
  const { user, hasPermission } = useAuth();
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activePaneTab, setActivePaneTab] = useState('CHAT'); // 'CHAT' | 'LOGS'
  const [messageMode, setMessageMode] = useState('REPLY'); // 'REPLY' | 'NOTE'
  const [messageText, setMessageText] = useState('');

  // Modals
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isCloseResolutionModalOpen, setIsCloseResolutionModalOpen] = useState(false);

  const [newTicketForm, setNewTicketForm] = useState({
    customerPhone: '',
    ticketType: 'SUPPORT',
    subject: '',
    initialMessage: '',
  });

  const [closeResolutionForm, setCloseResolutionForm] = useState({
    resolutionStatus: 'RESOLVED',
    resolutionCategory: 'GENERAL_INQUIRY',
    resolutionNotes: '',
  });

  const messagesEndRef = useRef(null);

  const {
    data: ticketsResponse,
    isLoading: isTicketsLoading,
    refetch: refetchTickets,
  } = useTicketsQuery({
    limit: 50,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    ticketType: typeFilter === 'ALL' ? undefined : typeFilter,
    q: searchQuery.trim() || undefined,
  });

  const tickets = useMemo(() => ticketsResponse?.items || [], [ticketsResponse?.items]);

  useEffect(() => {
    if (!selectedTicketId && tickets.length > 0) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

  const {
    data: activeTicket,
    refetch: refetchDetail,
  } = useTicketDetailQuery(selectedTicketId);

  const createMutation = useCreateTicketMutation();
  const replyMutation = useReplyTicketMutation();
  const noteMutation = useAddTicketNoteMutation();
  const assignMutation = useAssignTicketMutation();
  const closeMutation = useCloseTicketMutation();
  const takeoverMutation = useTakeoverTicketMutation();

  const messages = activeTicket?.messages || [];
  const logs = activeTicket?.logs || [];

  useEffect(() => {
    if (activePaneTab === 'CHAT' && typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, selectedTicketId, activePaneTab]);

  const isOwnerOrAdmin =
    user?.role === 'OWNER' ||
    user?.role === 'ADMIN' ||
    user?.role === 'owner' ||
    user?.role === 'admin' ||
    hasPermission?.('chats.takeover');

  const isAssignedToMe = activeTicket?.assignedAgentId === user?.id;
  const isAssignedToOther = Boolean(activeTicket?.assignedAgentId && activeTicket?.assignedAgentId !== user?.id);
  const isUnassigned = !activeTicket?.assignedAgentId;
  const isClosed = activeTicket?.status === 'CLOSED';

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedTicketId) return;

    if (messageMode === 'REPLY') {
      await replyMutation.mutateAsync({
        id: selectedTicketId,
        content: messageText.trim(),
      });
    } else {
      await noteMutation.mutateAsync({
        id: selectedTicketId,
        content: messageText.trim(),
      });
    }

    setMessageText('');
    refetchDetail();
  };

  const handleCreateNewTicket = async (e) => {
    e.preventDefault();
    if (!newTicketForm.customerPhone.trim()) return;

    let cleanPhone = newTicketForm.customerPhone.trim();
    if (!cleanPhone.startsWith('+') && cleanPhone.startsWith('01')) {
      cleanPhone = '+2' + cleanPhone;
    }

    const created = await createMutation.mutateAsync({
      ...newTicketForm,
      customerPhone: cleanPhone,
    });

    setIsNewTicketModalOpen(false);
    setNewTicketForm({ customerPhone: '', ticketType: 'SUPPORT', subject: '', initialMessage: '' });

    if (created?.data?.id || created?.id) {
      setSelectedTicketId(created?.data?.id || created?.id);
    }
    refetchTickets();
  };

  const handleAssignToMe = async () => {
    if (!selectedTicketId) return;
    await assignMutation.mutateAsync({ id: selectedTicketId, agentId: user?.id });
    refetchDetail();
    refetchTickets();
  };

  const handleConfirmClose = async (e) => {
    e.preventDefault();
    if (!selectedTicketId) return;

    await closeMutation.mutateAsync({
      id: selectedTicketId,
      ...closeResolutionForm,
    });

    setIsCloseResolutionModalOpen(false);
    refetchDetail();
    refetchTickets();
  };

  const handleTakeover = async () => {
    if (!selectedTicketId) return;
    await takeoverMutation.mutateAsync(selectedTicketId);
    refetchDetail();
    refetchTickets();
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5 text-status-warning">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${
              s <= (rating || 0) ? 'fill-status-warning text-status-warning' : 'text-txt-dim stroke-1'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden flex flex-col md:flex-row h-[780px] w-full shadow-sm">
      {}
      <div className="w-full md:w-[330px] lg:w-[360px] h-full flex flex-col shrink-0 border-l border-border-default bg-bg-base overflow-hidden">
        {}
        <div className="p-3 border-b border-border-default space-y-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-txt-primary flex items-center gap-1.5 uppercase tracking-wider">
              <Tag className="w-4 h-4 text-brand-primary" />
              <span>قائمة التذاكر ({tickets.length})</span>
            </h2>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                icon={RefreshCw}
                className="p-1.5 text-txt-muted hover:text-txt-primary"
                onClick={() => {
                  refetchTickets();
                  refetchDetail();
                }}
                title="تحديث قائمة التذاكر"
              />
              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                className="text-xs px-2.5 py-1 h-7 font-bold"
                onClick={() => setIsNewTicketModalOpen(true)}
              >
                تذكرة جديدة
              </Button>
            </div>
          </div>

          {}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none" />
            <input
              type="text"
              placeholder="بحث برقم الهاتف، الموضوع، العميل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pr-9 pl-3 rounded-md bg-bg-surface border border-border-default text-txt-primary text-xs focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>

          {}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
            {[
              { key: 'ALL', label: 'الكل' },
              { key: 'SUPPORT', label: 'دعم فني' },
              { key: 'COMPLAINT', label: 'شكاوى' },
              { key: 'ORDER', label: 'طلبات' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTypeFilter(t.key)}
                className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                  typeFilter === t.key
                    ? 'bg-brand-primary text-txt-inverted font-bold'
                    : 'bg-bg-surface text-txt-muted hover:text-txt-primary border border-border-default'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {}
          <div className="flex items-center gap-2">
            <Select
              options={[
                { value: 'ALL', label: 'جميع الحالات' },
                { value: 'WAITING', label: 'بانتظار موظف' },
                { value: 'ACTIVE', label: 'قيد المتابعة' },
                { value: 'PENDING', label: 'بانتظار العميل' },
                { value: 'RESOLVED', label: 'تم الحل' },
                { value: 'CLOSED', label: 'مغلقة' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-7 text-xs py-0 w-full"
            />
          </div>
        </div>

        {}
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border-subtle">
          {isTicketsLoading ? (
            <div className="p-4 text-center text-xs text-txt-muted">جاري تحميل التذاكر...</div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Tag className="w-8 h-8 text-txt-dim mx-auto stroke-1" />
              <p className="text-xs text-txt-muted">لا توجد تذاكر مطابقة</p>
            </div>
          ) : (
            tickets.map((t) => {
              const isSelected = selectedTicketId === t.id;
              const ticketNum = t.ticketNumber ? `#T-${t.ticketNumber}` : `#${t.id.slice(-4)}`;

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`w-full p-3 text-right flex flex-col gap-1.5 transition-colors ${
                    isSelected
                      ? 'bg-bg-surface border-r-4 border-brand-primary'
                      : 'hover:bg-bg-surface/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-txt-dim dir-ltr">
                        {ticketNum}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${ticketTypeBadgeClass(
                          t.ticketType
                        )}`}
                      >
                        {TICKET_TYPE_LABELS[t.ticketType] || t.ticketType}
                      </span>
                    </div>
                    <StatusPill status={ticketStatusPill(t.status)}>
                      {TICKET_STATUS_LABELS[t.status] || t.status}
                    </StatusPill>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-txt-primary truncate">
                      {t.subject || 'تذكرة بدون عنوان'}
                    </span>
                    <span className="text-[10px] text-txt-dim shrink-0">
                      {new Date(t.lastMessageAt || t.createdAt).toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs text-txt-muted">
                    <span className="dir-ltr text-right truncate font-medium">
                      {t.customer?.name ? `${t.customer.name} · ${t.customerPhone}` : t.customerPhone}
                    </span>
                    {t.assignedAgent && (
                      <span className="text-[10px] text-txt-dim truncate">
                        المسؤول: {t.assignedAgent.name}
                      </span>
                    )}
                  </div>

                  {t.relatedOrder && (
                    <div className="flex items-center gap-1 text-[11px] text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded border border-brand-primary/10 w-fit mt-0.5">
                      <ShoppingBag className="w-3 h-3" />
                      <span>أوردر #{t.relatedOrder.orderNumber}</span>
                      <span className="text-txt-dim">({Number(t.relatedOrder.total).toFixed(2)} EGP)</span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {}
      <div className="flex-1 h-full min-w-0 flex flex-col bg-bg-surface overflow-hidden">
        {activeTicket ? (
          <>
            {}
            <div className="shrink-0 z-10 bg-bg-base border-b border-border-default p-3.5 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-bg-surface border border-border-default text-txt-primary dir-ltr">
                    {activeTicket.ticketNumber ? `#T-${activeTicket.ticketNumber}` : `#${activeTicket.id.slice(-4)}`}
                  </span>
                  <h3 className="text-sm font-bold text-txt-primary">
                    {activeTicket.subject || 'محادثة تذكرة'}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border font-medium ${ticketTypeBadgeClass(
                      activeTicket.ticketType
                    )}`}
                  >
                    {TICKET_TYPE_LABELS[activeTicket.ticketType] || activeTicket.ticketType}
                  </span>
                  <StatusPill status={ticketStatusPill(activeTicket.status)}>
                    {TICKET_STATUS_LABELS[activeTicket.status] || activeTicket.status}
                  </StatusPill>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  {!isClosed && isUnassigned && (
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Headset}
                      className="text-xs h-8 px-3.5 font-bold shadow-xs"
                      isLoading={assignMutation.isPending}
                      onClick={handleAssignToMe}
                    >
                      تولّي التذكرة
                    </Button>
                  )}

                  {!isClosed && isAssignedToMe && (
                    <span className="text-xs px-2.5 py-1 rounded bg-status-success-bg text-status-success border border-status-success/30 font-bold flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      أنت المسؤول عن التذكرة
                    </span>
                  )}

                  {!isClosed && isOwnerOrAdmin && isAssignedToOther && (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Shield}
                      className="text-xs h-8 px-2.5 text-brand-primary border-brand-primary/30 font-medium"
                      isLoading={takeoverMutation.isPending}
                      onClick={handleTakeover}
                      title="سحب التذكرة للمشرف"
                    >
                      سحب للمشرف
                    </Button>
                  )}

                  {!isClosed && (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={XCircle}
                      className="text-xs h-8 px-3.5 text-status-danger bg-status-danger-bg/20 hover:bg-status-danger-bg border-status-danger/40 font-bold"
                      onClick={() => setIsCloseResolutionModalOpen(true)}
                      title="إغلاق التذكرة وتعبئة نموذج الحل"
                    >
                      إغلاق التذكرة
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs text-txt-muted border-t border-border-subtle pt-2 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-brand-primary" />
                    <strong className="text-txt-primary dir-ltr font-mono">{activeTicket.customerPhone}</strong>
                  </span>
                  {activeTicket.customer?.name && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-txt-dim" />
                      <span>{activeTicket.customer.name}</span>
                    </span>
                  )}
                  <span className="text-txt-dim">
                    المسؤول:{' '}
                    <strong className="text-txt-primary">
                      {activeTicket.assignedAgent?.name || 'غير معين'}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-bg-surface p-0.5 rounded border border-border-default">
                  <button
                    type="button"
                    onClick={() => setActivePaneTab('CHAT')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                      activePaneTab === 'CHAT'
                        ? 'bg-brand-primary text-txt-inverted font-bold'
                        : 'text-txt-muted hover:text-txt-primary'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>المحادثة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePaneTab('LOGS')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                      activePaneTab === 'LOGS'
                        ? 'bg-brand-primary text-txt-inverted font-bold'
                        : 'text-txt-muted hover:text-txt-primary'
                    }`}
                  >
                    <Activity className="w-3 h-3" />
                    <span>سجل الأحداث ({logs.length})</span>
                  </button>
                </div>
              </div>

              {/* Linked Order Banner */}
              {activeTicket.relatedOrder && (
                <div className="p-2.5 rounded-md bg-brand-primary/5 border border-brand-primary/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-brand-primary shrink-0" />
                    <div>
                      <span className="font-bold text-txt-primary">
                        مرتبط بطلب: أوردر #{activeTicket.relatedOrder.orderNumber}
                      </span>
                      <span className="text-txt-muted mr-2">
                        (الحالة: {activeTicket.relatedOrder.status} · الإجمالي:{' '}
                        {Number(activeTicket.relatedOrder.total).toFixed(2)} ج.م)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Pane */}
            {activePaneTab === 'CHAT' ? (
              <>
                {isUnassigned ? (
                  <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-bg-base/40">
                    <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-sm">
                      <Headset className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5 max-w-sm">
                      <h4 className="text-sm font-bold text-txt-primary">التذكرة بانتظار تولّي الموظف</h4>
                      <p className="text-xs text-txt-muted leading-relaxed">
                        يجب تولّي التذكرة أولاً لتتمكن من قراءة محادثة العميل والبدء في التواصل والرد عليه.
                      </p>
                    </div>
                    <Button
                      size="md"
                      variant="primary"
                      icon={Headset}
                      className="font-bold text-xs px-6 py-2.5 shadow-sm"
                      isLoading={assignMutation.isPending}
                      onClick={handleAssignToMe}
                    >
                      تولّي هذه التذكرة الآن
                    </Button>
                  </div>
                ) : isAssignedToOther && !isOwnerOrAdmin ? (
                  <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-bg-base/40">
                    <div className="w-14 h-14 rounded-2xl bg-status-warning-bg border border-status-warning/30 flex items-center justify-center text-status-warning shadow-sm">
                      <Lock className="w-7 h-7" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h4 className="text-sm font-bold text-txt-primary">التذكرة مخصصة لموظف آخر</h4>
                      <p className="text-xs text-txt-muted leading-relaxed">
                        هذه التذكرة قيد المتابعة حالياً مع الموظف <strong>({activeTicket.assignedAgent?.name || 'موظف آخر'})</strong>.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-bg-base/40">
                    <div className="p-2 rounded-md bg-bg-surface border border-border-default text-xs text-txt-dim flex items-center justify-center gap-2 text-center shadow-xs">
                      <Lock className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      <span>
                        هذه المحادثة معزولة وخاصة بهذه التذكرة فقط (الرسائل السابقة للتذاكر الأخرى لا تظهر هنا).
                      </span>
                    </div>

                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                        <MessageSquare className="w-8 h-8 text-txt-dim mx-auto stroke-1" />
                        <p className="text-xs text-txt-muted">لا توجد رسائل داخل هذه التذكرة بعد.</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isInternal = msg.isInternal;
                        const isAgent = msg.senderType === 'AGENT';

                        if (isInternal) {
                          return (
                            <div key={msg.id} className="p-3 rounded-lg bg-status-warning-bg border border-status-warning/30 text-xs text-txt-primary space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-status-warning font-bold">
                                <span className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  ملاحظة داخلية للموظفين فقط ({msg.agent?.name || 'موظف'})
                                </span>
                                <span>{new Date(msg.createdAt).toLocaleTimeString('ar-EG')}</span>
                              </div>
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`max-w-[78%] rounded-xl px-3.5 py-2.5 shadow-sm text-xs leading-relaxed ${
                                isAgent
                                  ? 'bg-brand-primary text-txt-inverted rounded-bl-none'
                                  : 'bg-bg-surface border border-border-default text-txt-primary rounded-br-none'
                              }`}
                            >
                              <span className="block text-[10px] font-bold opacity-80 mb-0.5">
                                {isAgent ? msg.agent?.name || 'خدمة العملاء' : activeTicket.customer?.name || activeTicket.customerPhone}
                              </span>
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              <div
                                className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                                  isAgent ? 'text-txt-inverted/80' : 'text-txt-dim'
                                }`}
                              >
                                <span>
                                  {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {/* Reply / Bottom Action Section */}
                <div className="shrink-0 z-10 bg-bg-surface border-t border-border-default p-3 space-y-2">
                  {isClosed ? (
                    <div className="p-3.5 rounded-lg bg-bg-base border border-border-default space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2">
                        <div className="flex items-center gap-1.5 font-bold text-status-danger">
                          <Lock className="w-4 h-4 shrink-0" />
                          <span>تم إغلاق التذكرة.</span>
                        </div>
                        <span className="text-[11px] text-txt-dim">
                          {new Date(activeTicket.closedAt || activeTicket.updatedAt).toLocaleString('ar-EG')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-txt-muted">حالة الحل: </span>
                          <strong className="text-txt-primary">
                            {RESOLUTION_STATUS_LABELS[activeTicket.resolutionStatus] || activeTicket.resolutionStatus || 'تم الحل'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-txt-muted">التصنيف: </span>
                          <strong className="text-txt-primary">
                            {RESOLUTION_CATEGORY_LABELS[activeTicket.resolutionCategory] || activeTicket.resolutionCategory || 'استفسار'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-txt-muted">أغلقت بواسطة: </span>
                          <strong className="text-txt-primary">
                            {activeTicket.closedBy?.name || 'الموظف المسؤول'}
                          </strong>
                        </div>
                      </div>

                      {activeTicket.resolutionNotes && (
                        <div className="p-2 bg-bg-surface rounded border border-border-subtle text-[11px] text-txt-primary">
                          <span className="text-txt-muted font-bold block mb-0.5">ملاحظات الإغلاق:</span>
                          <p className="whitespace-pre-wrap">{activeTicket.resolutionNotes}</p>
                        </div>
                      )}

                      {activeTicket.feedbackRating ? (
                        <div className="p-2.5 bg-status-warning-bg/20 rounded border border-status-warning/30 flex items-center justify-between gap-2 text-xs mt-2">
                          <div className="space-y-0.5">
                            <span className="font-bold text-txt-primary flex items-center gap-1.5">
                              <span>تقييم العميل للخدمة:</span>
                              {renderStars(activeTicket.feedbackRating)}
                              <span className="font-mono">({activeTicket.feedbackRating}/5)</span>
                            </span>
                            {activeTicket.feedbackComment && (
                              <p className="text-[11px] text-txt-muted italic">&ldquo;{activeTicket.feedbackComment}&rdquo;</p>
                            )}
                          </div>
                          {activeTicket.feedbackResolved !== null && (
                            <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${activeTicket.feedbackResolved ? 'bg-status-success-bg text-status-success' : 'bg-status-danger-bg text-status-danger'}`}>
                              {activeTicket.feedbackResolved ? 'تم الحل بنجاح' : 'لم تُحل المشكلة'}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px] text-txt-dim italic pt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>تم إرسال استبيان التقييم للعميل عبر الواتساب وبانتظار رده...</span>
                        </div>
                      )}
                    </div>
                  ) : isUnassigned ? (
                    <div className="p-3 bg-bg-base/60 rounded-lg border border-border-default text-center text-xs text-txt-muted flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4 text-txt-dim" />
                      <span>قم بتولّي التذكرة أولاً لتفعيل صندوق الرد والملاحظات.</span>
                    </div>
                  ) : isAssignedToOther && !isOwnerOrAdmin ? (
                    <div className="p-3 rounded-lg bg-status-warning-bg/20 border border-status-warning/40 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-txt-primary">
                        <Lock className="w-4 h-4 text-status-warning shrink-0" />
                        <span>
                          هذه التذكرة قيد المتابعة مع الموظف <strong>({activeTicket.assignedAgent?.name || 'موظف آخر'})</strong>. لا يمكنك الرد عليها حالياً.
                        </span>
                      </div>
                    </div>
                  ) : isAssignedToOther && isOwnerOrAdmin ? (
                    <div className="p-3 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-txt-primary">
                        <Shield className="w-4 h-4 text-brand-primary shrink-0" />
                        <span>
                          التذكرة مخصصة للموظف <strong>({activeTicket.assignedAgent?.name || 'موظف'})</strong>. بصفتك مشرفاً يمكنك سحبها لتتولى الرد بنفسك.
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={Shield}
                        className="text-xs h-7 shrink-0 font-bold"
                        isLoading={takeoverMutation.isPending}
                        onClick={handleTakeover}
                      >
                        سحب التذكرة للمشرف
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setMessageMode('REPLY')}
                          className={`text-xs px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                            messageMode === 'REPLY'
                              ? 'bg-brand-primary text-txt-inverted font-bold'
                              : 'bg-bg-base text-txt-muted hover:text-txt-primary border border-border-default'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>رد واتساب للعميل</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMessageMode('NOTE')}
                          className={`text-xs px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                            messageMode === 'NOTE'
                              ? 'bg-status-warning text-txt-inverted font-bold'
                              : 'bg-bg-base text-txt-muted hover:text-txt-primary border border-border-default'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>ملاحظة داخلية</span>
                        </button>
                      </div>

                      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={
                            messageMode === 'REPLY'
                              ? 'اكتب رسالة واتساب للعميل في هذه التذكرة...'
                              : 'اكتب ملاحظة داخلية يراها الموظفون فقط...'
                          }
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          className="flex-1 h-9 px-3 rounded-md bg-bg-base border border-border-default text-txt-primary text-xs focus:outline-none focus:border-brand-primary transition-colors"
                        />
                        <Button
                          type="submit"
                          variant={messageMode === 'REPLY' ? 'primary' : 'outline'}
                          size="sm"
                          className="h-9 px-4 shrink-0"
                          isLoading={replyMutation.isPending || noteMutation.isPending}
                          icon={Send}
                          disabled={!messageText.trim()}
                        >
                          {messageMode === 'REPLY' ? 'إرسال' : 'حفظ الملاحظة'}
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-bg-base/40">
                <div className="flex items-center justify-between pb-2 border-b border-border-default">
                  <h4 className="text-xs font-bold text-txt-primary flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-brand-primary" />
                    <span>سجل النشاط والأحداث للتذكرة</span>
                  </h4>
                  <span className="text-[11px] text-txt-dim font-mono">{logs.length} أحداث</span>
                </div>

                {logs.length === 0 ? (
                  <div className="text-center py-10 text-xs text-txt-muted">لا توجد أحداث مسجلة بعد.</div>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 bg-bg-surface border border-border-default rounded-lg text-xs flex items-start gap-3"
                      >
                        <div className="w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 mt-0.5">
                          {log.action === 'CREATED' && <Plus className="w-3.5 h-3.5" />}
                          {log.action === 'ASSIGNED' && <Headset className="w-3.5 h-3.5" />}
                          {log.action === 'REPLIED' && <Send className="w-3.5 h-3.5" />}
                          {log.action === 'NOTE_ADDED' && <FileText className="w-3.5 h-3.5" />}
                          {log.action === 'RESOLVED' && <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />}
                          {log.action === 'CLOSED' && <XCircle className="w-3.5 h-3.5 text-status-danger" />}
                          {log.action === 'FEEDBACK_RECEIVED' && <Star className="w-3.5 h-3.5 text-status-warning" />}
                          {log.action === 'TAKEOVER' && <Shield className="w-3.5 h-3.5 text-brand-primary" />}
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-txt-primary">
                              {log.action === 'CREATED' && 'تم فتح التذكرة'}
                              {log.action === 'ASSIGNED' && 'تم تعيين / استلام التذكرة'}
                              {log.action === 'REPLIED' && 'إرسال رد واتساب'}
                              {log.action === 'NOTE_ADDED' && 'إضافة ملاحظة داخلية'}
                              {log.action === 'RESOLVED' && 'تم حل التذكرة'}
                              {log.action === 'CLOSED' && 'إغلاق التذكرة نهائياً'}
                              {log.action === 'FEEDBACK_RECEIVED' && 'استلام تقييم العميل'}
                              {log.action === 'TAKEOVER' && 'سحب التذكرة للمشرف'}
                            </span>
                            <span className="text-[10px] text-txt-dim">
                              {new Date(log.createdAt).toLocaleString('ar-EG')}
                            </span>
                          </div>

                          <p className="text-[11px] text-txt-muted">
                            بواسطة: <strong>{log.actor?.name || log.actorName || log.actorType}</strong>
                          </p>

                          {log.details && (
                            <div className="text-[10px] text-txt-dim font-mono bg-bg-base p-1.5 rounded mt-1">
                              {JSON.stringify(log.details)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <Tag className="w-10 h-10 text-txt-dim" />
            <h3 className="text-sm font-bold text-txt-primary">اختر تذكرة لعرض شات الدعم</h3>
            <p className="text-xs text-txt-muted">
              أو افتح تذكرة جديدة للبدء في حل مشكلة العميل
            </p>
          </div>
        )}
      </div>

      {}
      <Modal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        title="فتح تذكرة دعم أو شكوى جديدة"
        size="md"
      >
        <form onSubmit={handleCreateNewTicket} className="space-y-4">
          <Input
            label="رقم هاتف العميل"
            placeholder="مثال: +201012345678"
            dir="ltr"
            icon={Phone}
            value={newTicketForm.customerPhone}
            onChange={(e) => setNewTicketForm({ ...newTicketForm, customerPhone: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="نوع التذكرة"
              options={[
                { value: 'SUPPORT', label: 'دعم فني عام' },
                { value: 'COMPLAINT', label: 'شكوى بخصوص طلب' },
                { value: 'ORDER', label: 'طلب طعام' },
                { value: 'INQUIRY', label: 'استفسار' },
              ]}
              value={newTicketForm.ticketType}
              onChange={(e) => setNewTicketForm({ ...newTicketForm, ticketType: e.target.value })}
            />

            <Input
              label="موضوع أو عنوان التذكرة"
              placeholder="مثال: شكوى تأخر أوردر #104"
              value={newTicketForm.subject}
              onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
            />
          </div>

          <Input
            label="رسالة البداية (اختياري)"
            placeholder="اكتب استفسار أو مشكلة العميل..."
            value={newTicketForm.initialMessage}
            onChange={(e) => setNewTicketForm({ ...newTicketForm, initialMessage: e.target.value })}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-default">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewTicketModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createMutation.isPending}
              icon={Plus}
            >
              فتح التذكرة الآن
            </Button>
          </div>
        </form>
      </Modal>

      {}
      <Modal
        isOpen={isCloseResolutionModalOpen}
        onClose={() => setIsCloseResolutionModalOpen(false)}
        title="نموذج إغلاق التذكرة وتوثيق الحل"
        size="md"
      >
        <form onSubmit={handleConfirmClose} className="space-y-4">
          <div className="p-3 bg-status-danger-bg/20 border border-status-danger/30 rounded-lg text-xs text-status-danger space-y-1">
            <strong className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              تنبيه مهم:
            </strong>
            <p>
              إغلاق التذكرة هو إجراء نهائي لا يمكن التراجع عنه أو إعادة فتح التذكرة بعده. وسيتم إرسال استبيان تقييم فوري للعميل عبر الواتساب.
            </p>
          </div>

          <Select
            label="هل تم حل المشكلة مع العميل؟"
            options={[
              { value: 'RESOLVED', label: 'تم حل المشكلة بنجاح (Resolved)' },
              { value: 'UNRESOLVED', label: 'تعذر الحل / عدم تجاوب العميل (Unresolved)' },
              { value: 'CANCELLED', label: 'إلغاء التذكرة - طلب مكرر أو خاطئ (Cancelled)' },
            ]}
            value={closeResolutionForm.resolutionStatus}
            onChange={(e) =>
              setCloseResolutionForm({ ...closeResolutionForm, resolutionStatus: e.target.value })
            }
          />

          <Select
            label="تصنيف سبب المشكلة / نوع الاستفسار"
            options={[
              { value: 'GENERAL_INQUIRY', label: 'استفسار عام / معلومات عن المنيو والفرع' },
              { value: 'LATE_DELIVERY', label: 'تأخر وقت التوصيل (Delivery Delay)' },
              { value: 'FOOD_QUALITY', label: 'جودة الطعام والتحضير (Food Quality)' },
              { value: 'WRONG_ITEM', label: 'طلب غير مكتمل / صنف ناقص أو خاطئ' },
              { value: 'PAYMENT_ISSUE', label: 'مشكلة في الحساب والدفع' },
              { value: 'OTHER', label: 'سبب آخر' },
            ]}
            value={closeResolutionForm.resolutionCategory}
            onChange={(e) =>
              setCloseResolutionForm({ ...closeResolutionForm, resolutionCategory: e.target.value })
            }
          />

          <div>
            <label className="block text-xs font-bold text-txt-primary mb-1">
              ملاحظات وتفاصيل الإغلاق والحل:
            </label>
            <textarea
              rows={3}
              placeholder="اكتب الإجراء الذي تم اتخاذه (مثال: تم التواصل مع العميل والاعتذار وإرسال طبق تعويضي مع الأوردر القادم)..."
              value={closeResolutionForm.resolutionNotes}
              onChange={(e) =>
                setCloseResolutionForm({ ...closeResolutionForm, resolutionNotes: e.target.value })
              }
              className="w-full p-3 rounded-md bg-bg-base border border-border-default text-txt-primary text-xs focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-default">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCloseResolutionModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={closeMutation.isPending}
              icon={XCircle}
            >
              تأكيد الإغلاق وإرسال التقييم
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
