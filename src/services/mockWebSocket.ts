import type { ConnectionStatus, WebSocketMessage, Order, OrderStatusUpdate } from '@/features/orders/types';
import { WEBSOCKET_CONFIG } from '@/features/orders/constants';
import { generateNewOrder, generateRandomStatusUpdate } from '@/utils/mockDataGenerator';

type MessageHandler = (message: WebSocketMessage) => void;
type StatusChangeHandler = (status: ConnectionStatus) => void;

interface MockWebSocketOptions {
  enableRandomDisconnect?: boolean;
  randomDisconnectProbability?: number;
}

export class MockWebSocket {
  private status: ConnectionStatus = 'disconnected';
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusChangeHandlers: Set<StatusChangeHandler> = new Set();
  private messageInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private orders: Order[] = [];
  private options: MockWebSocketOptions;

  constructor(initialOrders: Order[], options: MockWebSocketOptions = {}) {
    this.orders = initialOrders;
    this.options = {
      enableRandomDisconnect: options.enableRandomDisconnect ?? false,
      randomDisconnectProbability: options.randomDisconnectProbability ?? 0.05,
    };
  }

  connect(): void {
    if (this.status === 'connected') return;

    this.setStatus('reconnecting');

    // Simulate connection delay
    setTimeout(() => {
      this.setStatus('connected');
      this.reconnectAttempts = 0;
      this.startMessageEmission();
    }, 500);
  }

  disconnect(): void {
    this.cleanup();
    this.setStatus('disconnected');
    this.reconnectAttempts = 0;
  }

  simulateDisconnect(): void {
    this.cleanup();
    this.setStatus('disconnected');
    this.scheduleReconnect();
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  onStatusChange(handler: StatusChangeHandler): () => void {
    this.statusChangeHandlers.add(handler);
    // Immediately call with current status
    handler(this.status);
    return () => {
      this.statusChangeHandlers.delete(handler);
    };
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  updateOrders(orders: Order[]): void {
    this.orders = orders;
  }

  destroy(): void {
    this.cleanup();
    this.messageHandlers.clear();
    this.statusChangeHandlers.clear();
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.statusChangeHandlers.forEach((handler) => {
      handler(status);
    });
  }

  private cleanup(): void {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
      this.messageInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private startMessageEmission(): void {
    this.scheduleNextMessage();
  }

  private scheduleNextMessage(): void {
    if (this.status !== 'connected') return;

    const delay = this.getRandomMessageInterval();

    this.messageInterval = setTimeout(() => {
      if (this.status !== 'connected') return;

      // Check for random disconnect (BONUS)
      if (this.options.enableRandomDisconnect && Math.random() < (this.options.randomDisconnectProbability ?? 0.05)) {
        this.simulateDisconnect();
        return;
      }

      this.emitMessage();
      this.scheduleNextMessage();
    }, delay);
  }

  private getRandomMessageInterval(): number {
    const { MIN_MESSAGE_INTERVAL, MAX_MESSAGE_INTERVAL } = WEBSOCKET_CONFIG;
    return Math.floor(Math.random() * (MAX_MESSAGE_INTERVAL - MIN_MESSAGE_INTERVAL + 1)) + MIN_MESSAGE_INTERVAL;
  }

  private emitMessage(): void {
    const message = this.generateMessage();
    if (message) {
      this.messageHandlers.forEach((handler) => {
        handler(message);
      });
    }
  }

  private generateMessage(): WebSocketMessage | null {
    // 50% chance of new order, 50% chance of status update
    const isNewOrder = Math.random() < 0.5;

    if (isNewOrder) {
      const newOrder = generateNewOrder(this.orders);
      this.orders = [...this.orders, newOrder];
      return {
        type: 'NEW_ORDER',
        payload: newOrder,
      };
    } else {
      const statusUpdate = generateRandomStatusUpdate(this.orders);
      if (statusUpdate) {
        // Update local orders array
        this.orders = this.orders.map((order) =>
          order.id === statusUpdate.id
            ? { ...order, status: statusUpdate.status, updatedAt: statusUpdate.updatedAt }
            : order
        );
        return {
          type: 'ORDER_UPDATE',
          payload: statusUpdate as OrderStatusUpdate,
        };
      }
      // If no updatable orders, create a new one instead
      const newOrder = generateNewOrder(this.orders);
      this.orders = [...this.orders, newOrder];
      return {
        type: 'NEW_ORDER',
        payload: newOrder,
      };
    }
  }

  private scheduleReconnect(): void {
    const delay = this.calculateReconnectDelay();
    this.setStatus('reconnecting');

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private calculateReconnectDelay(): number {
    const { INITIAL_RECONNECT_DELAY, MAX_RECONNECT_DELAY, BACKOFF_MULTIPLIER } = WEBSOCKET_CONFIG;
    const delay = INITIAL_RECONNECT_DELAY * Math.pow(BACKOFF_MULTIPLIER, this.reconnectAttempts);
    return Math.min(delay, MAX_RECONNECT_DELAY);
  }

  // For testing purposes
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  // For testing purposes
  getCurrentReconnectDelay(): number {
    return this.calculateReconnectDelay();
  }
}
