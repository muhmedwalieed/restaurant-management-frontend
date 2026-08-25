import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../modules/auth/context/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const SOCKET_URL = new URL(API_BASE_URL).origin;

// Each real-time event invalidates the affected react-query keys (prefix match).
const EVENT_INVALIDATIONS = {
  'order.created': [
    'orders',
    'all-orders',
    'kds',
    'dashboard-summary',
    'dashboard-channels',
    'dashboard-status',
    'dashboard-trend',
    'dashboard-branch-comparison',
    'tables',
    'table',
    'table-orders',
  ],
  'order.statusChanged': [
    'orders',
    'all-orders',
    'kds',
    'order',
    'order-history',
    'dashboard-summary',
    'dashboard-status',
    'dashboard-branch-comparison',
    'tables',
    'table',
    'table-orders',
  ],
  'order.paid': [
    'orders',
    'all-orders',
    'order',
    'dashboard-summary',
    'dashboard-channels',
    'dashboard-status',
    'dashboard-trend',
    'dashboard-branch-comparison',
  ],
  'notification.created': ['notifications', 'notifications-unread'],
  'conversation.assigned': ['whatsapp-conversations', 'whatsapp-conversation'],
  'conversation.updated': ['whatsapp-conversations', 'whatsapp-conversation'],
  'customer.updated': ['customers', 'customer', 'customer-orders', 'customer-addresses'],
  'tableSession.updated': ['table-session'],
};

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    Object.entries(EVENT_INVALIDATIONS).forEach(([event, keys]) => {
      socket.on(event, () => {
        keys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      });
    });

    socket.on('realtime.connected', () => {
      // Connection acknowledged by the server; nothing else to do.
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, isAuthenticated, queryClient]);

  return children;
};

export default SocketProvider;