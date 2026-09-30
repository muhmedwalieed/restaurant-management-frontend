import React, { createContext, useContext, useEffect, useRef, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../modules/auth/context/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const SOCKET_URL = new URL(API_BASE_URL).origin;

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
  'conversation.assigned': [
    'whatsapp-conversations',
    'whatsapp-conversation',
    'inbox-tickets',
    'inbox-ticket',
  ],
  'conversation.updated': [
    'whatsapp-conversations',
    'whatsapp-conversation',
    'inbox-tickets',
    'inbox-ticket',
  ],
  'customer.updated': ['customers', 'customer', 'customer-orders', 'customer-addresses'],
  'tableSession.updated': ['table-session', 'table-session-active', 'table-sessions-branch', 'tables'],
  'menu.updated': ['products', 'categories', 'menu'],
  'product.updated': ['products', 'categories', 'menu'],
  'category.updated': ['products', 'categories', 'menu'],
};

const SocketContext = createContext({
  isConnected: false,
  socket: null,
});

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    Object.entries(EVENT_INVALIDATIONS).forEach(([event, keys]) => {
      socket.on(event, () => {
        keys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [token, isAuthenticated, queryClient]);

  const value = useMemo(
    () => ({
      isConnected,
      socket: socketRef.current,
    }),
    [isConnected]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  return useContext(SocketContext);
};

export default SocketProvider;
