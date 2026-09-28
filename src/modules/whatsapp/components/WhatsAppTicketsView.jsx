import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { TicketsSidebar } from './tickets/TicketsSidebar.jsx';
import { TicketHeader } from './tickets/TicketHeader.jsx';
import { TicketChatWindow } from './tickets/TicketChatWindow.jsx';
import { TicketClosedSummary } from './tickets/TicketClosedSummary.jsx';
import { TicketMessageInput } from './tickets/TicketMessageInput.jsx';
import { NewTicketModal } from './tickets/NewTicketModal.jsx';
import { CloseResolutionModal } from './tickets/CloseResolutionModal.jsx';
import { TemplatePickerModal } from './TemplatePickerModal.jsx';
import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '../../../shared/components/Button.jsx';

export const WhatsAppTicketsView = () => {
  const { user, hasPermission } = useAuth();
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activePaneTab, setActivePaneTab] = useState('CHAT');
  const [messageMode, setMessageMode] = useState('REPLY');
  const [messageText, setMessageText] = useState('');

  // Modals state
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isCloseResolutionModalOpen, setIsCloseResolutionModalOpen] = useState(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);

  const messagesEndRef = useRef(null);

  // Queries
  const {
    data: ticketsResponse,
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

  // Mutations
  const createMutation = useCreateTicketMutation();
  const replyMutation = useReplyTicketMutation();
  const noteMutation = useAddTicketNoteMutation();
  const assignMutation = useAssignTicketMutation();
  const closeMutation = useCloseTicketMutation();
  const takeoverMutation = useTakeoverTicketMutation();

  const isOwnerOrAdmin =
    user?.role === 'OWNER' ||
    user?.role === 'ADMIN' ||
    user?.role === 'owner' ||
    user?.role === 'admin' ||
    hasPermission?.('chats.takeover');

  const isClosed = activeTicket?.status === 'CLOSED';

  // Handlers
  const handleSendMessage = async () => {
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

  const handleCreateNewTicket = async (formData) => {
    const created = await createMutation.mutateAsync(formData);
    setIsNewTicketModalOpen(false);

    const newId = created?.data?.id || created?.id;
    if (newId) {
      setSelectedTicketId(newId);
    }
    refetchTickets();
  };

  const handleAssignToMe = async () => {
    if (!selectedTicketId) return;
    await assignMutation.mutateAsync({ id: selectedTicketId, agentId: user?.id });
    refetchDetail();
    refetchTickets();
  };

  const handleTakeover = async () => {
    if (!selectedTicketId) return;
    await takeoverMutation.mutateAsync(selectedTicketId);
    refetchDetail();
    refetchTickets();
  };

  const handleConfirmClose = async (resolutionData) => {
    if (!selectedTicketId) return;

    await closeMutation.mutateAsync({
      id: selectedTicketId,
      ...resolutionData,
    });

    setIsCloseResolutionModalOpen(false);
    refetchDetail();
    refetchTickets();
  };

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden flex flex-col md:flex-row h-[780px] w-full shadow-md">
      {/* Tickets List Sidebar */}
      <TicketsSidebar
        tickets={tickets}
        selectedTicketId={selectedTicketId}
        onSelectTicket={(id) => setSelectedTicketId(id)}
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        typeFilter={typeFilter}
        onChangeTypeFilter={setTypeFilter}
        statusFilter={statusFilter}
        onChangeStatusFilter={setStatusFilter}
        onOpenNewTicketModal={() => setIsNewTicketModalOpen(true)}
      />

      {/* Main Conversation Area */}
      <div className="flex-1 h-full min-w-0 flex flex-col bg-bg-surface overflow-hidden">
        {activeTicket ? (
          <>
            <TicketHeader
              ticket={activeTicket}
              currentUser={user}
              isOwnerOrAdmin={isOwnerOrAdmin}
              onAssignToMe={handleAssignToMe}
              onTakeover={handleTakeover}
              onOpenCloseModal={() => setIsCloseResolutionModalOpen(true)}
              isAssigning={assignMutation.isPending}
              isTakingOver={takeoverMutation.isPending}
            />

            <TicketChatWindow
              ticket={activeTicket}
              activeTab={activePaneTab}
              onSelectTab={setActivePaneTab}
              messagesEndRef={messagesEndRef}
            />

            {isClosed ? (
              <div className="p-3 bg-bg-surface border-t border-border-default shrink-0">
                <TicketClosedSummary ticket={activeTicket} />
              </div>
            ) : (
              <TicketMessageInput
                messageMode={messageMode}
                onChangeMode={setMessageMode}
                messageText={messageText}
                onChangeText={setMessageText}
                onSendMessage={handleSendMessage}
                onOpenTemplatePicker={() => setIsTemplatePickerOpen(true)}
                isLoading={replyMutation.isPending || noteMutation.isPending}
              />
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 bg-bg-base/30">
            <div className="w-16 h-16 rounded-2xl bg-bg-surface border border-border-default flex items-center justify-center shadow-sm">
              <MessageSquare className="w-7 h-7 text-txt-dim stroke-1" />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h3 className="text-sm font-bold text-txt-primary">اختر تذكرة لعرض المحادثة</h3>
              <p className="text-xs text-txt-muted leading-relaxed">
                اختر تذكرة من القائمة لعرض تفاصيلها ومحادثة الدعم، أو افتح تذكرة جديدة
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              icon={Plus}
              className="text-xs font-bold rounded-lg"
              onClick={() => setIsNewTicketModalOpen(true)}
            >
              فتح تذكرة جديدة
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        onSubmit={handleCreateNewTicket}
        isPending={createMutation.isPending}
      />

      <CloseResolutionModal
        isOpen={isCloseResolutionModalOpen}
        onClose={() => setIsCloseResolutionModalOpen(false)}
        onConfirmClose={handleConfirmClose}
        isPending={closeMutation.isPending}
      />

      <TemplatePickerModal
        isOpen={isTemplatePickerOpen}
        onClose={() => setIsTemplatePickerOpen(false)}
        onSelect={(renderedText) => {
          setMessageMode('REPLY');
          setMessageText(renderedText);
        }}
        ticket={activeTicket}
      />
    </div>
  );
};
