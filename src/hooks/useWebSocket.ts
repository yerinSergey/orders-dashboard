import { useEffect, useRef, useState, useCallback } from 'react';
import type { ConnectionStatus, WebSocketMessage, Order } from '@/features/orders/types';
import { MockWebSocket } from '@/services/mockWebSocket';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  enableRandomDisconnect?: boolean;
  randomDisconnectProbability?: number;
}

interface UseWebSocketReturn {
  status: ConnectionStatus;
  connect: () => void;
  disconnect: () => void;
  simulateDisconnect: () => void;
  reconnectAttempts: number;
}

export function useWebSocket(
  initialOrders: Order[],
  onMessage: (message: WebSocketMessage) => void,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const { autoConnect = true, enableRandomDisconnect = false, randomDisconnectProbability = 0.05 } = options;

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef<MockWebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  // Keep onMessage ref up to date without triggering reconnection
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  // Initialize WebSocket
  useEffect(() => {
    const ws = new MockWebSocket(initialOrders, {
      enableRandomDisconnect,
      randomDisconnectProbability,
    });

    wsRef.current = ws;

    // Subscribe to status changes
    const unsubscribeStatus = ws.onStatusChange((newStatus) => {
      setStatus(newStatus);
      setReconnectAttempts(ws.getReconnectAttempts());
    });

    // Subscribe to messages
    const unsubscribeMessage = ws.onMessage((message) => {
      onMessageRef.current(message);
    });

    // Auto-connect if enabled
    if (autoConnect) {
      ws.connect();
    }

    // Cleanup on unmount
    return () => {
      unsubscribeStatus();
      unsubscribeMessage();
      ws.destroy();
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount/unmount

  // Update orders in WebSocket when they change externally
  const updateOrders = useCallback((orders: Order[]) => {
    wsRef.current?.updateOrders(orders);
  }, []);

  // Expose updateOrders for external use if needed
  useEffect(() => {
    updateOrders(initialOrders);
  }, [initialOrders, updateOrders]);

  const connect = useCallback(() => {
    wsRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.disconnect();
  }, []);

  const simulateDisconnect = useCallback(() => {
    wsRef.current?.simulateDisconnect();
  }, []);

  return {
    status,
    connect,
    disconnect,
    simulateDisconnect,
    reconnectAttempts,
  };
}
